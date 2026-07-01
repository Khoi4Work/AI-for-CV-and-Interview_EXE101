// src/services/elevenLabsService.js
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

// Khởi tạo Client
// Lưu ý: Cấu hình biến môi trường tùy thuộc vào Vite (import.meta.env) hoặc Create React App (process.env)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ADAM_VOICE = 'pNInz6obpgDQGcFmaJgB'

const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});

export const fetchElevenLabsAudio = async (text, voiceId = ADAM_VOICE) => {
    try {
        const response = await client.textToSpeech.convert(voiceId, {
            text: text,
            model_id: "eleven_turbo_v2_5",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.0,
                // use_speaker_boost: true
            }
        });

        // SDK trả về một AsyncIterable/Stream.
        // Trong trình duyệt, ta cần gom các mảnh dữ liệu (chunks) lại
        const chunks = [];
        for await (const chunk of response) {
            chunks.push(chunk);
        }

        // Tạo file âm thanh ảo trên RAM của trình duyệt
        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        return URL.createObjectURL(blob);

    } catch (error) {
        console.error("Lỗi khi gọi package ElevenLabs:", error);
        throw error;
    }
};