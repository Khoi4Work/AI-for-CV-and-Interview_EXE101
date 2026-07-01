// src/hooks/useElevenLabsTTS.js
import { useRef, useCallback, useEffect } from 'react';
import { fetchElevenLabsAudio } from '../services/elevenLabsService';

export function useElevenLabsTTS(onAudioEnd) {
    const audioRef = useRef(null);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        window.speechSynthesis.cancel(); // Tắt luôn cả giọng mặc định nếu đang chạy
    }, []);

    const playTTS = useCallback(async (text) => {
        stopAudio(); // Dừng âm thanh cũ (nếu có) trước khi phát cái mới

        try {
            const url = await fetchElevenLabsAudio(text);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
                if (onAudioEnd) onAudioEnd();
                URL.revokeObjectURL(url); // Giải phóng RAM
            };

            await audio.play();
        } catch (error) {
            console.error("ElevenLabs TTS lỗi, dùng giọng mặc định:", error);

            // Fallback: Web Speech API
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'vi-VN';
            utterance.rate = 1.0;
            utterance.onend = () => {
                if (onAudioEnd) onAudioEnd();
            };
            window.speechSynthesis.speak(utterance);
        }
    }, [stopAudio, onAudioEnd]);

    // Tự động dọn dẹp khi component chứa hook này bị hủy (unmount)
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, [stopAudio]);

    return { playTTS, stopAudio };
}