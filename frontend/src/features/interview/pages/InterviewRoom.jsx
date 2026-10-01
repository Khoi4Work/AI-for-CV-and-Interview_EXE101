// /src/pages/interview/InterviewRoom.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Mic, MicOff, SettingsIcon } from 'lucide-react';
import { RecruiterAvatar } from '../components/RecruiterAvatar';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import { useMediaDevices } from '../../../hooks/useMediaDevices.js';
import { END_PHRASES_VN, END_PHRASES_EN } from '../constants/questionBank.js';
import { useElevenLabsTTS } from '../hooks/useElevenLabsTTS';
import { getApiErrorMessage } from '../../../service/apiClient.js';

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
    const { data, update, generateQuestions, saveAnswer, addTranscript } = useInterviewSession();
    const {
        audioLevels,
        volumeRef,
        ensureStream,
        startAudioAnalysis,
        stopAllTracks
    } = useMediaDevices();

    useEffect(() => {
        update({ step: 8, skipStreak: 0, transcriptLog: [] });
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
    const [currentIndex, setCurrentIndex] = useState(() => Math.min(data.answers?.length || 0, data.questions?.length || 0));
    const [elapsed, setElapsed] = useState(0);
    const [micState, setMicState] = useState('idle'); // idle | requesting | active | denied
    const [showCurrent, setShowCurrent] = useState(false);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    // 'apiSTT' | 'webspeech' | 'none'
    const [sttEngine, setSttEngine] = useState('none');

    const phaseTimerRef = useRef(null);
    const audioQuestionIdRef = useRef(null);
    const inQuestionTimerRef = useRef(null);
    const lastSpokeAtRef = useRef(null);
    const lastSpeechActivityAtRef = useRef(null);
    const prevTranscriptRef = useRef('');
    const questionStartedAtRef = useRef(null);
    const lastTranscriptRef = useRef('');
    const interimTranscriptRef = useRef('');
    const phaseRef = useRef(phase);
    const currentIndexRef = useRef(currentIndex);
    const listeningQuestionIdRef = useRef(null);
    const recognitionRef = useRef(null);
    const processingRef = useRef(false);
    const firstSpokeAtRef = useRef(null);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const questions = useMemo(() => data.questions || [], [data.questions]);
    const currentQ = questions[currentIndex];

    const startSTT = useCallback(async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.info('[STT] Browser speech recognition is unavailable; this browser cannot produce interview transcript text.');
            setSttEngine('none');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = data.interviewConfig?.language === 'en' ? 'en-US' : 'vi-VN';
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
                try { recognition.start(); } catch { /* recognition may already be active */ }
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setSttEngine('webspeech');
    }, [data.interviewConfig?.language]);

    const stopSTT = useCallback(() => {
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
        setTimeout(() => navigate('/interview/review'), 200);
    }, [navigate, stopAllTracks, stopSTT]);

    const transitionToNext = useCallback(() => {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
            endInterview();
        } else {
            setCurrentIndex(nextIndex);
            setPhase('asking');
        }
    }, [currentIndex, questions, endInterview]);

    const transitionToProcessing = useCallback(async () => {
        if (phaseRef.current !== 'recording' || processingRef.current) return;
        processingRef.current = true;
        setPhase('processing');
        stopSTT();

        const finalPart = lastTranscriptRef.current.trim();
        const interimPart = interimTranscriptRef.current.trim();
        let answerText;

        if (finalPart && interimPart) {
            answerText = (finalPart + ' ' + interimPart).trim();
        } else {
            answerText = (finalPart || interimPart).trim();
        }

        const qid = questions[currentIndexRef.current]?.id;
        if (qid) {
            const wasSkipped = !answerText;
            const answer = {
                qid,
                text: wasSkipped ? '' : answerText,
                durationMs: Date.now() - (firstSpokeAtRef.current || questionStartedAtRef.current || Date.now()),
                skipped: wasSkipped,
                startedAt: questionStartedAtRef.current,
                endedAt: Date.now(),
            };

            try {
                await saveAnswer(qid, answer);
            } catch (error) {
                const message = getApiErrorMessage(error, 'Không thể lưu câu trả lời.');
                update({ sessionError: message });
                setPhase('error');
                return;
            }
        }

        lastTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        lastSpokeAtRef.current = null;
        lastSpeechActivityAtRef.current = null;
        setShowCurrent(false);

        if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);

        phaseTimerRef.current = setTimeout(() => {
            processingRef.current = false;
            transitionToNext();
        }, PROCESSING_DURATION);
    }, [questions, saveAnswer, stopSTT, update, transitionToNext]);

    const startListening = useCallback(async () => {
        if (listeningQuestionIdRef.current === currentQ?.id) {
            console.debug('Live transcription already started for this question; skipping duplicate start.');
            return;
        }

        listeningQuestionIdRef.current = currentQ?.id;

        setTimeout(() => setShowCurrent(true), 0);
        addTranscript('ai', currentQ?.text || '');
        questionStartedAtRef.current = Date.now();
        lastSpokeAtRef.current = null;
        lastSpeechActivityAtRef.current = null;
        firstSpokeAtRef.current = null;
        lastTranscriptRef.current = '';
        setFinalTranscript('');

        try {
            await ensureStream();
            setMicState('active');
            startAudioAnalysis();
            await startSTT();
        } catch (e) {
            console.error("Media setup failed:", e);
            setMicState('denied');
            listeningQuestionIdRef.current = null;
        }

        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
        inQuestionTimerRef.current = setTimeout(() => {
            if (phaseRef.current === 'recording') transitionToProcessing();
        }, IN_QUESTION_TIMEOUT);
    }, [ensureStream, startAudioAnalysis, startSTT, transitionToProcessing, addTranscript, currentQ]);

    const onQuestionAudioEnd = useCallback(() => setPhase('recording'), []);
    const { playTTS, stopAudio } = useElevenLabsTTS(onQuestionAudioEnd);

    useEffect(() => {
        let recordingTimeout;
        let questionAudioTimeout;

        if (questions.length === 0) return;
        if (phase === 'asking') {
            setTimeout(() => setShowCurrent(true), 0);
            if (currentQ?.text) {
                if (audioQuestionIdRef.current !== currentQ.id) {
                    // Defer the request until after commit. React StrictMode replays effects
                    // in development; starting the request synchronously here lets the first
                    // pass cleanup abort it before the replay can start playback.
                    questionAudioTimeout = setTimeout(() => {
                        if (audioQuestionIdRef.current === currentQ.id) return;
                        audioQuestionIdRef.current = currentQ.id;
                        playTTS(currentQ.text, currentQ.id, data.interviewConfig?.language);
                    }, 0);
                }
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
                startListening().catch(console.error);
            }, 0);
        }

        return () => {
            if (recordingTimeout) clearTimeout(recordingTimeout);
            if (questionAudioTimeout) clearTimeout(questionAudioTimeout);
        };
    }, [phase, questions, currentQ, startListening, playTTS, data.interviewConfig?.language]);

    useEffect(() => {
        if (phase !== 'recording') return;
        const interval = setInterval(() => {
            const now = Date.now();

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

                if (hasAudio) lastSpeechActivityAtRef.current = now;
            }

            if (!lastSpokeAtRef.current && questionStartedAtRef.current) {
                if (now - questionStartedAtRef.current >= START_SILENCE_MS) {
                    transitionToProcessing();
                    return;
                }
            }

            if (END_PHRASE_REGEX.test(lastTranscriptRef.current)) {
                transitionToProcessing();
                return;
            }

            if (lastSpeechActivityAtRef.current !== null) {
                if (now - lastSpeechActivityAtRef.current >= END_SILENCE_MS) {
                    transitionToProcessing();
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
        if (questions.length > 0 && currentIndex >= questions.length) {
            navigate('/interview/review', {replace: true});
        }
    }, [questions.length, currentIndex, navigate]);

    useEffect(() => {
        if (data.skipStreak >= 2) {
            setTimeout(() => endInterview(), 0);
        }
    }, [data.skipStreak, endInterview]);

    const cleanupRefs = useRef({ stopAllTracks, stopSTT, stopAudio });

    useEffect(() => {
        cleanupRefs.current = { stopAllTracks, stopSTT, stopAudio };
    }, [stopAllTracks, stopSTT, stopAudio]);

    useEffect(() => {
        return () => {
            cleanupRefs.current.stopAllTracks();
            cleanupRefs.current.stopSTT();
            cleanupRefs.current.stopAudio();
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

    if (phase === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-interview-radial p-6">
                <div className="error-card rounded-xl bg-interview-card-bg p-6 text-center shadow-lg">
                    <h1 className="mb-2 text-xl font-bold text-black">Không lưu được câu trả lời</h1>
                    <p className="mb-5 text-sm text-black/70">{data.sessionError || 'Hãy kiểm tra kết nối rồi thử lại.'}</p>
                    <button onClick={() => navigate('/interview/review')} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">Thoát buổi phỏng vấn</button>
                </div>
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
                <RecruiterAvatar phase={phase} />
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
                        {phase === 'asking' ? 'AI đang đọc câu hỏi...' : phase === 'recording' ? sttEngine === 'none' ? 'Trình duyệt chưa hỗ trợ nhận diện giọng nói' : '🎤 Hãy trả lời hoặc nói "xin hết"' : phase === 'processing' ? 'Đang xử lý...' : ''}
                    </div>
                    {phase === 'recording' && sttEngine !== 'none' && (
                        <span className="text-[10px] uppercase font-bold text-outline mt-1 tracking-wider">
                            LIVE CAPTIONS · {sttEngine === 'webspeech' ? 'BROWSER' : 'BE TRANSCRIPTION'}
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
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>ĐANG NHẬN DIỆN —
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
