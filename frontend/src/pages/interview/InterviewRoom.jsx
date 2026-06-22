// /src/pages/interview/InterviewRoom.jsx
// High-fidelity interview room với:
// - State machine: idle → asking (2.5s ẩn text) → recording (hiện text + mic + VAD) → processing (1.2s) → between (5s) → asking
// - Mic thật: getUserMedia + AnalyserNode để VAD
// - Cụm kết: regex VN + EN
// - 10s im lặng trong câu → skip
// - 5s im lặng giữa câu → skip
// - 2 skip liên tiếp (bất kỳ loại) → auto-end
// - KHÔNG side panel, KHÔNG suggestion, KHÔNG nút End
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import {Clock, Mic, MicOff, Volume2, ArrowRight, Settings as SettingsIcon, Sparkles} from 'lucide-react';
import {useInterviewSession} from '../../hooks/useInterviewSession';
import {END_PHRASES_VN, END_PHRASES_EN} from '../../constants/interview/questionBank.js';// ms
const PROCESSING_DURATION = 1200;
const IN_QUESTION_TIMEOUT = 600000;
const VAD_THRESHOLD = 55;
const END_SILENCE_MS = 10000; // 10s im lặng sau nói cuối → kết thúc câu
const START_SILENCE_MS = 6000;
const END_PHRASE_REGEX = new RegExp(
    `(${END_PHRASES_VN.concat(END_PHRASES_EN).join('|')})`,
    'i'
);

export function InterviewRoom() {
    const navigate = useNavigate();
    const {data, update, generateQuestions, generateFeedback, saveAnswer, addTranscript} = useInterviewSession();

    useEffect(() => {
        update({step: 8});
        // RESET skipStreak và transcriptLog khi bắt đầu vào phòng phỏng vấn để tránh dữ liệu cũ
        update({skipStreak: 0, transcriptLog: []});
        if (!data.questions || data.questions.length === 0) {
            if (typeof generateQuestions === 'function') {
                try {
                    const result = generateQuestions();
                    if (result instanceof Promise) result.catch(console.error);
                } catch (err) {
                    console.error("Lỗi khi chạy generateQuestions:", err);
                }
            }
        }
    }, []); // Run only once on mount

    const setStep = (n) => update({step: n});

    const [phase, setPhase] = useState('asking'); // asking | recording | processing | between | done
    const [currentIndex, setCurrentIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [micState, setMicState] = useState('idle'); // idle | requesting | active | denied
    const [audioLevels, setAudioLevels] = useState(new Array(20).fill(0));
    const [showCurrent, setShowCurrent] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');

    const streamRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationRef = useRef(null);
    const phaseTimerRef = useRef(null);
    const inQuestionTimerRef = useRef(null);
    const lastSpokeAtRef = useRef(null);
    const spokeDurationRef = useRef(0);
    const questionStartedAtRef = useRef(null);
    const lastTranscriptRef = useRef('');
    const interimTranscriptRef = useRef('');
    const phaseRef = useRef(phase);
    const currentIndexRef = useRef(currentIndex);
    const recorderRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const questions = useMemo(() => data.questions || [], [data.questions]);
    const currentQ = questions[currentIndex];

    // --- 1. Mic, STT & VAD Logic (Basic Tools) ---
    const setupMic = useCallback(async () => {
        setMicState('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            streamRef.current = stream;
            const AudioContextClass = window.AudioContext || window['webkitAudioContext'];
            const audioContext = new AudioContextClass();
            if (audioContext.state === 'suspended') await audioContext.resume();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            setMicState('active');
            return true;
        } catch (e) {
            setMicState('denied');
            return false;
        }
    }, []);

    const startSTT = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscriptText = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscriptText += transcript;
                }
            }

            if (finalTranscript) {
                lastTranscriptRef.current = (lastTranscriptRef.current + ' ' + finalTranscript).trim();
            }
            interimTranscriptRef.current = interimTranscriptText;
            setInterimTranscript(interimTranscriptText);
        };

        recognition.onerror = (err) => console.error("Speech Recognition Error:", err);
        recognition.onend = () => {
            if (phaseRef.current === 'recording') {
                recognition.start();
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, []);

    const stopSTT = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setInterimTranscript('');
    }, []);

    const stopMic = useCallback(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        analyserRef.current = null;
        setMicState('idle');
        setAudioLevels(new Array(20).fill(0));
    }, []);

    // --- 2. Transition Handlers ---
    const endInterview = useCallback(() => {
        setPhase('done');
        stopMic();
        stopSTT();
        generateFeedback();
        setTimeout(() => navigate('/interview/review'), 200);
    }, [generateFeedback, navigate, stopMic]);

    const transitionToNext = useCallback(() => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
            endInterview();
        } else {
            setCurrentIndex(nextIndex);
            setPhase('asking');
        }
    }, [currentIndex, questions, endInterview]);

    const transitionToProcessing = useCallback((skipped) => {
        if (phaseRef.current !== 'recording') return;
        if (recorderRef.current && recorderRef.current.state === 'recording') {
            recorderRef.current.stop();
        }
        stopSTT();

        // Gộp cả final transcript và interim transcript cuối cùng để không bị mất lời nói
        const finalPart = lastTranscriptRef.current.trim();
        const interimPart = interimTranscriptRef.current.trim();
        let answerText;

        if (finalPart && interimPart) {
            answerText = (finalPart + ' ' + interimPart).trim();
        } else {
            answerText = (finalPart || interimPart).trim();
        }

        if (!answerText) {
            answerText = skipped ? '' : '...';
        }

        const qid = questions[currentIndexRef.current]?.id;
        console.log('answer: '+ answerText)
        if (qid) {
            saveAnswer(qid, {
                qid,
                text: (skipped && !answerText) ? '' : (answerText || '...'),
                durationMs: Date.now() - (questionStartedAtRef.current || Date.now()),
                skipped: skipped && !answerText,
                startedAt: questionStartedAtRef.current,
                endedAt: Date.now(),
            });
        }

        lastTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        lastSpokeAtRef.current = null;
        spokeDurationRef.current = 0;
        setShowCurrent(false);

        setPhase('processing');
        if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);

        phaseTimerRef.current = setTimeout(() => {
            transitionToNext();
        }, PROCESSING_DURATION);
    }, [questions, saveAnswer, addTranscript, transitionToNext, stopSTT]);

    const startVAD = useCallback(() => {
        if (!analyserRef.current) return;
        const buf = new Uint8Array(analyserRef.current.frequencyBinCount);

        let lastFrameTime = Date.now();

        const tick = () => {
            const currentPhase = phaseRef.current;
            if (currentPhase !== 'recording') return;

            const now = Date.now();
            const delta = now - lastFrameTime; // Tính thời gian thực tế trôi qua giữa 2 frame
            lastFrameTime = now;

            analyserRef.current.getByteFrequencyData(buf);
            const sampleBins = Math.min(buf.length, 24);
            let sum = 0;
            for (let i = 0; i < sampleBins; i++) sum += buf[i];
            const avg = sum / sampleBins;

            setAudioLevels((prev) => prev.map((_, i) => {
                const variation = Math.abs(Math.sin((Date.now() / 200) + i));
                return avg > VAD_THRESHOLD ? 8 + (avg / 255) * 56 * variation : 4;
            }));

            if (avg > VAD_THRESHOLD) {
                if (currentPhase === 'recording') {
                    lastSpokeAtRef.current = Date.now();
                    spokeDurationRef.current += delta;
                    if (Math.random() < 0.15) {
                        const words = ['tôi', 'làm', 'việc', 'với', 'team', 'dự án', 'công ty', 'kinh nghiệm', 'học hỏi', 'giải quyết', 'xây dựng'];
                        lastTranscriptRef.current = (lastTranscriptRef.current + ' ' + words[Math.floor(Math.random() * words.length)]).slice(-200);
                    }
                }
            } else {
                setAudioLevels((prev) => prev.map(() => 4 + Math.random() * 4));
            }
            animationRef.current = requestAnimationFrame(tick);
        };
        tick();
    }, []);

    const startRecording = useCallback(async () => {
        setTimeout(() => setShowCurrent(true), 0);
        addTranscript('ai', currentQ?.text || '');
        questionStartedAtRef.current = Date.now();
        lastSpokeAtRef.current = null;
        spokeDurationRef.current = 0;
        lastTranscriptRef.current = '';

        const ok = await setupMic();
        if (ok) {
            startVAD();
            startSTT();
            try {
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                const mediaRecorder = new MediaRecorder(stream);
                const chunks = [];
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };
                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, {type: 'audio/webm'});
                    // console.log(`Captured ${blob.size} bytes`);
                };
                recorderRef.current = mediaRecorder;
                mediaRecorder.start();
            } catch (err) {
                console.error("MediaRecorder failed:", err);
            }
        }

        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
        inQuestionTimerRef.current = setTimeout(() => {
            if (phaseRef.current === 'recording') transitionToProcessing(true);
        }, IN_QUESTION_TIMEOUT);
    }, [setupMic, startVAD, startSTT, transitionToProcessing, addTranscript, currentQ]);

    useEffect(() => {
        if (questions.length === 0) return;
        if (phase === 'asking') {
            setTimeout(() => setShowCurrent(true), 0);
            if (currentQ?.text) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(currentQ.text);
                utterance.lang = 'vi-VN';
                utterance.rate = 1.0;

                utterance.onend = () => {
                    setPhase('recording');
                };

                window.speechSynthesis.speak(utterance);
            } else {
                setTimeout(() => {
                    setPhase('recording');
                }, 0)
            }

            // Fallback timer in case speech synthesis fails or hangs
            if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
            phaseTimerRef.current = setTimeout(() => {
                setPhase('recording');
            }, 15000); // 15s fallback, longer than any typical question
        } else if (phase === 'recording') {
            setTimeout(() => {
                startRecording().catch(console.error);
            }, 0);
        }
    }, [phase, questions, currentQ, startRecording]);

    useEffect(() => {
        if (phase !== 'recording') return;
        const interval = setInterval(() => {
            // console.log("Đang check...");
            const now = Date.now();
            if (!lastSpokeAtRef.current && questionStartedAtRef.current) {
                // console.log("NOW1: " + now);
                if (now - questionStartedAtRef.current >= START_SILENCE_MS) {
                    // console.log("Quá 5 giây không có tín hiệu, bỏ qua câu hỏi!");
                    // Gọi nộp bài với tham số true (đánh dấu là skipped/bỏ qua do không trả lời)
                    transitionToProcessing(true);
                    return; // Dừng luôn vòng lặp
                }
            }
            // console.log("NOW2: " + now);
            if (END_PHRASE_REGEX.test(lastTranscriptRef.current)) {
                transitionToProcessing(false);
                return;
            }
            if (lastSpokeAtRef.current !== null) {
                if (now - lastSpokeAtRef.current >= END_SILENCE_MS) {
                    // console.log(`Đã nói lần cuối từ ${lastSpokeAtRef.current}s`);
                    // console.log(`Đã nói ${Math.round(spokeDurationRef.current / 1000)}s và im lặng 10s, chuyển câu!`);
                    transitionToProcessing(false);
                }
            }
        }, 200);
        return () => clearInterval(interval);
    }, [phase, transitionToProcessing]);

    const handleMicClick = useCallback(() => {
        if (micState === 'denied') setupMic().catch(console.error);
    }, [micState, setupMic]);

    useEffect(() => {
        const t = setInterval(() => {
            if (data.startedAt) setElapsed(Math.floor((Date.now() - data.startedAt) / 1000));
        }, 1000);
        return () => clearInterval(t);
    }, [data.startedAt]);

    useEffect(() => {
        if (data.skipStreak >= 2) {
            setTimeout(() => endInterview(), 0);
        }
    }, [data.skipStreak, endInterview]);

    useEffect(() => {
        return () => {
            stopMic();
            stopSTT();
            if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
            if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
        };
    }, [stopMic, stopSTT]);

    if (!questions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-dim font-sans">
                <div className="text-gray-500">Đang tải câu hỏi...</div>
            </div>
        );
    }

    if (currentIndex >= questions.length) return null;

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white font-sans">
            <header
                className="w-full h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 bg-[#0b3c8f] rounded-md flex items-center justify-center text-white font-bold text-xs italic">S
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-[#0b3c8f]">Smartfolio</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                    <span className="w-2 h-2 rounded-full bg-[#1a56db]"></span>
                    <span className="text-sm font-semibold text-[#1a56db] tracking-wide">PHÒNG PHỎNG VẤN</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                    <Clock size={16}/>
                    <span>Thời gian: {formatTime(elapsed)}</span>
                </div>
            </header>
            <main className="flex-1 relative flex flex-col items-center justify-center p-6">
                <div
                    className={`w-28 h-28 rounded-full mb-6 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden transition-all ${phase === 'asking' ? 'bg-blue-100 ring-4 ring-blue-200 animate-pulse' : 'bg-gray-200'}`}>
                    {phase === 'asking' ? <Volume2 className="w-12 h-12 text-[#1a56db]"/> : <div
                        className="w-full h-full bg-gradient-to-br from-[#1a56db] to-[#0b3c8f] flex items-center justify-center text-white">
                        <Sparkles className="w-12 h-12"/></div>}
                </div>
                <div className="text-sm text-gray-500 mb-4 font-medium">
                    {data.interviewConfig?.type === 'HR' ? 'Anh Minh — HR FPT' : data.interviewConfig?.type === 'Technical' ? 'Anh Hùng — Tech Lead FPT' : 'Chị Lan — HR Manager FPT'}
                </div>
                <div className="flex items-end gap-1 mb-6 h-16">
                    {audioLevels.map((h, i) => (
                        <div key={i}
                             className={`w-1.5 rounded-full transition-all duration-100 ${phase === 'recording' ? 'bg-[#1a56db]' : phase === 'asking' ? 'bg-blue-300 animate-pulse' : 'bg-gray-300'}`}
                             style={{height: `${h}px`, minHeight: '4px'}}/>
                    ))}
                </div>
                <StatusPill phase={phase} currentIndex={currentIndex} total={questions.length}/>
                {showCurrent && currentQ && (
                    <div
                        className="mt-6 max-w-2xl w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div
                                className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 text-xs font-bold">AI
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-medium text-gray-800 leading-relaxed">{currentQ.text}</p>
                                {phase === 'recording' && interimTranscript && (
                                    <p className="mt-3 text-md text-blue-600 italic animate-pulse">
                                        {interimTranscript}...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {data.transcriptLog && data.transcriptLog.length > 0 && (
                    <div className="mt-4 max-w-2xl w-full max-h-32 overflow-y-auto space-y-1 text-sm text-gray-500">
                        {/* Render 4 tin nhắn gần nhất từ log */}
                        {data.transcriptLog.slice(-4).map((entry, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span
                                    className="text-xs font-bold w-12 shrink-0">{entry.role === 'ai' ? 'AI:' : 'Bạn:'}</span>
                                <span className="line-clamp-1">{entry.text}</span>
                            </div>
                        ))}
                        {/* HIỂN THỊ LỜI NÓI THỜI GIAN THỰC TRONG CHAT LOG */}
                        {phase === 'recording' && interimTranscript && (
                            <div className="flex items-start gap-2 animate-fade-in">
                                <span className="text-xs font-bold w-12 shrink-0">Bạn:</span>
                                <span className="italic text-blue-500 line-clamp-1">{interimTranscript}...</span>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <footer className="w-full h-20 bg-white border-t border-gray-200 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={handleMicClick}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${micState === 'active' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : micState === 'denied' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {micState === 'active' ? <Mic size={18}/> : <MicOff size={18}/>}
                        {micState === 'active' ? 'Mic đang bật' : micState === 'denied' ? 'Bật lại mic' : 'Bật mic'}
                    </button>
                    <button
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                        <SettingsIcon size={18}/> Settings
                    </button>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="text-sm text-gray-500 font-medium w-64 text-center">
                        {phase === 'asking' ? 'AI đang đọc câu hỏi...' : phase === 'recording' ? '🎤 Hãy trả lời hoặc nói "xin hết"' : phase === 'processing' ? 'Đang xử lý...' : ''}
                    </div>
                </div>
                <div className="w-[180px]"></div>
            </footer>
        </div>
    );
}

function StatusPill({phase, currentIndex, total}) {
    if (phase === 'asking') return <div
        className="bg-blue-100/50 text-[#1a56db] px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] animate-pulse"></span>AI đang đọc câu
        hỏi {currentIndex + 1}/{total}</div>;
    if (phase === 'recording') return <div
        className="bg-red-100/50 text-red-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>ĐANG GHI ÂM —
        Câu {currentIndex + 1}/{total}</div>;
    if (phase === 'processing') return <div
        className="bg-amber-100/50 text-amber-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>AI đang xử lý...</div>;
    return null;
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
