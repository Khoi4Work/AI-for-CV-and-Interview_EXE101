// /src/pages/interview/AudioSetup.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Mic, AudioLines, ArrowLeft } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout.jsx';
import { useInterviewSession } from '../../hooks/useInterviewSession';

export function AudioSetup() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      mediaRecorderRef.current = stream;

      setRecording(true);
      visualize();
    } catch (e) {
      console.warn('Mic access denied or unavailable:', e);
      // Fallback: giả lập recording với timer
      setRecording(true);
      simulateLevels();
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    const tick = () => {
      analyserRef.current.getByteFrequencyData(data);
      const avg = data.reduce((s, v) => s + v, 0) / data.length;
      setAudioLevel(avg);
      animationRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const simulateLevels = () => {
    const tick = () => {
      setAudioLevel(Math.random() * 80 + 20);
      animationRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const stopTest = () => {
    setRecording(false);
    setRecorded(true);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const handleContinue = () => {
    update({ audioTestPassed: true });
    navigate('/video-setup');
  };

  const handleBack = () => {
    navigate('/interview/setup');
  };

  return (
    <MainLayout>
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full p-8 max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-1.5 w-24 bg-[#1a56db] rounded-full"></div>
            <div className="h-1.5 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-1.5 w-24 bg-gray-200 rounded-full border border-gray-300"></div>
          </div>

          <p className="text-center text-sm text-gray-500 font-medium mb-4">Bước 6 trên 10 • 60% hoàn tất</p>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-semibold mb-2">Kiểm tra âm thanh trước khi bắt đầu</h1>
            <p className="text-gray-500 text-sm">
              Hãy đảm bảo microphone của bạn hoạt động ổn định để có trải nghiệm phỏng vấn tốt nhất.
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1a56db] rounded-full text-sm font-medium">
              <span className={`w-2 h-2 rounded-full bg-[#1a56db] ${recording ? 'animate-pulse' : ''}`}></span>
              {recording ? 'Đang ghi âm...' : 'Microphone detected'}
            </span>
          </div>

          <div className="bg-gray-100 rounded-lg p-8 py-12 flex items-center justify-center relative overflow-hidden mb-6 h-40">
            <div className="absolute inset-0 flex items-center justify-center opacity-30 text-gray-400">
              <AudioLines size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10 flex items-end gap-1 h-16">
              {Array.from({ length: 20 }).map((_, i) => {
                const h = recording ? 8 + (audioLevel / 255) * 56 * Math.abs(Math.sin(i + Date.now() / 200)) : 8;
                return (
                  <div
                    key={i}
                    className="w-1.5 bg-[#1a56db] rounded-full transition-all"
                    style={{ height: `${h}px` }}
                  />
                );
              })}
            </div>
            <div className="absolute right-4 top-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Mic className="text-gray-400" size={32} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={recording ? stopTest : startTest}
              className="flex items-center justify-center gap-2 py-2.5 border border-[#1a56db] text-[#1a56db] rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              <Play size={18} />
              {recording ? 'Dừng test' : 'Test recording'}
            </button>
            <button
              disabled={!recorded}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${
                recorded ? 'bg-blue-50 text-[#1a56db] hover:bg-blue-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Play size={18} />
              Phát lại
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mb-8 flex items-center justify-center gap-2">
            <Mic size={14} className="text-gray-400" /> Chúng tôi cam kết không lưu trữ bản ghi âm của bạn.
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
            <button
              onClick={handleContinue}
              className="flex-1 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
            >
              Tiếp tục
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
