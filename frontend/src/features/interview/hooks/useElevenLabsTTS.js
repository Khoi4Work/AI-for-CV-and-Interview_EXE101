// src/hooks/useElevenLabsTTS.js
import { useRef, useCallback, useEffect } from 'react';
import { fetchElevenLabsAudio } from '../services/elevenLabsService';

export function useElevenLabsTTS(onAudioEnd) {
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = null;
        }
        window.speechSynthesis.cancel(); // Tắt luôn cả giọng mặc định nếu đang chạy
    }, []);

    const playTTS = useCallback(async (text, questionId, language = 'vi') => {
        stopAudio(); // Dừng âm thanh cũ (nếu có) trước khi phát cái mới

        try {
            if (!questionId) throw new Error('Question audio requires a backend question ID.');
            const url = await fetchElevenLabsAudio(questionId);
            audioUrlRef.current = url;
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
                if (onAudioEnd) onAudioEnd();
                stopAudio();
            };

            await audio.play();
        } catch (error) {
            console.error("Backend TTS lỗi, dùng giọng mặc định:", error);
            stopAudio();

            // Fallback: Web Speech API
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'en' ? 'en-US' : 'vi-VN';
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
