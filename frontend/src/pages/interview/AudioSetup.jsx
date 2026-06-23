import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Mic, AudioLines, ArrowLeft, Square } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout.jsx';
import { useInterviewSession } from '../../hooks/useInterviewSession';
import { useMediaDevices } from '../../hooks/useMediaDevices';

export function AudioSetup() {
  const navigate = useNavigate();
  const { update, setStep } = useInterviewSession();
  const {
    isRecording,
    isRecorded,
    audioUrl,
    isPlaying,
    audioLevels,
    startRecording,
    stopRecording,
    playAudio,
    stopAllTracks
  } = useMediaDevices();

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  const handleContinue = () => {
    stopAllTracks();
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
              <span className={`w-2 h-2 rounded-full bg-[#1a56db] ${isRecording ? 'animate-pulse' : ''}`}></span>
              {isRecording ? 'Đang ghi âm...' : 'Microphone detected'}
            </span>
            </div>

            <div className="bg-gray-100 rounded-lg p-8 py-12 flex items-center justify-center relative overflow-hidden mb-6 h-40">
              <div className="absolute inset-0 flex items-center justify-center opacity-30 text-gray-400">
                <AudioLines size={120} strokeWidth={1} />
              </div>
              <div className="relative z-10 flex items-end gap-1 h-16">
                {audioLevels.map((level, i) => (
                  <div
                      key={i}
                      className="w-1.5 bg-[#1a56db] rounded-full transition-all"
                      style={{ height: `${level}px` }}
                  />
                ))}
              </div>
              <div className="absolute right-4 top-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Mic className="text-gray-400" size={32} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg font-medium transition-colors ${
                      isRecording
                          ? 'border-red-500 text-red-500 hover:bg-red-50'
                          : 'border-[#1a56db] text-[#1a56db] hover:bg-blue-50'
                  }`}
              >
                {isRecording ? <Square size={18} fill="currentColor" /> : <Play size={18} />}
                {isRecording ? 'Dừng test' : 'Test recording'}
              </button>
              <button
                  disabled={!isRecorded || !audioUrl}
                  onClick={playAudio}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${
                      isRecorded && audioUrl
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
