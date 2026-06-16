// /src/pages/interview/InterviewRoom.jsx
// High-fidelity interview room với:
// - State machine: idle → asking (2.5s ẩn text) → recording (hiện text + mic + VAD) → processing (1.2s) → between (5s) → asking
// - Mic thật: getUserMedia + AnalyserNode để VAD
// - Cụm kết: regex VN + EN
// - 10s im lặng trong câu → skip
// - 5s im lặng giữa câu → skip
// - 2 skip liên tiếp (bất kỳ loại) → auto-end
// - KHÔNG side panel, KHÔNG suggestion, KHÔNG nút End
import React, {useEffect, useRef, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {Clock, Mic, MicOff, Volume2, ArrowRight, Settings as SettingsIcon, Sparkles} from 'lucide-react';
import {useInterviewSession} from '../../hooks/useInterviewSession';
import {END_PHRASES_VN, END_PHRASES_EN} from '../../constant/questionBank';

const ASKING_DURATION = 2500; // ms
const PROCESSING_DURATION = 1200;
const BETWEEN_DURATION = 5000;
const IN_QUESTION_TIMEOUT = 10000;
const VAD_THRESHOLD = 12;
const END_SILENCE_MS = 1500; // 1.5s im lặng sau nói cuối → kết thúc câu
const MIN_SPEAK_MS = 3000;    // phải nói ít nhất 3s

const END_PHRASE_REGEX = new RegExp(
  `(${END_PHRASES_VN.concat(END_PHRASES_EN).join('|')})`,
  'i'
);

export function InterviewRoom() {
  const navigate = useNavigate();
  const {data, update, generateQuestions, generateFeedback, saveAnswer, addTranscript} = useInterviewSession();

  // RoomGuard đã generate questions rồi. Ở đây chỉ cần setStep + start phase.
  useEffect(() => {
    update({step: 8});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStep = (n) => update({ step: n });

  // State machine
  const [phase, setPhase] = useState('asking'); // asking | recording | processing | between | done
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [micState, setMicState] = useState('idle'); // idle | requesting | active | denied
  const [audioLevels, setAudioLevels] = useState(new Array(20).fill(0));
  const [showCurrent, setShowCurrent] = useState(false); // ẩn text trong 2.5s asking

  // Refs
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
  const phaseRef = useRef(phase);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  const questions = data.questions || [];
  const currentQ = questions[currentIndex];

  // Setup mic khi vào recording
  const setupMic = useCallback(async () => {
    setMicState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setMicState('active');
      return true;
    } catch (e) {
      console.warn('Mic denied:', e);
      setMicState('denied');
      return false;
    }
  }, []);

  const startVAD = useCallback(() => {
    if (!analyserRef.current) return;
    const buf = new Uint8Array(analyserRef.current.frequencyBinCount);
    const tick = () => {
      if (phaseRef.current !== 'recording') return;
      analyserRef.current.getByteFrequencyData(buf);
      // Tính RMS của 0-2000Hz (khoảng 1/12 bins)
      const sampleBins = Math.min(buf.length, 24);
      let sum = 0;
      for (let i = 0; i < sampleBins; i++) sum += buf[i];
      const avg = sum / sampleBins;

      // Cập nhật waveform
      setAudioLevels((prev) => prev.map((_, i) => {
        const variation = Math.abs(Math.sin((Date.now() / 200) + i));
        return avg > VAD_THRESHOLD ? 8 + (avg / 255) * 56 * variation : 4;
      }));

      if (avg > VAD_THRESHOLD) {
        lastSpokeAtRef.current = Date.now();
        spokeDurationRef.current += 100;
        // Append vào rolling transcript (giả lập — không có STT thật)
        if (Math.random() < 0.15) {
          const words = ['tôi', 'làm', 'việc', 'với', 'team', 'dự án', 'công ty', 'kinh nghiệm', 'học hỏi', 'giải quyết', 'xây dựng'];
          lastTranscriptRef.current = (lastTranscriptRef.current + ' ' + words[Math.floor(Math.random() * words.length)]).slice(-200);
        }
      } else {
        setAudioLevels((prev) => prev.map(() => 4 + Math.random() * 4));
      }

      animationRef.current = requestAnimationFrame(tick);
    };
    tick();
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMic();
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
    };
  }, [stopMic]);

  // End interview: lưu feedback + navigate
  const endInterview = useCallback(() => {
    setPhase('done');
    stopMic();
    generateFeedback();
    // Đợi 1 tick để feedback được save
    setTimeout(() => {
      navigate('/interview/review');
    }, 200);
  }, [generateFeedback, navigate, stopMic]);

  // Xử lý kết thúc 1 câu
  const finishCurrentQuestion = useCallback((skipped) => {
    if (phaseRef.current !== 'recording' && phaseRef.current !== 'between') return;

    // Lưu answer
    const answerText = lastTranscriptRef.current.trim() || (skipped ? '' : '...');
    const qid = questions[currentIndexRef.current]?.id;
    if (qid) {
      saveAnswer(qid, {
        qid,
        text: skipped ? '' : answerText,
        durationMs: Date.now() - (questionStartedAtRef.current || Date.now()),
        skipped,
        startedAt: questionStartedAtRef.current,
        endedAt: Date.now(),
      });
    }

    // Add to transcript
    addTranscript('ai', questions[currentIndexRef.current]?.text || '');

    // Reset
    lastTranscriptRef.current = '';
    lastSpokeAtRef.current = null;
    spokeDurationRef.current = 0;
    setShowCurrent(false);

    // Check end
    if (currentIndexRef.current >= questions.length - 1) {
      endInterview();
      return;
    }

    // Chuyển sang between
    setPhase('processing');
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
    phaseTimerRef.current = setTimeout(() => {
      setPhase('between');
    }, PROCESSING_DURATION);
  }, [questions, saveAnswer, addTranscript, endInterview]);

  // Khi vào recording: setup mic, bắt đầu VAD, khởi động timer
  const startRecording = useCallback(async () => {
    setShowCurrent(true);
    addTranscript('ai', currentQ?.text || '');

    questionStartedAtRef.current = Date.now();
    lastSpokeAtRef.current = null;
    spokeDurationRef.current = 0;
    lastTranscriptRef.current = '';

    const ok = await setupMic();
    if (ok) {
      startVAD();
    } else {
      // Fallback: timer 10s không có voice → skip
    }

    // Timer 10s timeout tổng
    if (inQuestionTimerRef.current) clearTimeout(inQuestionTimerRef.current);
    inQuestionTimerRef.current = setTimeout(() => {
      if (phaseRef.current === 'recording') {
        finishCurrentQuestion(true); // skip
      }
    }, IN_QUESTION_TIMEOUT);
  }, [setupMic, startVAD, finishCurrentQuestion, addTranscript, currentQ]);

  // Phase machine driver
  useEffect(() => {
    if (phase === 'asking') {
      setShowCurrent(false);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = setTimeout(() => {
        setPhase('recording');
      }, ASKING_DURATION);
    } else if (phase === 'recording') {
      startRecording();
    } else if (phase === 'between') {
      // Wait BETWEEN_DURATION, nếu user không nói → skip
      setShowCurrent(false);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = setTimeout(() => {
        if (phaseRef.current === 'between') {
          finishCurrentQuestion(true);
        }
      }, BETWEEN_DURATION);
    }
  }, [phase]); // eslint-disable-line

  // Detect cụm kết & 1.5s im lặng sau nói cuối
  useEffect(() => {
    if (phase !== 'recording') return;
    const interval = setInterval(() => {
      // Check cụm kết
      if (END_PHRASE_REGEX.test(lastTranscriptRef.current)) {
        finishCurrentQuestion(false);
        return;
      }
      // Check 1.5s im lặng sau nói cuối + đã nói >= 3s
      const now = Date.now();
      if (
        lastSpokeAtRef.current &&
        spokeDurationRef.current >= MIN_SPEAK_MS &&
        now - lastSpokeAtRef.current >= END_SILENCE_MS
      ) {
        finishCurrentQuestion(false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [phase, finishCurrentQuestion]);

  // Move to next question
  useEffect(() => {
    if (phase === 'processing' && currentIndex < questions.length - 1) {
      // Wait for processing, then increment
      const t = setTimeout(() => {
        setCurrentIndex((i) => i + 1);
        setPhase('asking');
      }, PROCESSING_DURATION);
      return () => clearTimeout(t);
    }
  }, [phase, currentIndex, questions.length]);

  // User bấm "Sẵn sàng" trong between
  const handleReady = useCallback(() => {
    if (phase !== 'between') return;
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    finishCurrentQuestion(false);
  }, [phase, finishCurrentQuestion]);

  // Click Mic để toggle
  const handleMicClick = useCallback(() => {
    if (micState === 'denied') {
      setupMic();
    }
  }, [micState, setupMic]);

  // Elapsed time counter
  useEffect(() => {
    const t = setInterval(() => {
      if (data.startedAt) {
        setElapsed(Math.floor((Date.now() - data.startedAt) / 1000));
      }
    }, 1000);
    return () => clearInterval(t);
  }, [data.startedAt]);

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-dim font-sans">
        <div className="text-gray-500">Đang tải câu hỏi...</div>
      </div>
    );
  }

  // Nếu skipStreak >= 2 → force end
  useEffect(() => {
    if (data.skipStreak >= 2) {
      endInterview();
    }
  }, [data.skipStreak, endInterview]);

  // currentIndex out of bounds
  if (currentIndex >= questions.length) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white font-sans">
      {/* Header */}
      <header className="w-full h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#0b3c8f] rounded-md flex items-center justify-center text-white font-bold text-xs italic">S</div>
          <span className="font-display font-bold text-xl tracking-tight text-[#0b3c8f]">Smartfolio</span>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-[#1a56db]"></span>
          <span className="text-sm font-semibold text-[#1a56db] tracking-wide">PHÒNG PHỎNG VẤN</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
          <Clock size={16} />
          <span>Thời gian: {formatTime(elapsed)}</span>
        </div>
      </header>

      {/* Main stage */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-6">
        {/* AI Avatar */}
        <div className={`w-28 h-28 rounded-full mb-6 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden transition-all ${
          phase === 'asking' ? 'bg-blue-100 ring-4 ring-blue-200 animate-pulse' : 'bg-gray-200'
        }`}>
          {phase === 'asking' ? (
            <Volume2 className="w-12 h-12 text-[#1a56db]" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1a56db] to-[#0b3c8f] flex items-center justify-center text-white">
              <Sparkles className="w-12 h-12" />
            </div>
          )}
        </div>

        {/* AI status */}
        <div className="text-sm text-gray-500 mb-4 font-medium">
          {data.interviewConfig?.type === 'HR' ? 'Anh Minh — HR FPT' :
            data.interviewConfig?.type === 'Technical' ? 'Anh Hùng — Tech Lead FPT' :
            'Chị Lan — HR Manager FPT'}
        </div>

        {/* Waveform */}
        <div className="flex items-end gap-1 mb-6 h-16">
          {audioLevels.map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-full transition-all duration-100 ${
                phase === 'recording' ? 'bg-[#1a56db]' : phase === 'asking' ? 'bg-blue-300 animate-pulse' : 'bg-gray-300'
              }`}
              style={{ height: `${h}px`, minHeight: '4px' }}
            />
          ))}
        </div>

        {/* Status pill */}
        <StatusPill phase={phase} currentIndex={currentIndex} total={questions.length} />

        {/* Question card — ẩn 2.5s đầu */}
        {showCurrent && currentQ && (
          <div className="mt-6 max-w-2xl w-full bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 text-xs font-bold">AI</div>
              <p className="text-lg font-medium text-gray-800 leading-relaxed">{currentQ.text}</p>
            </div>
          </div>
        )}

        {/* Transcript log */}
        {data.transcriptLog && data.transcriptLog.length > 0 && (
          <div className="mt-4 max-w-2xl w-full max-h-32 overflow-y-auto space-y-1 text-sm text-gray-500">
            {data.transcriptLog.slice(-4).map((entry, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xs font-bold w-12 shrink-0">
                  {entry.role === 'ai' ? 'AI:' : 'Bạn:'}
                </span>
                <span className="line-clamp-1">{entry.text}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer controls */}
      <footer className="w-full h-20 bg-white border-t border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleMicClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              micState === 'active'
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : micState === 'denied'
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {micState === 'active' ? <Mic size={18} /> : <MicOff size={18} />}
            {micState === 'active' ? 'Mic đang bật' : micState === 'denied' ? 'Bật lại mic' : 'Bật mic'}
          </button>
          <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
            <SettingsIcon size={18} />
            Settings
          </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          {phase === 'between' ? (
            <button
              onClick={handleReady}
              className="flex items-center justify-center gap-2 bg-[#111c3a] hover:bg-black text-white px-8 py-3 w-64 rounded-xl font-medium transition-colors shadow-sm"
            >
              <ArrowRight size={18} />
              Sẵn sàng câu tiếp
            </button>
          ) : (
            <div className="text-sm text-gray-500 font-medium w-64 text-center">
              {phase === 'asking' ? 'AI đang đọc câu hỏi...' :
               phase === 'recording' ? '🎤 Hãy trả lời hoặc nói "xin hết"' :
               phase === 'processing' ? 'Đang xử lý...' : ''}
            </div>
          )}
        </div>

        <div className="w-[180px]"></div>
      </footer>
    </div>
  );
}

function StatusPill({phase, currentIndex, total}) {
  if (phase === 'asking') {
    return (
      <div className="bg-blue-100/50 text-[#1a56db] px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] animate-pulse"></span>
        AI đang đọc câu hỏi {currentIndex + 1}/{total}
      </div>
    );
  }
  if (phase === 'recording') {
    return (
      <div className="bg-red-100/50 text-red-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        ĐANG GHI ÂM — Câu {currentIndex + 1}/{total}
      </div>
    );
  }
  if (phase === 'processing') {
    return (
      <div className="bg-amber-100/50 text-amber-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
        AI đang xử lý...
      </div>
    );
  }
  if (phase === 'between') {
    return (
      <div className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold">
        Nói bất kỳ hoặc bấm "Sẵn sàng" để tiếp tục
      </div>
    );
  }
  return null;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
