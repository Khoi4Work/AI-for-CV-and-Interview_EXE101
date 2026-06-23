// /src/pages/interview/VideoSetup.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mic, Info, Lightbulb, Shirt, Image as ImageIcon, CheckCircle2, ChevronDown, ArrowLeft } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout';
import { useInterviewSession } from '../../hooks/useInterviewSession';

export function VideoSetup() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [audioLevels, setAudioLevels] = useState(new Array(20).fill(0));

  const audioContextRef = React.useRef(null);
  const analyserRef = React.useRef(null);
  const animationRef = React.useRef(null);

  useEffect(() => {
    setStep(7);
  }, [setStep]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const toggleCamera = async () => {
    if (cameraOn) {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
    } else {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
        setCameraOn(true);
        setMicOn(true);
      } catch (e) {
        console.warn('Camera/mic denied:', e);
      }
    }
  };

  const toggleMic = () => {
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn(!micOn);
  };

  const handleStart = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    update({ videoSetupConfirmed: true });
    navigate('/interview/room');
  };

  return (
    <MainLayout>
      <div className="w-full max-w-5xl mx-auto">
        <p className="text-center text-sm text-gray-500 font-medium mb-6">Bước 7 trên 10 • 70% hoàn tất</p>

        <h1 className="text-3xl font-display font-semibold text-center mb-8">Chuẩn bị Phỏng vấn Ghi hình</h1>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="bg-[#111111] rounded-xl aspect-video relative flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`w-full h-full object-cover ${cameraOn ? 'block' : 'hidden'}`}
              />
              {!cameraOn && (
                <div className="text-white/40 text-sm">Camera tắt — bấm Camera để bật</div>
              )}

              <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#d93025] bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wider">
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

            <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm flex flex-col sm:flex-row gap-4 ring-1 ring-blue-500/20">
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm font-medium text-gray-700">Máy ảnh:</span>
                  <CheckCircle2 size={16} className="text-green-500" fill="#22c55e" stroke="white" />
                </div>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-3 pr-8 rounded-md text-sm outline-none focus:border-[#1a56db]">
                    <option>Default Camera</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm font-medium text-gray-700">Microphone:</span>
                  <CheckCircle2 size={16} className="text-green-500" fill="#22c55e" stroke="white" />
                </div>
                <div className="relative">
                  <select className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2.5 px-3 pr-8 rounded-md text-sm outline-none focus:border-[#1a56db]">
                    <option>Default Microphone</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="inline-block px-3 py-1 bg-[#1a56db]/10 text-[#1a56db] rounded-md font-semibold text-sm mb-6 border border-[#1a56db]/20">
                Lưu ý quan trọng
              </div>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="mt-0.5 text-gray-400"><Lightbulb size={20} /></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Ánh sáng đủ:</p>
                    <p className="text-sm text-gray-500 mt-0.5">Đảm bảo khuôn mặt bạn được chiếu sáng rõ ràng, tránh ngược sáng.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-0.5 text-gray-400"><Mic size={20} /></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Micro hoạt động:</p>
                    <p className="text-sm text-gray-500 mt-0.5">Nói thử một vài câu để kiểm tra thanh âm lượng trên màn hình.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-0.5 text-gray-400"><Shirt size={20} /></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Trang phục chuyên nghiệp:</p>
                    <p className="text-sm text-gray-500 mt-0.5">Lựa chọn trang phục lịch sự như khi bạn đi phỏng vấn trực tiếp.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-0.5 text-gray-400"><ImageIcon size={20} /></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Phông nền sạch sẽ:</p>
                    <p className="text-sm text-gray-500 mt-0.5">Hạn chế đồ vật gây xao nhãng hoặc người đi lại phía sau.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-[#e8f0fe] rounded-xl p-4 flex gap-3 text-sm text-[#144296]">
              <Info size={20} className="shrink-0 text-[#1a56db]" />
              <p>Buổi phỏng vấn này sẽ kéo dài khoảng 15 phút. Bạn sẽ có 30 giây chuẩn bị cho mỗi câu hỏi.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto gap-3">
          <button
            onClick={() => navigate('/audio-setup')}
            className="w-full py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Quay lại
          </button>
          <button
            onClick={handleStart}
            className="w-full bg-[#3478ff] hover:bg-[#2a62d4] text-white py-3.5 rounded-lg font-medium shadow-sm transition-colors text-lg"
          >
            Bắt đầu phỏng vấn
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Bằng cách nhấn bắt đầu, bạn đồng ý với các <a href="#" className="underline text-gray-600">điều khoản ghi hình</a> của chúng tôi.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
