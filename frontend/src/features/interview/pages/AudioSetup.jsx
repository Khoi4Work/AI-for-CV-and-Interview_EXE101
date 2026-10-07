// /src/pages/interview/AudioSetup.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Mic, AudioLines, ArrowLeft, Square, ArrowRight} from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import { useMediaDevices } from '../../../hooks/useMediaDevices.js';

export function AudioSetup() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const {
    isRecording,
    isRecorded,
    audioUrl,
    isPlaying,
    audioLevels,
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    stopAllTracks
  } = useMediaDevices();
  const [recordingError, setRecordingError] = useState('');

  useEffect(() => {
    setStep(6);
  }, [setStep]);

  const handleContinue = () => {
    stopAllTracks();
    update({ audioTestPassed: true });
    navigate('/video-setup');
  };

  const handleRecordingClick = async () => {
    setRecordingError('');
    try {
      if (isRecording) stopRecording();
      else await startRecording();
    } catch (error) {
      setRecordingError(error?.name === 'NotAllowedError'
        ? 'Bạn cần cho phép trình duyệt truy cập microphone để test âm thanh.'
        : 'Không thể ghi âm thử. Hãy kiểm tra microphone và thử lại.');
    }
  };

  const handleBack = () => {
    navigate('/interview/setup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-interview-radial font-sans relative text-on-surface">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-interview-card-bg rounded-xl shadow-sm border border-outline-variant w-full p-8 max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="h-1.5 w-24 bg-primary rounded-full"></div>
            <div className="h-1.5 w-24 bg-gray-300 rounded-full"></div>
            <div className="h-1.5 w-24 bg-gray-300 rounded-full border border-gray-400"></div>
          </div>

          <p className="text-center text-sm text-black/60 font-medium mb-4">Bước 6 trên 10 • 60% hoàn tất</p>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-semibold mb-2 text-black">Kiểm tra âm thanh trước khi bắt đầu</h1>
            <p className="text-black/60 text-sm">
              Làm theo các bước dưới đây để kiểm tra micro trước khi tiếp tục.
            </p>
          </div>

          <ol className="mb-6 space-y-2 rounded-lg bg-primary/5 p-4 text-sm text-black/75 list-decimal list-inside">
            <li>Ấn <strong>Test recording</strong> và cho phép trình duyệt dùng microphone nếu được hỏi.</li>
            <li>Nói thử vài câu, sau đó ấn <strong>Dừng test</strong>.</li>
            <li>Ấn <strong>Phát lại</strong> để nghe và kiểm tra âm lượng, độ rõ.</li>
          </ol>

          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-on-primary rounded-full text-sm font-medium">
              <span className={`w-2 h-2 rounded-full bg-on-primary ${isRecording ? 'animate-pulse' : ''}`}></span>
              {isRecording ? 'Đang ghi âm...' : 'Microphone detected'}
            </span>
          </div>

          {/*Audio Pulse*/}
          <div className="bg-black/10 rounded-lg p-8 py-12 flex items-center justify-center relative overflow-hidden mb-6 h-40">
            <div className="absolute inset-0 flex items-center justify-center opacity-30 text-black/40">
              <AudioLines size={120} strokeWidth={1} />
            </div>
            <div className="relative z-10 flex items-end gap-1 h-16">
              {audioLevels.map((level, i) => (
                <div
                    key={i}
                    className="w-1.5 bg-primary rounded-full transition-[height] duration-75"
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
                onClick={handleRecordingClick}
                className={`flex items-center justify-center gap-2 py-2.5 border rounded-lg font-medium transition-colors ${
                    isRecording
                      ? 'border-red-500 text-red-500 hover:bg-red-50'
                      : 'border-interview-selection-border text-black hover:bg-primary/10'
                }`}
            >
              {isRecording ? <Square size={18} fill="currentColor" /> : <Play size={18} />}
              {isRecording ? 'Dừng test' : 'Test recording'}
            </button>
            <button
                disabled={!isRecorded || !audioUrl}
                onClick={isPlaying ? stopAudio : playAudio}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${
                    isRecorded && audioUrl
                      ? 'bg-primary text-on-primary hover:bg-primary-container'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              {isPlaying ? (
                <>
                  <Square size={18} fill="currentColor" />
                  Dừng phát
                </>
              ) : (
                <>
                  <Play size={18} />
                  Phát lại
                </>
              )}
            </button>
          </div>

          {recordingError && <p role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{recordingError}</p>}

          <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-lg border border-outline-variant p-4 text-sm text-black/75">
            <input
              type="checkbox"
              checked={Boolean(data.audioRecordingEnabled)}
              onChange={(event) => update({audioRecordingEnabled: event.target.checked})}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span><strong>Cho phép ghi âm cuộc phỏng vấn để tải về sau.</strong> Bản ghi ghép giọng đọc câu hỏi của hệ thống với âm thanh microphone và chỉ lưu trong trình duyệt trên thiết bị này; không gửi lên máy chủ. Bạn có thể bỏ chọn nếu chỉ muốn lưu transcript.</span>
          </label>

          <p className="text-center text-sm text-black/60 mb-8 flex items-center justify-center gap-2">
            <Mic size={14} className="text-black/40" /> Test recording chỉ dùng để bạn nghe thử và không được lưu sau khi rời bước này.
          </p>

          <div className="flex flex-col gap-3 pt-2">
            <button
                onClick={handleBack}
                className="w-full flex items-center justify-center bg-surface-container border border-on-primary text-outline py-3.5 rounded-xl text-sm font-bold hover:text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </button>
            <button
                onClick={handleContinue}
                className="hover:text-on-primary hover:opacity-90 w-full flex items-center justify-center bg-primary text-on-primary/60 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-md"
            >
              Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
