// /src/pages/interview/InterviewRoom.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Mic, MicOff, LoaderCircle } from 'lucide-react';
import logo from '../../../assets/logo.jpg';
import { RecruiterAvatar } from '../components/RecruiterAvatar';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import ElevenLabsTranscriptionClient from '../hooks/useElevenlabsSTT.js';
import './interview-pages.css';
import { useMediaDevices } from '../../../hooks/useMediaDevices.js';
import { END_PHRASES_VN, END_PHRASES_EN } from '../constants/questionBank.js';
import { useElevenLabsTTS } from '../hooks/useElevenLabsTTS';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { saveLocalInterviewRecording } from '../services/localInterviewRecording.js';
import { canAcceptInterviewAnswer, getInterviewRoomPrompt, isTranscriptChanging } from '../services/interviewRoomStatus.js';

const PROCESSING_DURATION = 1200;
const IN_QUESTION_TIMEOUT = 600000;
const NO_ANSWER_REMINDER_MS = 12000;
const NO_ANSWER_SKIP_MS = 12000;
const CODE_IDLE_REMINDER_MS = 12000;
const CODE_IDLE_SUBMIT_MS = 12000;
const VAD_THRESHOLD = 65; // Tăng ngưỡng để lọc nhiễu tốt hơn
const END_SILENCE_MS = 10000; // 10s im lặng sau nói cuối → kết thúc câu
const END_PHRASE_REGEX = new RegExp(
    `(${END_PHRASES_VN.concat(END_PHRASES_EN).join('|')})`,
    'i'
);

export function InterviewRoom() {
    const navigate = useNavigate();
    const { data, update, generateQuestions, saveAnswer, addTranscript, finishInterview } = useInterviewSession();
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
    const [writtenAnswer, setWrittenAnswer] = useState('');
    const [codeLanguage, setCodeLanguage] = useState('text');
    const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
    const writtenAnswerRef = useRef('');
    // 'apiSTT' | 'webspeech' | 'none'
    const [sttEngine, setSttEngine] = useState('none');
    const [sttStatus, setSttStatus] = useState('idle'); // idle | connecting | ready | unavailable
    const [noAnswerReminderActive, setNoAnswerReminderActive] = useState(false);

    const processingTimerRef = useRef(null);
    const audioQuestionIdRef = useRef(null);
    const inQuestionTimerRef = useRef(null);
    const lastSpeechActivityAtRef = useRef(null);
    const prevTranscriptRef = useRef('');
    const questionStartedAtRef = useRef(null);
    const lastTranscriptRef = useRef('');
    const interimTranscriptRef = useRef('');
    const phaseRef = useRef(phase);
    const currentIndexRef = useRef(currentIndex);
    const listeningQuestionIdRef = useRef(null);
    const recognitionRef = useRef(null);
    const apiSttRef = useRef(null);
    const apiSttPreparationFailedRef = useRef(false);
    const sttGenerationRef = useRef(0);
    const processingRef = useRef(false);
    const firstSpokeAtRef = useRef(null);
    const interviewRecorderRef = useRef(null);
    const interviewAudioChunksRef = useRef([]);
    const recordingStopResolverRef = useRef(null);
    const recordingAudioContextRef = useRef(null);
    const recordingAudioDestinationRef = useRef(null);
    const ttsAudioSourcesRef = useRef(new WeakMap());
    const noAnswerTimerRef = useRef(null);
    const codeIdleTimerRef = useRef(null);
    const noAnswerStageRef = useRef('idle'); // idle | waiting | speaking-reminder | after-reminder
    const silencePromptActiveRef = useRef(false);
    const skipStreakRef = useRef(0);

    const startLocalInterviewRecording = useCallback(async (stream) => {
        if (!data.audioRecordingEnabled || interviewRecorderRef.current) return;
        if (!window.MediaRecorder) {
            update({localAudioRecordingError: 'Trình duyệt này không hỗ trợ lưu bản ghi âm.'});
            return;
        }
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) throw new Error('Trình duyệt này không hỗ trợ trộn âm thanh để ghi lại cuộc phỏng vấn.');
            const audioContext = new AudioContextClass();
            const destination = audioContext.createMediaStreamDestination();
            audioContext.createMediaStreamSource(stream).connect(destination);
            await audioContext.resume();
            recordingAudioContextRef.current = audioContext;
            recordingAudioDestinationRef.current = destination;

            const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
                .find((type) => MediaRecorder.isTypeSupported?.(type));
            const recorder = mimeType ? new MediaRecorder(destination.stream, {mimeType}) : new MediaRecorder(destination.stream);
            interviewAudioChunksRef.current = [];
            recorder.ondataavailable = (event) => {
                if (event.data?.size) interviewAudioChunksRef.current.push(event.data);
            };
            recorder.onstop = async () => {
                const blob = new Blob(interviewAudioChunksRef.current, {type: recorder.mimeType || 'audio/webm'});
                interviewRecorderRef.current = null;
                if (blob.size > 0 && data.backendSessionId) {
                    try {
                        await saveLocalInterviewRecording(data.backendSessionId, blob);
                        update({localAudioRecordingAvailable: true, localAudioRecordingError: null});
                    } catch {
                        update({localAudioRecordingAvailable: false, localAudioRecordingError: 'Không lưu được bản ghi trên thiết bị. Bạn vẫn có thể tiếp tục buổi phỏng vấn.'});
                    }
                }
                recordingAudioContextRef.current?.close();
                recordingAudioContextRef.current = null;
                recordingAudioDestinationRef.current = null;
                recordingStopResolverRef.current?.();
                recordingStopResolverRef.current = null;
            };
            recorder.start(1000);
            interviewRecorderRef.current = recorder;
            update({localAudioRecordingError: null});
        } catch {
            update({localAudioRecordingError: 'Không thể bắt đầu ghi âm. Hãy kiểm tra micro và quyền sử dụng micro rồi thử lại.'});
        }
    }, [data.audioRecordingEnabled, data.backendSessionId, update]);

    const attachTtsAudioToRecording = useCallback((audio) => {
        const context = recordingAudioContextRef.current;
        const destination = recordingAudioDestinationRef.current;
        if (!data.audioRecordingEnabled || !context || !destination || ttsAudioSourcesRef.current.has(audio)) return;
        try {
            const source = context.createMediaElementSource(audio);
            source.connect(context.destination);
            source.connect(destination);
            ttsAudioSourcesRef.current.set(audio, source);
            context.resume().catch(() => {});
        } catch {
            update({localAudioRecordingError: 'Không thể ghi lại phần đọc câu hỏi. Bạn vẫn có thể tiếp tục buổi phỏng vấn.'});
        }
    }, [data.audioRecordingEnabled, update]);

    const handleTtsFallback = useCallback(() => {
        if (data.audioRecordingEnabled) {
            update({localAudioRecordingWarning: 'Trình đọc dự phòng của trình duyệt không thể được thu vào bản ghi. Câu hỏi vẫn có trong transcript, còn bản ghi âm gồm micro và các câu hỏi phát bằng TTS của hệ thống.'});
        }
    }, [data.audioRecordingEnabled, update]);

    const stopLocalInterviewRecording = useCallback(() => {
        const recorder = interviewRecorderRef.current;
        if (!recorder || recorder.state === 'inactive') return Promise.resolve();
        return new Promise((resolve) => {
            recordingStopResolverRef.current = resolve;
            recorder.stop();
        });
    }, []);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    const questions = useMemo(() => data.questions || [], [data.questions]);
    const currentQ = questions[currentIndex];
    const isTechnicalInterview = data.interviewConfig?.type === 'TECHNICAL';
    const canArmNoAnswerReminder = canAcceptInterviewAnswer({
        phase,
        sttStatus,
        isCodeEditorOpen: isTechnicalInterview && isCodeEditorOpen,
        isReminderActive: noAnswerReminderActive,
    });

    const createElevenLabsClient = useCallback((generation) => new ElevenLabsTranscriptionClient(({transcript, isFinal}) => {
        if (silencePromptActiveRef.current || generation !== sttGenerationRef.current || !transcript) return;
        if (isFinal) {
            const newTranscript = \`\${lastTranscriptRef.current} \${transcript}\`.trim();
            lastTranscriptRef.current = newTranscript;
            setFinalTranscript(newTranscript);
            interimTranscriptRef.current = '';
            setInterimTranscript('');
        } else {
            interimTranscriptRef.current = transcript;
            setInterimTranscript(transcript);
        }
    }), []);

    const prepareElevenLabsSTT = useCallback((questionId) => {
        if (!data.backendSessionId || !questionId || apiSttRef.current) return;
        const client = createElevenLabsClient(sttGenerationRef.current);
        apiSttRef.current = client;
        apiSttPreparationFailedRef.current = false;
        const language = data.interviewConfig?.language === 'en' ? 'en' : 'vi';
        client.connect(data.backendSessionId, language).catch((error) => {
            if (apiSttRef.current !== client) return;
            console.warn('[STT] Could not pre-connect ElevenLabs before the question.', error);
            apiSttPreparationFailedRef.current = true;
            apiSttRef.current = null;
            client.stop();
        });
    }, [createElevenLabsClient, data.backendSessionId, data.interviewConfig]);
    const startSTT = useCallback(async (stream) => {
        if (recognitionRef.current) return;
        const generation = sttGenerationRef.current;

        try {
            if (apiSttPreparationFailedRef.current) throw new Error('ElevenLabs preconnect failed; use browser fallback.');
            const apiStt = apiSttRef.current || createElevenLabsClient(generation);
            apiSttRef.current = apiStt;
            await apiStt.start(stream, data.backendSessionId, data.interviewConfig?.language);
            if (generation !== sttGenerationRef.current || silencePromptActiveRef.current) {
                apiStt.stop();
                if (apiSttRef.current === apiStt) apiSttRef.current = null;
                return;
            }
            setSttEngine('apiSTT');
            setSttStatus('ready');
            return;
        } catch (error) {
            console.warn('[STT] Realtime STT unavailable; trying browser speech recognition.', error);
            apiSttRef.current?.stop();
            apiSttRef.current = null;
        }

        if (generation !== sttGenerationRef.current || silencePromptActiveRef.current) return;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('[STT] Neither realtime nor browser speech recognition is available.');
            setSttEngine('none');
            setSttStatus('unavailable');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = data.interviewConfig?.language === 'en' ? 'en-US' : 'vi-VN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
            if (silencePromptActiveRef.current || generation !== sttGenerationRef.current) return;
            let finalPart = '';
            let interimPart = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalPart += `${event.results[i][0].transcript} `;
                else interimPart += event.results[i][0].transcript;
            }
            if (finalPart) {
                const newTranscript = `${lastTranscriptRef.current} ${finalPart}`.trim();
                lastTranscriptRef.current = newTranscript;
                setFinalTranscript(newTranscript);
            }
            interimTranscriptRef.current = interimPart;
            setInterimTranscript(interimPart);
        };

        recognition.onerror = (error) => console.error('Speech Recognition Error:', error);
        recognition.onend = () => {
            if (phaseRef.current === 'recording' && generation === sttGenerationRef.current
                && recognitionRef.current === recognition && !silencePromptActiveRef.current) {
                try { recognition.start(); } catch { /* recognition may already be active */ }
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setSttEngine('webspeech');
        setSttStatus('ready');
    }, [createElevenLabsClient, data.backendSessionId, data.interviewConfig]);

    const stopSTT = useCallback(() => {
        sttGenerationRef.current += 1;
        apiSttPreparationFailedRef.current = false;
        if (apiSttRef.current) {
            apiSttRef.current.stop();
            apiSttRef.current = null;
        }
        if (recognitionRef.current) {
            recognitionRef.current.onresult = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setInterimTranscript('');
        setSttEngine('none');
        setSttStatus('idle');
    }, []);

    const onQuestionAudioEnd = useCallback(() => {
        setPhase('recording');
    }, []);
    const { playTTS, stopAudio } = useElevenLabsTTS(onQuestionAudioEnd, {
        sessionId: data.backendSessionId,
        onAudioElement: attachTtsAudioToRecording,
        onFallback: handleTtsFallback,
    });

    const endInterview = useCallback(async ({ withClosing = true } = {}) => {
        setPhase('done');
        if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
        if (withClosing && currentQ?.id) {
            silencePromptActiveRef.current = true;
            stopSTT();
            await new Promise((resolve) => {
                playTTS(null, currentQ.id, data.interviewConfig?.language, 'CLOSING', {onEnd: resolve});
                window.setTimeout(resolve, 10000);
            });
        }
        await stopLocalInterviewRecording();
        stopAllTracks();
        stopSTT();
        try {
            await finishInterview();
        } catch (error) {
            console.error('Could not finalize interview quota:', error);
        }
        setTimeout(() => navigate('/interview/review'), 200);
    }, [finishInterview, navigate, stopAllTracks, stopSTT, stopLocalInterviewRecording, data.interviewConfig?.language, currentQ, playTTS]);

    const transitionToNext = useCallback(() => {
        if (skipStreakRef.current >= 2) {
            endInterview({withClosing: true});
            return;
        }
        let nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
            endInterview();
        } else {
            setIsCodeEditorOpen(false);
            setWrittenAnswer('');
            writtenAnswerRef.current = '';
            setCodeLanguage('text');
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
                skipStreakRef.current = wasSkipped ? skipStreakRef.current + 1 : 0;
            } catch (error) {
                const message = getApiErrorMessage(error, 'Không thể lưu câu trả lời.');
                update({ sessionError: message });
                setPhase('error');
                return;
            }
        }

        lastTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        lastSpeechActivityAtRef.current = null;
        setShowCurrent(false);

        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);

        processingTimerRef.current = setTimeout(() => {
            processingRef.current = false;
            transitionToNext();
        }, PROCESSING_DURATION);
    }, [questions, saveAnswer, stopSTT, update, transitionToNext]);

    const startListening = useCallback(async () => {
        const resumingSameQuestion = listeningQuestionIdRef.current === currentQ?.id;
        if (resumingSameQuestion && (recognitionRef.current || apiSttRef.current)) {
            console.debug('Live transcription already started for this question; skipping duplicate start.');
            return;
        }

        setSttStatus('connecting');
        listeningQuestionIdRef.current = currentQ?.id;

        setTimeout(() => setShowCurrent(true), 0);
        if (!resumingSameQuestion) {
            questionStartedAtRef.current = Date.now();
            lastSpeechActivityAtRef.current = null;
            firstSpokeAtRef.current = null;
            lastTranscriptRef.current = '';
            prevTranscriptRef.current = '';
            setFinalTranscript('');
        }

        try {
            const stream = await ensureStream();
            await startLocalInterviewRecording(stream);
            setMicState('active');
            startAudioAnalysis();
            await startSTT(stream);
        } catch (e) {
            console.error("Media setup failed:", e);
            setMicState('denied');
            setSttStatus('unavailable');
            listeningQuestionIdRef.current = null;
        }

        if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
        inQuestionTimerRef.current = setTimeout(() => {
            if (phaseRef.current === 'recording') transitionToProcessing();
        }, IN_QUESTION_TIMEOUT);
    }, [ensureStream, startAudioAnalysis, startSTT, transitionToProcessing, currentQ, startLocalInterviewRecording]);

    const promptAfterSilence = useCallback(() => {
        if (phaseRef.current !== 'recording' || lastTranscriptRef.current.trim()
            || interimTranscriptRef.current.trim() || writtenAnswerRef.current.trim()) return;
        noAnswerStageRef.current = 'speaking-reminder';
        setNoAnswerReminderActive(true);
        silencePromptActiveRef.current = true;
        stopSTT();
        setSttStatus('paused');

        const finishReminder = () => {
            if (noAnswerStageRef.current !== 'speaking-reminder') return;
            noAnswerStageRef.current = 'after-reminder';
            window.setTimeout(() => {
                if (phaseRef.current !== 'recording' || noAnswerStageRef.current !== 'after-reminder') return;
                silencePromptActiveRef.current = false;
                startListening().catch((error) => console.error('Could not resume speech recognition:', error));
            }, 500);
            noAnswerTimerRef.current = window.setTimeout(() => {
                const hasAnswer = lastTranscriptRef.current.trim() || interimTranscriptRef.current.trim() || writtenAnswerRef.current.trim();
                if (phaseRef.current === 'recording' && noAnswerStageRef.current === 'after-reminder' && !hasAnswer) {
                    noAnswerStageRef.current = 'idle';
                    setNoAnswerReminderActive(false);
                    transitionToProcessing();
                }
            }, NO_ANSWER_SKIP_MS);
        };

        if (!currentQ?.id) {
            finishReminder();
            return;
        }
        playTTS(null, currentQ.id, data.interviewConfig?.language, 'NO_ANSWER_REMINDER', {onEnd: finishReminder});
    }, [data.interviewConfig?.language, currentQ, playTTS, startListening, stopSTT, transitionToProcessing]);

    const armNoAnswerReminder = useCallback(() => {
        if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
        noAnswerStageRef.current = 'waiting';
        noAnswerTimerRef.current = window.setTimeout(() => {
            if (noAnswerStageRef.current === 'waiting') promptAfterSilence();
        }, NO_ANSWER_REMINDER_MS);
    }, [promptAfterSilence]);

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
                    questionAudioTimeout = setTimeout(async () => {
                        if (audioQuestionIdRef.current === currentQ.id) return;
                        audioQuestionIdRef.current = currentQ.id;
                        addTranscript('ai', currentQ.text);
                        const previousQuestion = currentIndex > 0 ? questions[currentIndex - 1] : null;
                        const previousAnswer = previousQuestion
                            ? data.answers.find((answer) => answer.qid === previousQuestion.id)
                            : null;
                        const transition = !previousQuestion
                            ? 'START'
                            : previousAnswer?.skipped ? 'SKIPPED' : 'ANSWERED';
                        if (data.audioRecordingEnabled && (!isTechnicalInterview || !isCodeEditorOpen)) {
                            try {
                                const stream = await ensureStream();
                                await startLocalInterviewRecording(stream);
                            } catch {
                                update({localAudioRecordingError: 'Không truy cập được micro. Hãy kiểm tra kết nối và quyền sử dụng micro rồi thử lại.'});
                            }
                        }
                        if (!isTechnicalInterview || !isCodeEditorOpen) prepareElevenLabsSTT(currentQ.id);
                        playTTS(currentQ.text, currentQ.id, data.interviewConfig?.language, transition);
                    }, 0);
                }
            } else {
                setTimeout(() => {
                    setPhase('recording');
                }, 0)
            }

        } else if (phase === 'recording' && (!isTechnicalInterview || !isCodeEditorOpen)) {
            recordingTimeout = setTimeout(() => {
                startListening().catch(console.error);
            }, 0);
        }

        return () => {
            if (recordingTimeout) clearTimeout(recordingTimeout);
            if (questionAudioTimeout) clearTimeout(questionAudioTimeout);
        };
    }, [phase, questions, currentQ, currentIndex, data.answers, startListening, prepareElevenLabsSTT, playTTS, data.interviewConfig?.language, data.interviewConfig?.type, data.audioRecordingEnabled, ensureStream, startLocalInterviewRecording, isTechnicalInterview, isCodeEditorOpen, addTranscript, update]);

    useEffect(() => {
        if (!canArmNoAnswerReminder) {
            if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
            noAnswerStageRef.current = 'idle';
            silencePromptActiveRef.current = false;
            return undefined;
        }
        armNoAnswerReminder();
        return () => {
            if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
            noAnswerStageRef.current = 'idle';
            silencePromptActiveRef.current = false;
        };
    }, [canArmNoAnswerReminder, currentQ?.id, armNoAnswerReminder]);

    useEffect(() => {
        if (phase !== 'recording') return;
        const interval = setInterval(() => {
            const now = Date.now();

            const currentFullText = (lastTranscriptRef.current + ' ' + interimTranscript).trim();
            const isTextChanging = isTranscriptChanging(prevTranscriptRef.current, currentFullText);
            prevTranscriptRef.current = currentFullText;

            const hasAudio = volumeRef.current > VAD_THRESHOLD;
            const isActuallySpeaking = isTextChanging;
            const isPreventingSkip = !silencePromptActiveRef.current && (hasAudio || isActuallySpeaking);

            if (isPreventingSkip) {
                if (noAnswerStageRef.current === 'waiting' || noAnswerStageRef.current === 'after-reminder') {
                    if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
                    noAnswerTimerRef.current = null;
                    noAnswerStageRef.current = 'idle';
                    setNoAnswerReminderActive(false);
                }
                if (!firstSpokeAtRef.current) {
                    firstSpokeAtRef.current = now;
                }

                if (isActuallySpeaking) {
                    lastSpeechActivityAtRef.current = now;
                }

                if (hasAudio) lastSpeechActivityAtRef.current = now;
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

    const handleWrittenAnswerSubmit = useCallback(() => {
        const answer = writtenAnswer.trim();
        if (!isTechnicalInterview || !isCodeEditorOpen || !answer || phaseRef.current !== 'recording') return;
        lastTranscriptRef.current = codeLanguage === 'text' ? answer : `\`\`\`${codeLanguage}\n${answer}\n\`\`\``;
        interimTranscriptRef.current = '';
        setWrittenAnswer('');
        writtenAnswerRef.current = '';
        transitionToProcessing();
    }, [codeLanguage, isCodeEditorOpen, isTechnicalInterview, transitionToProcessing, writtenAnswer]);

    const handleCodeEditorKeyDown = useCallback((event) => {
        if (event.key !== 'Tab') return;
        event.preventDefault();
        const editor = event.currentTarget;
        const {selectionStart, selectionEnd, value} = editor;
        setWrittenAnswer(`${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`);
        requestAnimationFrame(() => {
            editor.selectionStart = editor.selectionEnd = selectionStart + 2;
        });
    }, []);

    useEffect(() => {
        if (phase !== 'recording' || !isTechnicalInterview || !isCodeEditorOpen || !writtenAnswer.trim()) return undefined;
        const reminderTimer = window.setTimeout(() => {
            const submitAfterGrace = () => {
                codeIdleTimerRef.current = window.setTimeout(handleWrittenAnswerSubmit, CODE_IDLE_SUBMIT_MS);
            };
            if (!currentQ?.id) {
                submitAfterGrace();
                return;
            }
            playTTS(null, currentQ.id, data.interviewConfig?.language, 'CODE_IDLE_REMINDER', {onEnd: submitAfterGrace});
        }, CODE_IDLE_REMINDER_MS);
        return () => {
            clearTimeout(reminderTimer);
            if (codeIdleTimerRef.current) clearTimeout(codeIdleTimerRef.current);
            stopAudio();
        };
    }, [phase, isTechnicalInterview, isCodeEditorOpen, writtenAnswer, data.interviewConfig?.language, handleWrittenAnswerSubmit, currentQ?.id, playTTS, stopAudio]);

    const toggleCodeEditor = useCallback(() => {
        if (!isTechnicalInterview) return;
        if (isCodeEditorOpen && writtenAnswer.trim()) return;
        if (!isCodeEditorOpen) {
            stopSTT();
        }
        setIsCodeEditorOpen((isOpen) => !isOpen);
    }, [isTechnicalInterview, isCodeEditorOpen, writtenAnswer, stopSTT]);

    const cleanupRefs = useRef({ stopAllTracks, stopSTT, stopAudio, stopLocalInterviewRecording });

    useEffect(() => {
        cleanupRefs.current = { stopAllTracks, stopSTT, stopAudio, stopLocalInterviewRecording };
    }, [stopAllTracks, stopSTT, stopAudio, stopLocalInterviewRecording]);

    useEffect(() => {
        return () => {
            cleanupRefs.current.stopLocalInterviewRecording();
            cleanupRefs.current.stopAllTracks();
            cleanupRefs.current.stopSTT();
            cleanupRefs.current.stopAudio();
            if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
            if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
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
            <div className="interview-flow-page font-sans items-center justify-center p-6">
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
        <div className="interview-flow-page font-sans">
            <header
                className="w-full h-16 flex items-center justify-between px-6 bg-surface-container border-b border-outline-variant shadow-sm">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Smartfolio Logo" className="w-6 h-6 rounded-md object-cover" />
                    <span className="font-display font-bold text-xl tracking-tight text-primary">Smartfolio</span>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/30">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-sm font-semibold text-primary tracking-wide">PHÒNG PHỎNG VẤN</span>
                </div>
                <div className="flex items-center gap-4 text-on-surface-variant font-medium text-sm">
                    {data.audioRecordingEnabled && <span className="flex items-center gap-1.5 text-rose-300" title="Đang ghi âm micro và giọng đọc câu hỏi vào thiết bị này">
                        <Mic size={15} /> Ghi âm hội thoại
                    </span>}
                    <span className="flex items-center gap-2"><Clock size={16}/><span>Thời gian: {formatTime(elapsed)}</span></span>
                </div>
            </header>
            <main className="flex-1 relative flex flex-col items-center justify-center p-6 text-on-surface">
                <RecruiterAvatar phase={phase} />
                <div className="text-sm text-on-surface-variant mb-4 font-medium">
                    {data.interviewConfig?.type === 'HR' ? 'Anh Minh — HR FPT' : isTechnicalInterview ? 'Anh Hùng — Tech Lead FPT' : 'Chị Lan — HR Manager FPT'}
                </div>
                <div className="flex items-end gap-1 mb-6 h-16">
                    {audioLevels.map((h, i) => (
                        <div key={i}
                             className={`w-1.5 rounded-full transition-all duration-100 ${phase === 'recording' ? 'bg-primary' : phase === 'asking' ? 'bg-primary/40 animate-pulse' : 'bg-surface-container'}`}
                             style={{height: `${h}px`, minHeight: '4px'}}/>
                    ))}
                </div>
                <StatusPill phase={phase} currentIndex={currentIndex} total={questions.length} sttStatus={sttStatus}/>
                {showCurrent && currentQ && (
                    <div
                        className="mt-6 max-w-2xl w-full glass-panel border border-outline-variant rounded-2xl p-6 shadow-sm animate-fade-in">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 text-xs font-bold">AI</div>
                            <div className="flex-1">
                                <p className="text-lg font-medium text-on-surface leading-relaxed">{currentQ.text}</p>
                                {phase === 'recording' && isTechnicalInterview && (
                                    <div className="mt-4">
                                        <button type="button" onClick={toggleCodeEditor}
                                            disabled={isCodeEditorOpen && Boolean(writtenAnswer.trim())}
                                            aria-expanded={isCodeEditorOpen}
                                            aria-controls="technical-interview-answer-panel"
                                            className="rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60">
                                            {isCodeEditorOpen ? 'Đóng khung viết code' : 'Mở khung viết code nếu cần'}
                                        </button>
                                        {isCodeEditorOpen && writtenAnswer.trim() && <p className="mt-1 text-xs text-on-surface-variant">Gửi câu trả lời hoặc xóa nội dung trước khi đóng khung.</p>}
                                    </div>
                                )}
                                {phase === 'recording' && (
                                    isTechnicalInterview && isCodeEditorOpen ? <div id="technical-interview-answer-panel" className="mt-4 space-y-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <label htmlFor="technical-interview-answer" className="block text-sm font-semibold text-on-surface">Viết lời giải hoặc mã của bạn</label>
                                            <label className="flex items-center gap-2 text-xs text-on-surface-variant">
                                                Ngôn ngữ
                                                <select value={codeLanguage} onChange={(event) => setCodeLanguage(event.target.value)} className="rounded-md border border-outline-variant bg-surface-container px-2 py-1 text-on-surface">
                                                    <option value="text">Văn bản / giải thích</option>
                                                    <option value="javascript">JavaScript</option>
                                                    <option value="typescript">TypeScript</option>
                                                    <option value="python">Python</option>
                                                    <option value="java">Java</option>
                                                    <option value="csharp">C#</option>
                                                    <option value="cpp">C++</option>
                                                    <option value="c">C</option>
                                                    <option value="go">Go</option>
                                                    <option value="rust">Rust</option>
                                                    <option value="php">PHP</option>
                                                    <option value="sql">SQL</option>
                                                    <option value="html">HTML</option>
                                                    <option value="css">CSS</option>
                                                </select>
                                            </label>
                                        </div>
                                        <textarea
                                            id="technical-interview-answer"
                                            value={writtenAnswer}
                                            onChange={(event) => {
                                                const nextAnswer = event.target.value;
                                                setWrittenAnswer(nextAnswer);
                                                writtenAnswerRef.current = nextAnswer;
                                                if (nextAnswer.trim()) {
                                                    if (noAnswerTimerRef.current) clearTimeout(noAnswerTimerRef.current);
                                                    noAnswerTimerRef.current = null;
                                                    noAnswerStageRef.current = 'idle';
                                                    silencePromptActiveRef.current = false;
                                                    stopAudio();
                                                } else if (phaseRef.current === 'recording') {
                                                    armNoAnswerReminder();
                                                }
                                            }}
                                            onKeyDown={handleCodeEditorKeyDown}
                                            rows={8}
                                            spellCheck={false}
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            placeholder={codeLanguage === 'text' ? 'Giải thích cách bạn tiếp cận bài toán...' : `Viết lời giải bằng ${codeLanguage}...`}
                                            className="w-full resize-y rounded-xl border border-outline-variant bg-surface-container px-4 py-3 font-mono text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <div className="flex justify-end">
                                            <button type="button" disabled={!writtenAnswer.trim()} onClick={handleWrittenAnswerSubmit}
                                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50">Gửi câu trả lời</button>
                                        </div>
                                    </div> : <p className="mt-3 text-md text-primary italic animate-pulse">
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
                        {(!isTechnicalInterview || !isCodeEditorOpen) && phase === 'recording' && interimTranscript && (
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
                    {(!isTechnicalInterview || !isCodeEditorOpen) && (micState === 'denied' ? <button onClick={handleMicClick}
                        className="flex items-center gap-2 rounded-lg bg-rose-500/20 px-4 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/30">
                        <MicOff size={18}/>Bật lại mic
                    </button> : <span className="flex items-center gap-2 text-sm font-medium text-on-surface-variant">
                        <Mic size={18}/>{micState === 'active' ? 'Mic đang bật' : 'Đang kết nối mic'}
                    </span>)}
                </div>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <div className="text-sm text-on-surface-variant font-medium w-64 text-center">
                        {phase === 'asking' ? 'AI đang đọc câu hỏi...' : phase === 'recording' ? isTechnicalInterview && isCodeEditorOpen ? 'Hãy viết và gửi lời giải của bạn' : getInterviewRoomPrompt({ phase, sttStatus }) : phase === 'processing' ? 'Đang xử lý...' : ''}
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

function StatusPill({phase, currentIndex, total, sttStatus}) {
    if (phase === 'asking') return <div
        className="bg-primary/20 text-primary px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>AI đang đọc câu
        hỏi {currentIndex + 1}/{total}</div>;
    if (phase === 'recording' && (sttStatus === 'idle' || sttStatus === 'connecting')) return <div
        className="bg-surface-container text-on-surface-variant px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold"><LoaderCircle size={14} className="animate-spin"/>ĐANG KẾT NỐI NHẬN DIỆN</div>;
    if (phase === 'recording' && sttStatus === 'unavailable') return <div
        className="bg-rose-500/20 text-rose-300 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>CHƯA KẾT NỐI ĐƯỢC</div>;
    if (phase === 'recording' && sttStatus === 'paused') return <div
        className="bg-surface-container text-on-surface-variant px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold"><LoaderCircle size={14} className="animate-spin"/>AI ĐANG NHẮC LẠI</div>;
    if (phase === 'recording' && sttStatus === 'ready') return <div
        className="bg-primary/20 text-primary px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>ĐANG NHẬN DIỆN —
        Câu {currentIndex + 1}/{total}</div>;
    if (phase === 'processing') return <div
        className="bg-rose-500/20 text-rose-300 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse"></span>AI đang xử lý...
    </div>;
    return null;
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
