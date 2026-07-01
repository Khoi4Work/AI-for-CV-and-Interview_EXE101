// /src/pages/interview/InterviewRoom.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {Clock, Mic, MicOff, Volume2, Sparkles, SettingsIcon} from 'lucide-react';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import { useMediaDevices } from '../../../hooks/useMediaDevices.js';
import { END_PHRASES_VN, END_PHRASES_EN } from '../constants/questionBank.js';
import ElevenLabsTranscriptionClient from "../hooks/useElevenlabsSTT.js";
import { useElevenLabsTTS } from '../hooks/useElevenLabsTTS';

const PROCESSING_DURATION = 1200;
const IN_QUESTION_TIMEOUT = 600000;
const VAD_THRESHOLD = 65; // Tăng ngưỡng để lọc nhiễu tốt hơn
const END_SILENCE_MS = 10000; // 10s im lặng sau nói cuối → kết thúc câu
const START_SILENCE_MS = 6000;
const END_PHRASE_REGEX = new RegExp(
    `(${END_PHRASES_VN.concat(END_PHRASES_EN).join('|')})`,
    'i'
);

export function InterviewRoom() {
    const navigate = useNavigate();
    const { data, update, generateQuestions, generateFeedback, saveAnswer, addTranscript } = useInterviewSession();
    const {
        audioLevels,
        volumeRef,
        ensureStream,
        startAudioAnalysis,
        stopAllTracks
    } = useMediaDevices();

    useEffect(() => {
        update({ step: 8 });
        update({ skipStreak: 0, transcriptLog: [] });
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
    }, [data.questions, generateQuestions, update]);

    const [phase, setPhase] = useState('asking'); // asking | recording | processing | between | done
    const [currentIndex, setCurrentIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [micState, setMicState] = useState('idle'); // idle | requesting | active | denied
    const [showCurrent, setShowCurrent] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    // 'apiSTT' | 'webspeech' | 'none'
    const [sttEngine, setSttEngine] = useState('none');

    const phaseTimerRef = useRef(null);
    const inQuestionTimerRef = useRef(null);
    const lastSpokeAtRef = useRef(null);
    const lastSpeechActivityAtRef = useRef(null);
    const prevTranscriptRef = useRef('');
    const spokeDurationRef = useRef(0);
    const questionStartedAtRef = useRef(null);
    const lastTranscriptRef = useRef('');
    const interimTranscriptRef = useRef('');
    const phaseRef = useRef(phase);
    const currentIndexRef = useRef(currentIndex);
    const recorderRef = useRef(null);
    const recognitionRef = useRef(null);
    const apiSttRef = useRef(null);
    const lastTickAtRef = useRef(null);
    const firstSpokeAtRef = useRef(null);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const questions = useMemo(() => data.questions || [], [data.questions]);
    const currentQ = questions[currentIndex];

    const startSTT = useCallback(async (stream) => {
        if (apiSttRef.current || recognitionRef.current) {
            console.warn("[STT] STT đã đang chạy, huỷ khởi tạo mới.");
            return;
        }

        try {
            const apiSTT = new ElevenLabsTranscriptionClient((result) => {
                if (result.isFinal) {
                    const newTranscript = (lastTranscriptRef.current + ' ' + result.transcript).trim();
                    lastTranscriptRef.current = newTranscript;
                    setFinalTranscript(newTranscript);
                    setInterimTranscript('');
                    interimTranscriptRef.current = '';
                } else {
                    setInterimTranscript(result.transcript);
                    interimTranscriptRef.current = result.transcript;
                }
            });

            await apiSTT.start(stream);
            apiSttRef.current = apiSTT;
            setSttEngine('apiSTT');
            console.log("[STT] Đang sử dụng apiSTT Engine.");
            return;
        } catch (err) {
            console.warn("[STT] apiSTT thất bại, chuyển sang Web Speech API fallback:", err);
            if (apiSttRef.current) {
                apiSttRef.current.stop();
                apiSttRef.current = null;
            }
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("[STT] Trình duyệt này không hỗ trợ Web Speech API.");
            setSttEngine('none');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            let finalPart = '';
            let interimPart = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalPart += event.results[i][0].transcript + ' ';
                } else {
                    interimPart += event.results[i][0].transcript;
                }
            }

            if (finalPart) {
                const newTranscript = (lastTranscriptRef.current + ' ' + finalPart).trim();
                lastTranscriptRef.current = newTranscript;
                setFinalTranscript(newTranscript);
            }
            interimTranscriptRef.current = interimPart;
            setInterimTranscript(interimPart);
        };

        recognition.onerror = (err) => console.error("Speech Recognition Error:", err);
        recognition.onend = () => {
            if (phaseRef.current === 'recording') {
                try { recognition.start(); } catch(e){ /* empty */ }
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setSttEngine('webspeech');
        console.log("[STT] Đang sử dụng Web Speech API.");
    }, []);

    const stopSTT = useCallback(() => {
        if (apiSttRef.current) {
            apiSttRef.current.stop();
            apiSttRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setInterimTranscript('');
        setSttEngine('none');
    }, []);

    const endInterview = useCallback(() => {
        setPhase('done');
        stopAllTracks();
        stopSTT();
        generateFeedback();
        setTimeout(() => navigate('/interview/review'), 200);
    }, [generateFeedback, navigate, stopAllTracks, stopSTT]);

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
        if (qid) {
            saveAnswer(qid, {
                qid,
                text: (skipped && !answerText) ? '' : (answerText || '...'),
                durationMs: Date.now() - (firstSpokeAtRef.current || questionStartedAtRef.current || Date.now()),
                skipped: skipped && !answerText,
                startedAt: questionStartedAtRef.current,
                endedAt: Date.now(),
            });
        }

        lastTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        lastSpokeAtRef.current = null;
        lastSpeechActivityAtRef.current = null;
        spokeDurationRef.current = 0;
        setShowCurrent(false);

        setPhase('processing');
        if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);

        phaseTimerRef.current = setTimeout(() => {
            transitionToNext();
        }, PROCESSING_DURATION);
    }, [questions, saveAnswer, transitionToNext, stopSTT]);

    const startRecording = useCallback(async () => {
        if (recorderRef.current && recorderRef.current.state !== 'inactive') {
            console.warn("Recording đã bắt đầu, bỏ qua.");
            return;
        }

        recorderRef.current = { state: 'starting' };

        setTimeout(() => setShowCurrent(true), 0);
        addTranscript('ai', currentQ?.text || '');
        questionStartedAtRef.current = Date.now();
        lastSpokeAtRef.current = null;
        lastSpeechActivityAtRef.current = null;
        firstSpokeAtRef.current = null;
        spokeDurationRef.current = 0;
        lastTranscriptRef.current = '';

        try {
            const s = await ensureStream();
            setMicState('active');
            startAudioAnalysis();
            await startSTT(s);

            const mediaRecorder = new MediaRecorder(s);
            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, {type: 'audio/webm'});
            };
            recorderRef.current = mediaRecorder;
            mediaRecorder.start();
        } catch (e) {
            console.error("Media setup failed:", e);
            setMicState('denied');
            recorderRef.current = null;
        }

        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
        inQuestionTimerRef.current = setTimeout(() => {
            if (phaseRef.current === 'recording') transitionToProcessing(true);
        }, IN_QUESTION_TIMEOUT);
    }, [ensureStream, startAudioAnalysis, startSTT, transitionToProcessing, addTranscript, currentQ]);

    const { playTTS, stopAudio } = useElevenLabsTTS(() => {
        setPhase('recording');
    });

    useEffect(() => {
        let recordingTimeout;

        if (questions.length === 0) return;
        if (phase === 'asking') {
            setTimeout(() => setShowCurrent(true), 0);
            if (currentQ?.text) {
                playTTS(currentQ.text);
            } else {
                setTimeout(() => {
                    setPhase('recording');
                }, 0)
            }

            if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
            phaseTimerRef.current = setTimeout(() => {
                setPhase('recording');
            }, 15000);
        } else if (phase === 'recording') {
            recordingTimeout = setTimeout(() => {
                startRecording().catch(console.error);
            }, 0);
        }

        return () => {
            if (recordingTimeout) clearTimeout(recordingTimeout);
        };
    }, [phase, questions, currentQ, startRecording]);

    useEffect(() => {
        if (phase !== 'recording') return;
        lastTickAtRef.current = Date.now();
        const interval = setInterval(() => {
            const now = Date.now();
            const delta = now - (lastTickAtRef.current || now);
            lastTickAtRef.current = now;

            const currentFullText = (lastTranscriptRef.current + ' ' + interimTranscript).trim();
            const isTextChanging = currentFullText !== prevTranscriptRef.current;
            prevTranscriptRef.current = currentFullText;

            const hasAudio = volumeRef.current > VAD_THRESHOLD;
            const isActuallySpeaking = isTextChanging;
            const isPreventingSkip = hasAudio || isActuallySpeaking;

            if (isPreventingSkip) {
                if (!firstSpokeAtRef.current) {
                    firstSpokeAtRef.current = now;
                }
                lastSpokeAtRef.current = now;

                if (isActuallySpeaking) {
                    lastSpeechActivityAtRef.current = now;
                }

                if (hasAudio) {
                    spokeDurationRef.current += delta;
                }
            }

            if (!lastSpokeAtRef.current && questionStartedAtRef.current) {
                if (now - questionStartedAtRef.current >= START_SILENCE_MS) {
                    transitionToProcessing(true);
                    return;
                }
            }

            if (END_PHRASE_REGEX.test(lastTranscriptRef.current)) {
                transitionToProcessing(false);
                return;
            }

            if (lastSpeechActivityAtRef.current !== null) {
                if (now - lastSpeechActivityAtRef.current >= END_SILENCE_MS) {
                    transitionToProcessing(false);
                }
            }
        }, 200);
        return () => clearInterval(interval);
    }, [phase, transitionToProcessing, volumeRef, interimTranscript]);

    const handleMicClick = useCallback(() => {
        if (micState === 'denied') {
            ensureStream().then(() => setMicState('active')).catch(() => setMicState('denied'));
        }
    }, [micState, ensureStream]);

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

    const cleanupRefs = useRef({ stopAllTracks, stopSTT });

    useEffect(() => {
        cleanupRefs.current = { stopAllTracks, stopSTT };
    });

    useEffect(() => {
        return () => {
            cleanupRefs.current.stopAllTracks();
            cleanupRefs.current.stopSTT();
            stopAudio();
            if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
            if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
        };
    }, []);

    if (!questions.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface-dim font-sans text-on-surface">
                <div className="text-on-surface-variant">Đang tải câu hỏi...</div>
            </div>
        );
    }

    if (currentIndex >= questions.length) return null;

    return (
        <div className="min-h-screen flex flex-col bg-interview-radial font-sans">
            <header
                className="w-full h-16 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant shadow-sm">
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-on-primary font-bold text-xs italic">S
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight text-primary">Smartfolio</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/30">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-sm font-semibold text-primary tracking-wide">PHÒNG PHỎNG VẤN</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
                    <Clock size={16}/>
                    <span>Thời gian: {formatTime(elapsed)}</span>
                </div>
            </header>
            <main className="flex-1 relative flex flex-col items-center justify-center p-6 text-on-surface">
                <div
                    className={`w-28 h-28 rounded-full mb-6 border-4 border-background shadow-sm flex items-center justify-center overflow-hidden transition-all ${phase === 'asking' ? 'bg-primary/20 ring-4 ring-primary/30 animate-pulse' : 'bg-surface-container'}`}>
                    {phase === 'asking' ? <Volume2 className="w-12 h-12 text-primary"/> : <div
                        className="w-full h-full bg-primary flex items-center justify-center text-on-primary">
                        <Sparkles className="w-12 h-12"/></div>}
                </div>
                <div className="text-sm text-on-surface-variant mb-4 font-medium">
                    {data.interviewConfig?.type === 'HR' ? 'Anh Minh — HR FPT' : data.interviewConfig?.type === 'Technical' ? 'Anh Hùng — Tech Lead FPT' : 'Chị Lan — HR Manager FPT'}
                </div>
                <div className="flex items-end gap-1 mb-6 h-16">
                    {audioLevels.map((h, i) => (
                        <div key={i}
                             className={`w-1.5 rounded-full transition-all duration-100 ${phase === 'recording' ? 'bg-primary' : phase === 'asking' ? 'bg-primary/40 animate-pulse' : 'bg-surface-container'}`}
                             style={{height: `${h}px`, minHeight: '4px'}}/>
                    ))}
                </div>
                <StatusPill phase={phase} currentIndex={currentIndex} total={questions.length}/>
                {showCurrent && currentQ && (
                    <div
                        className="mt-6 max-w-2xl w-full glass-panel border border-outline-variant rounded-2xl p-6 shadow-sm animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">AI</div>
                            <div className="flex-1">
                                <p className="text-lg font-medium text-on-surface leading-relaxed">{currentQ.text}</p>
                                {phase === 'recording' && (
                                    <p className="mt-3 text-md text-primary italic animate-pulse">
                                        {(finalTranscript + ' ' + interimTranscript).trim()}...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                {data.transcriptLog && data.transcriptLog.length > 0 && (
                    <div className="mt-4 max-w-2xl w-full max-h-32 overflow-y-auto space-y-1 text-sm text-on-surface-variant">
                        {data.transcriptLog.slice(-4).map((entry, i) => (
                            <div key={i} className="flex items-start gap-2">
                                <span
                                    className="text-xs font-bold w-12 shrink-0">{entry.role === 'ai' ? 'AI:' : 'Bạn:'}</span>
                                <span className="line-clamp-1">{entry.text}</span>
                            </div>
                        ))}
                        {phase === 'recording' && interimTranscript && (
                            <div className="flex items-start gap-2 animate-fade-in">
                                <span className="text-xs font-bold w-12 shrink-0">Bạn:</span>
                                <span className="italic text-primary line-clamp-1">{interimTranscript}...</span>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <footer className="w-full h-20 bg-surface-container border-t border-outline-variant px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={handleMicClick}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${micState === 'active' ? 'bg-primary/20 text-primary hover:bg-primary/30' : micState === 'denied' ? 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'}`}>
                        {micState === 'active' ? <Mic size={18}/> : <MicOff size={18}/>}
                        {micState === 'active' ? 'Mic đang bật' : micState === 'denied' ? 'Bật lại mic' : 'Bật mic'}
                    </button>
                    <button
                        className="flex items-center gap-2 bg-surface-container-high hover:bg-surface-container text-on-surface-variant px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                        <SettingsIcon size={18}/> Settings
                    </button>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="text-sm text-on-surface-variant font-medium w-64 text-center">
                        {phase === 'asking' ? 'AI đang đọc câu hỏi...' : phase === 'recording' ? '🎤 Hãy trả lời hoặc nói "xin hết"' : phase === 'processing' ? 'Đang xử lý...' : ''}
                    </div>
                    {phase === 'recording' && sttEngine !== 'none' && (
                        <span className="text-[10px] uppercase font-bold text-outline mt-1 tracking-wider">
                            POWERED BY {sttEngine === 'apiSTT' ? 'apiSTT NOVA-2' : 'WEB SPEECH API'}
                        </span>
                    )}
                </div>
                <div className="w-[180px]"></div>
            </footer>
        </div>
    );
}

function StatusPill({phase, currentIndex, total}) {
    if (phase === 'asking') return <div
        className="bg-primary/20 text-primary px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>AI đang đọc câu
        hỏi {currentIndex + 1}/{total}</div>;
    if (phase === 'recording') return <div
        className="bg-rose-500/20 text-rose-500 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>ĐANG GHI ÂM —
        Câu {currentIndex + 1}/{total}</div>;
    if (phase === 'processing') return <div
        className="bg-amber-500/20 text-amber-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>AI đang xử lý...
    </div>;
    return null;
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
