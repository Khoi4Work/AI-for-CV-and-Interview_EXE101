const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

class DeepgramTranscriptionClient {
    constructor(onTranscript) {
        this.onTranscript = onTranscript;
        this.socket = null;
        this.audioContext = null;
        this.processor = null;
        this.source = null;
    }

    async start(stream) {
        try {
            if (!DEEPGRAM_API_KEY) {
                throw new Error('Deepgram API Key is missing. Please check your .env file for VITE_DEEPGRAM_API_KEY');
            }

            console.log(`[Deepgram] Attempting native WebSocket connection...`);

            // 1. SỬA ĐỔI: Bỏ phần &token=${DEEPGRAM_API_KEY} ra khỏi URL
            const url = `wss://api.deepgram.com/v1/listen?model=nova-2&language=vi&smart_format=true&encoding=linear16&sample_rate=16000&interim_results=true`;
            // 2. SỬA ĐỔI QUAN TRỌNG: Truyền API Key qua sub-protocol mảng ['token', DEEPGRAM_API_KEY]
            this.socket = new WebSocket(url, ['token', DEEPGRAM_API_KEY]);
            this.socket.binaryType = 'arraybuffer';

            // Wrap the socket open event in a promise to ensure we are connected before sending audio
            const connectPromise = new Promise((resolve, reject) => {
                this.socket.onopen = () => {
                    console.log('[Deepgram] WebSocket connected successfully.');
                    resolve();
                };
                this.socket.onerror = (err) => {
                    console.error('[Deepgram] WebSocket error:', err);
                    reject(err);
                };

                // Initial timeout if connection takes too long
                setTimeout(() => reject(new Error('Deepgram connection timeout')), 10000);
            });

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.channel?.alternatives?.[0]) {
                        const alt = data.channel.alternatives[0];
                        const transcript = alt.transcript;
                        if (transcript) {
                            this.onTranscript({
                                transcript: transcript,
                                isFinal: data.is_final || alt.is_final, // Kiểm tra kĩ flag is_final của Deepgram
                            });
                        }
                    }
                } catch (e) {
                    console.error('[Deepgram] Error parsing message:', e);
                }
            };

            this.socket.onclose = (event) => {
                console.log(`[Deepgram] Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
                if (event.code === 1006) {
                    console.error('[Deepgram] Lỗi 1006 (Abnormal Closure): Có thể do VITE_DEEPGRAM_API_KEY chưa chính xác hoặc hết hạn.');
                }
            };

            await connectPromise;

            // --- Audio Processing ---
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000,
            });

            this.source = this.audioContext.createMediaStreamSource(stream);
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (e) => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = this.floatTo16BitPCM(inputData);
                    this.socket.send(pcmData);
                }
            };

            this.source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

        } catch (error) {
            console.error('Failed to start Deepgram transcription:', error);
            throw error;
        }
    }

    floatTo16BitPCM(input) {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return output.buffer;
    }

    stop() {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        if (this.socket) {
            // Gửi gói tin rỗng báo hiệu kết thúc luồng dữ liệu trước khi ngắt hẳn kết nối kết nối (Best practice của Deepgram)
            if (this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ type: 'CloseStream' }));
            }
            this.socket.close();
            this.socket = null;
        }
    }
}

export default DeepgramTranscriptionClient;