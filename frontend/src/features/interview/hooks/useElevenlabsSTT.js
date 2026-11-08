import { interviewService } from '../services/interviewService.js';

const TARGET_SAMPLE_RATE = 16000;
const MAX_PENDING_AUDIO_CHUNKS = 120;
const CONNECTION_TIMEOUT_MS = 10000;
const STT_ERROR_TYPES = new Set([
    'commit_throttled',
    'invalid_request',
    'rate_limited',
    'quota_exceeded',
    'unaccepted_terms',
    'queue_overflow',
    'resource_exhausted',
    'session_time_limit_exceeded',
    'chunk_size_exceeded',
    'insufficient_audio_activity',
]);

class ElevenLabsTranscriptionClient {
    constructor(onTranscript, onError = () => {}) {
        this.onTranscript = onTranscript;
        this.onError = onError;
        this.socket = null;
        this.audioContext = null;
        this.processor = null;
        this.source = null;
        this.connectionPromise = null;
        this.tokenPromise = null;
        this.token = null;
        this.rejectPendingConnection = null;
        this.connectionTimeout = null;
        this.pendingAudioChunks = [];
        this.isReady = false;
        this.isStopping = false;
        this.hasReportedError = false;
    }

    connect(sessionId, languageCode = 'vi') {
        if (this.isReady) return Promise.resolve();
        if (this.connectionPromise) return this.connectionPromise;
        if (!sessionId) return Promise.reject(new Error('Cần có phiên phỏng vấn hợp lệ để kết nối ElevenLabs.'));

        this.isStopping = false;
        this.connectionPromise = new Promise((resolve, reject) => {
            let settled = false;
            const settle = (callback, value) => {
                if (settled) return;
                settled = true;
                window.clearTimeout(this.connectionTimeout);
                this.connectionTimeout = null;
                this.rejectPendingConnection = null;
                callback(value);
            };
            const fail = (error) => settle(reject, error instanceof Error ? error : new Error('Không thể kết nối ElevenLabs STT.'));

            this.rejectPendingConnection = fail;
            this.connectionTimeout = window.setTimeout(
                () => fail(new Error('Hết thời gian kết nối ElevenLabs STT.')),
                CONNECTION_TIMEOUT_MS,
            );

            const openSocket = async () => {
                try {
                    const token = await this.prepare(sessionId);
                    if (settled || this.isStopping) return;

                    const params = new URLSearchParams({
                        model_id: 'scribe_v2_realtime',
                        audio_format: 'pcm_16000',
                        language_code: languageCode,
                        commit_strategy: 'vad',
                        token,
                    });
                    this.socket = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/realtime?${params}`);

                    this.socket.onmessage = (event) => {
                        let message;
                        try {
                            message = JSON.parse(event.data);
                        } catch {
                            this.reportRuntimeError(new Error('ElevenLabs trả về dữ liệu transcript không hợp lệ.'));
                            return;
                        }

                        if (message.message_type === 'session_started') {
                            if (settled || this.isStopping) return;
                            this.isReady = true;
                            this.flushPendingAudio();
                            settle(resolve);
                        } else if (message.message_type === 'partial_transcript' || message.message_type === 'committed_transcript') {
                            if (message.text) {
                                this.onTranscript({
                                    transcript: message.text,
                                    isFinal: message.message_type === 'committed_transcript',
                                });
                            }
                        } else if (message.message_type === 'error' || message.message_type?.endsWith('_error')
                            || STT_ERROR_TYPES.has(message.message_type)) {
                            const error = new Error(message.error || message.message || `ElevenLabs STT báo lỗi: ${message.message_type}`);
                            if (!this.isReady) fail(error);
                            else this.reportRuntimeError(error);
                        }
                    };

                    this.socket.onerror = () => {
                        const error = new Error('WebSocket ElevenLabs STT gặp lỗi.');
                        if (!this.isReady) fail(error);
                        else this.reportRuntimeError(error);
                    };
                    this.socket.onclose = (event) => {
                        if (this.isStopping) return;
                        const error = new Error(`Kết nối ElevenLabs STT đã đóng (mã ${event.code}).`);
                        if (!this.isReady) fail(error);
                        else this.reportRuntimeError(error);
                    };
                } catch (error) {
                    fail(error);
                }
            };

            openSocket();
        });

        return this.connectionPromise;
    }

    prepare(sessionId) {
        if (this.token) return Promise.resolve(this.token);
        if (this.tokenPromise) return this.tokenPromise;
        if (!sessionId) return Promise.reject(new Error('Cần có phiên phỏng vấn hợp lệ để lấy token ElevenLabs.'));

        this.tokenPromise = interviewService.createSttToken(sessionId).then(({token}) => {
            if (this.isStopping) throw new Error('Yêu cầu token ElevenLabs STT đã bị hủy.');
            if (!token) throw new Error('Backend không trả về token ElevenLabs STT.');
            this.token = token;
            return token;
        }).finally(() => {
            this.tokenPromise = null;
        });
        return this.tokenPromise;
    }

    async start(stream, sessionId, languageCode = 'vi') {
        if (!stream) throw new Error('Không có luồng micro để gửi tới ElevenLabs.');
        if (!this.processor) await this.attachAudio(stream);
        await this.connect(sessionId, languageCode);
    }

    async attachAudio(stream) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) throw new Error('Trình duyệt không hỗ trợ AudioContext.');

        this.audioContext = new AudioContextClass({ sampleRate: TARGET_SAMPLE_RATE });
        if (this.audioContext.state === 'suspended') await this.audioContext.resume();

        this.source = this.audioContext.createMediaStreamSource(stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.processor.onaudioprocess = (event) => {
            if (this.isStopping) return;
            const input = event.inputBuffer.getChannelData(0);
            const resampled = this.resampleToTargetRate(input, this.audioContext.sampleRate);
            const audio = this.bufferToBase64(this.floatTo16BitPCM(resampled));
            const message = JSON.stringify({
                message_type: 'input_audio_chunk',
                audio_base_64: audio,
            });

            if (this.isReady && this.socket?.readyState === WebSocket.OPEN) {
                this.send(message);
                return;
            }

            if (this.pendingAudioChunks.length >= MAX_PENDING_AUDIO_CHUNKS) {
                this.reportRuntimeError(new Error('ElevenLabs STT kết nối quá chậm; bộ đệm âm thanh đã đầy.'));
                return;
            }
            this.pendingAudioChunks.push(message);
        };

        this.source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
    }

    flushPendingAudio() {
        if (this.socket?.readyState !== WebSocket.OPEN) return;
        const chunks = this.pendingAudioChunks.splice(0);
        chunks.forEach((chunk) => this.send(chunk));
    }

    send(message) {
        try {
            if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(message);
        } catch (error) {
            this.reportRuntimeError(error);
        }
    }

    reportRuntimeError(error) {
        if (this.isStopping || this.hasReportedError) return;
        this.hasReportedError = true;
        if (!this.isReady) this.rejectPendingConnection?.(error);
        this.onError(error);
    }

    resampleToTargetRate(input, sourceSampleRate) {
        if (sourceSampleRate === TARGET_SAMPLE_RATE) return input;
        const outputLength = Math.floor(input.length * TARGET_SAMPLE_RATE / sourceSampleRate);
        const output = new Float32Array(outputLength);
        const ratio = sourceSampleRate / TARGET_SAMPLE_RATE;

        for (let i = 0; i < outputLength; i++) {
            const sourceIndex = i * ratio;
            const lowerIndex = Math.floor(sourceIndex);
            const upperIndex = Math.min(lowerIndex + 1, input.length - 1);
            const interpolation = sourceIndex - lowerIndex;
            output[i] = input[lowerIndex] * (1 - interpolation) + input[upperIndex] * interpolation;
        }
        return output;
    }

    bufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let offset = 0; offset < bytes.length; offset += chunkSize) {
            binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
        }
        return window.btoa(binary);
    }

    floatTo16BitPCM(input) {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const sample = Math.max(-1, Math.min(1, input[i]));
            output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        return output.buffer;
    }

    stop() {
        this.isStopping = true;
        window.clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
        this.rejectPendingConnection?.(new Error('Kết nối ElevenLabs STT đã bị hủy.'));
        this.pendingAudioChunks = [];

        if (this.processor) {
            this.processor.disconnect();
            this.processor.onaudioprocess = null;
            this.processor = null;
        }
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        if (this.audioContext) {
            this.audioContext.close().catch(() => {});
            this.audioContext = null;
        }
        if (this.socket) {
            this.socket.onclose = null;
            this.socket.onerror = null;
            this.socket.onmessage = null;
            this.socket.close();
            this.socket = null;
        }
        this.isReady = false;
        this.token = null;
        this.tokenPromise = null;
        this.connectionPromise = null;
    }
}

export default ElevenLabsTranscriptionClient;
