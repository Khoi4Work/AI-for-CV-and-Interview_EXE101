// /src/pages/interview/VideoSetup.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, Info, Lightbulb, Shirt, Image as ImageIcon, CheckCircle2, ChevronDown, ArrowLeft } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import { useMediaDevices } from '../../../hooks/useMediaDevices.js';

export function VideoSetup() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const duration = data.interviewConfig?.duration || 15;
  const {
    stream,
    cameraOn,
    micOn,
    toggleCamera,
    toggleMic,
    stopAllTracks
  } = useMediaDevices();
  const videoRef = React.useRef(null);

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const handleStart = () => {
    stopAllTracks();
    update({ videoSetupConfirmed: true });
    navigate('/interview/room');
  };

  return (
    <div className="min-h-screen flex flex-col bg-interview-radial font-sans relative text-on-surface">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-5xl mx-auto">
          <p className="text-center text-sm text-black/60 font-medium mb-6">Bước 7 trên 10 • 70% hoàn tất</p>

          <h1 className="text-3xl font-display font-semibold text-center mb-8 text-on-surface">Chuẩn bị Phỏng vấn Ghi hình</h1>

          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 mb-8">
            <div className="flex flex-col gap-4">
              <div className="bg-black rounded-xl aspect-video relative flex items-center justify-center overflow-hidden border border-outline-variant shadow-sm">
                {cameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white/40 text-sm">Camera tắt — bấm Camera để bật</div>
                )}

                <div className="absolute top-4 left-4 flex items-center gap-2 bg-rose-600 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
                  <div className="w-2 h-2 rounded-full bg-white opacity-90 animate-pulse"></div>
                  {cameraOn ? 'LIVE' : 'LIVE PREVIEW'}
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">
                  <button
                    onClick={toggleCamera}
                    className={`p-2 rounded-full text-white ${cameraOn ? 'bg-white/20' : 'bg-red-500/70'}`}
                  >
                    <Camera size={20} />
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`p-2 rounded-full text-white ${micOn ? 'bg-white/20' : 'bg-red-500/70'}`}
                  >
                    <Mic size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-interview-card-bg rounded-xl p-4 border border-primary/30 shadow-sm flex flex-col sm same-row gap-4 ring-1 ring-primary/20">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm font-medium text-black">Máy ảnh:</span>
                    <CheckCircle2 size={16} className="text-green-500" fill="#22c55e" stroke="white" />
                  </div>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-3 pr-8 rounded-md text-sm outline-none focus:border-primary">
                      <option>Default Camera</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm font-medium text-black">Microphone:</span>
                    <CheckCircle2 size={16} className="text-green-500" fill="#22c55e" stroke="white" />
                  </div>
                  <div className="relative">
                    <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-3 pr-8 rounded-md text-sm outline-none focus:border-primary">
                      <option>Default Microphone</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-interview-card-bg border border-outline-variant rounded-xl p-6 shadow-sm">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-green-900 rounded-md font-semibold text-sm mb-6 border border-primary/30">
                  <Info size={20} className="shrink-0" />
                  <span>Lưu ý quan trọng</span>
                </div>

                <ul className="space-y-6">
                  <li className="flex gap-4">
                    <div className="mt-0.5 text-black/40"><Lightbulb size={20} /></div>
                    <div>
                      <p className="font-medium text-black text-sm">Ánh sáng đủ:</p>
                      <p className="text-black/60 text-sm mt-0.5">Đảm bảo khuôn mặt bạn được chiếu sáng rõ ràng, tránh ngược sáng.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-0.5 text-black/40"><Mic size={20} /></div>
                    <div>
                      <p className="font-medium text-black text-sm">Micro hoạt động:</p>
                      <p className="text-black/60 text-sm mt-0.5">Nói thử một vài câu để kiểm tra thanh âm lượng trên màn hình.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-0.5 text-black/40"><Shirt size={20} /></div>
                    <div>
                      <p className="font-medium text-black text-sm">Trang phục chuyên nghiệp:</p>
                      <p className="text-black/60 text-sm mt-0.5">Lựa chọn trang phục lịch sự như khi bạn đi phỏng vấn trực tiếp.</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="mt-0.5 text-black/40"><ImageIcon size={20} /></div>
                    <div>
                      <p className="font-medium text-black text-sm">Phông nền sạch sẽ:</p>
                      <p className="text-black/60 text-sm mt-0.5">Hạn chế đồ vật gây xao nhãng hoặc người đi lại phía sau.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-primary/10 rounded-xl p-4 flex gap-3 text-sm text-primary border border-primary/20">
                <Info size={20} className="shrink-0" />
                <p>Buổi phỏng vấn này sẽ kéo dài khoảng {duration} phút. Bạn sẽ có 5 giây chuẩn bị cho mỗi câu hỏi.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center mt-12 gap-3">
            <button
              onClick={() => navigate('/audio-setup')}
              className="w-full max-w-2xl py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} /> Quay lại
            </button>
            <button
              onClick={handleStart}
              className="w-full max-w-2xl bg-primary hover:bg-primary-container text-on-primary py-3.5 rounded-lg font-medium shadow-sm transition-colors text-lg"
            >
              Bắt đầu phỏng vấn
            </button>
            <p className="text-xs text-black/60 mt-1">
              Bằng cách nhấn bắt đầu, bạn đồng ý với các <a href="#" className="underline text-primary">điều khoản ghi hình</a> của chúng tôi.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
