const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

class ElevenLabsTranscriptionClient {
    constructor(onTranscript) {
        this.onTranscript = onTranscript;
        this.socket = null;
        this.audioContext = null;
        this.processor = null;
        this.source = null;
    }

    /**
     * Khởi tạo STT Client sử dụng MediaStream có sẵn từ MediaContext
     * @param {MediaStream} stream - Luồng âm thanh được quản lý bởi useMediaDevices
     */
    async start(stream) {
        try {
            if (!ELEVENLABS_API_KEY) {
                throw new Error('Thiếu cấu hình VITE_ELEVENLABS_API_KEY trong file .env');
            }

            console.log(`[ElevenLabs] Đang lấy Single-Use Token từ máy chủ...`);

            // 1. Gọi API REST để đổi API Key lấy Token dùng 1 lần (Bypass lỗi 1000 Unauthenticated)
            const tokenResponse = await fetch("https://api.elevenlabs.io/v1/single-use-token/realtime_scribe", {
                method: "POST",
                headers: {
                    "xi-api-key": ELEVENLABS_API_KEY
                }
            });

            if (!tokenResponse.ok) {
                throw new Error(`Lỗi xác thực Token ElevenLabs: ${tokenResponse.status}`);
            }

            const { token } = await tokenResponse.json();
            console.log(`[ElevenLabs] Đã có Token! Đang kết nối Scribe Realtime...`);

            // 2. Mở kết nối WebSocket bằng Token vừa lấy
            const url = `wss://api.elevenlabs.io/v1/speech-to-text/realtime?model_id=scribe_v2_realtime&language_code=vi&commit_strategy=vad`;
            this.socket = new WebSocket(`${url}&token=${token}`);

            const connectPromise = new Promise((resolve, reject) => {
                this.socket.onopen = () => {
                    console.log('[ElevenLabs] WebSocket kết nối thành công.');
                    resolve();
                };
                this.socket.onerror = (err) => {
                    console.error('[ElevenLabs] WebSocket lỗi:', err);
                    reject(err);
                };
                setTimeout(() => reject(new Error('ElevenLabs connection timeout')), 10000);
            });

            // 3. Xử lý phản hồi từ ElevenLabs
            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.message_type === "partial_transcript" || data.message_type === "committed_transcript") {
                        const transcript = data.text || '';
                        if (transcript) {
                            this.onTranscript({
                                transcript: transcript,
                                isFinal: data.message_type === "committed_transcript",
                            });
                        }
                    } else if (data.message_type === "error") {
                        console.error("[ElevenLabs] Lỗi từ máy chủ:", data);
                    }
                } catch (e) {
                    console.error('[ElevenLabs] Lỗi xử lý message:', e);
                }
            };

            this.socket.onclose = (event) => {
                console.log(`[ElevenLabs] Connection closed. Code: ${event.code}`);
            };

            await connectPromise;

            // 4. Móc nối trực tiếp vào luồng stream của MediaContext
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 16000,
            });

            this.source = this.audioContext.createMediaStreamSource(stream);
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            this.processor.onaudioprocess = (e) => {
                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmData = this.floatTo16BitPCM(inputData);
                    const base64Audio = this.bufferToBase64(pcmData);

                    // Đóng gói âm thanh thành chunk và gửi lên server
                    this.socket.send(JSON.stringify({
                        message_type: "input_audio_chunk",
                        audio_base_64: base64Audio
                    }));
                }
            };

            this.source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

        } catch (error) {
            console.error('Lỗi khi khởi chạy ElevenLabs:', error);
            throw error;
        }
    }

    /**
     * Chuyển đổi bộ đệm nhị phân sang định dạng Base64
     */
    bufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    /**
     * Chuyển đổi tín hiệu âm thanh Float32 sang Int16 PCM (Yêu cầu bắt buộc của Server)
     */
    floatTo16BitPCM(input) {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return output.buffer;
    }

    /**
     * Dọn dẹp tài nguyên âm thanh và ngắt kết nối WebSocket
     */
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
            this.socket.close();
            this.socket = null;
        }
    }
}

export default ElevenLabsTranscriptionClient;