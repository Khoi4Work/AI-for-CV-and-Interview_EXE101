// /src/pages/interview/AudioSetup.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Mic, AudioLines, ArrowLeft, Square } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout.jsx';
import { useInterviewSession } from '../../hooks/useInterviewSession';

export function AudioSetup() {
  const navigate = useNavigate();
  const { update, setStep } = useInterviewSession();

  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // States mới cho việc lưu file và phát lại
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const streamRef = useRef(null); // Lưu stream riêng
  const mediaRecorderRef = useRef(null); // Lưu bộ ghi âm
  const audioChunksRef = useRef([]); // Lưu các mảnh âm thanh
  const audioPlayerRef = useRef(null); // Lưu trình phát audio

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  // Dọn dẹp bộ nhớ khi thoát trang
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, [audioUrl]);

  const startTest = async () => {
    try {
      // Reset lại url cũ nếu có
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 1. SETUP VẼ SÓNG ÂM (Visualizer)
      const AudioContextClass = window.AudioContext || window['webkitAudioContext'];
      const audioContext = new AudioContextClass();

      // Đánh thức AudioContext nếu bị trình duyệt chặn
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      // 2. SETUP GHI ÂM THỰC TẾ (MediaRecorder)
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url); // Có URL rồi thì nút Phát lại mới hoạt động được
      };

      mediaRecorder.start(); // Bắt đầu ghi
      setRecording(true);
      setRecorded(false);
      visualize();

    } catch (e) {
      console.warn('Mic access denied or unavailable:', e);
      setRecording(true);
      simulateLevels();
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const tick = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
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
    setAudioLevel(0); // Reset sóng âm về 0

    // Dừng vẽ
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // Dừng ghi âm để kích hoạt onstop -> tạo Blob URL
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Tắt mic
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }

    // Đóng AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
    }
  };

  // Hàm phát lại đoạn ghi âm
  const playAudio = () => {
    if (audioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause(); // Dừng nếu đang phát dở
      }

      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      setIsPlaying(true);

      audio.play();

      // Khi phát xong thì reset trạng thái
      audio.onended = () => {
        setIsPlaying(false);
      };
    }
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
                  className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg font-medium transition-colors ${
                      recording
                          ? 'border-red-500 text-red-500 hover:bg-red-50'
                          : 'border-[#1a56db] text-[#1a56db] hover:bg-blue-50'
                  }`}
              >
                {recording ? <Square size={18} fill="currentColor" /> : <Play size={18} />}
                {recording ? 'Dừng test' : 'Test recording'}
              </button>
              <button
                  disabled={!recorded || !audioUrl}
                  onClick={playAudio}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${
                      recorded && audioUrl
                          ? 'bg-blue-50 text-[#1a56db] hover:bg-blue-100'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isPlaying ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#1a56db] animate-pulse"></span>
                      Đang phát...
                    </>
                ) : (
                    <>
                      <Play size={18} />
                      Phát lại
                    </>
                )}
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