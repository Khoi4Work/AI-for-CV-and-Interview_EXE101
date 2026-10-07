// src/hooks/useElevenLabsTTS.js
import { useRef, useCallback, useEffect } from 'react';
import { fetchElevenLabsAudio } from '../services/elevenLabsService';

export function useElevenLabsTTS(onAudioEnd, {onAudioElement, onFallback} = {}) {
    const audioRef = useRef(null);
    const audioUrlRef = useRef(null);
    const requestControllerRef = useRef(null);

    const stopAudio = useCallback(() => {
        requestControllerRef.current?.abort();
        requestControllerRef.current = null;
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

    const playTTS = useCallback(async (text, questionId, language = 'vi', transition = 'START') => {
        stopAudio(); // Dừng âm thanh cũ (nếu có) trước khi phát cái mới
        const requestController = new AbortController();
        requestControllerRef.current = requestController;

        try {
            if (!questionId) throw new Error('Question audio requires a backend question ID.');
            const url = await fetchElevenLabsAudio(questionId, transition, requestController.signal);
            if (requestController.signal.aborted || requestControllerRef.current !== requestController) {
                URL.revokeObjectURL(url);
                return;
            }
            audioUrlRef.current = url;
            const audio = new Audio(url);
            audioRef.current = audio;
            onAudioElement?.(audio);

            audio.onended = () => {
                if (onAudioEnd) onAudioEnd();
                stopAudio();
            };

            await audio.play();
        } catch (error) {
            if (requestController.signal.aborted || error?.code === 'ERR_CANCELED') return;
            console.error("Backend TTS lỗi, dùng giọng mặc định:", error);
            stopAudio();
            onFallback?.();

            // Fallback: Web Speech API
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language === 'en' ? 'en-US' : 'vi-VN';
            utterance.rate = 1.0;
            utterance.onend = () => {
                if (onAudioEnd) onAudioEnd();
            };
            window.speechSynthesis.speak(utterance);
        }
    }, [stopAudio, onAudioEnd, onAudioElement, onFallback]);

    // Tự động dọn dẹp khi component chứa hook này bị hủy (unmount)
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, [stopAudio]);

    return { playTTS, stopAudio };
}
