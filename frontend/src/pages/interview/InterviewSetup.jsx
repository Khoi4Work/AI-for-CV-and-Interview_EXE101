// /src/pages/interview/InterviewSetup.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/layout/PublicHeader.jsx';
import { Footer } from '../../components/layout/Footer.jsx';
import { INTERVIEW_TYPES, LANGUAGES, DURATIONS } from '../../constants/interviewTypes.js';
import { COMPANIES } from '../../constants/companies.js';
import { useInterviewSession } from '../../hooks/useInterviewSession';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const fpt = COMPANIES[0];

  const [type, setType] = useState(data.interviewConfig?.type || 'HR');
  const [language, setLanguage] = useState(data.interviewConfig?.language || 'vi');
  const [duration, setDuration] = useState(data.interviewConfig?.duration || 10);
  const [jd, setJd] = useState(data.interviewConfig?.jd || '');

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  const handleNext = () => {
    update({
      interviewConfig: {
        type,
        language,
        duration,
        company: fpt,
        jd,
      },
    });
    navigate('/audio-setup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-8 px-6 pb-20 relative">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-4">
              <div className="bg-blue-800 h-full rounded-full transition-all" style={{ width: '50%' }} />
            </div>
            <p className="text-sm text-gray-500 font-medium">Bước 5 trên 10 • 50% hoàn tất</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Cấu hình phỏng vấn</h1>
            <p className="text-gray-500 text-sm">Thiết lập buổi luyện tập với các chi tiết để AI cá nhân hóa.</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 lg:p-10 w-full z-20">
            <div className="space-y-6">
              {/* Company (FPT cố định) */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Công ty</label>
                <div className="w-full bg-blue-50 border border-blue-200 text-gray-900 py-3 px-4 rounded-xl text-sm flex items-center justify-between">
                  <span className="font-medium">{fpt.name} <span className="text-gray-500 font-normal">— {fpt.industry}</span></span>
                  <span className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">Đã xác nhận</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 italic">"{fpt.culture}"</p>
              </div>

              {/* Interview Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Loại phỏng vấn</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${
                        type === t.id
                          ? 'border-[#1a56db] bg-blue-50/30 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 text-sm mb-1">{t.title}</div>
                      <div className="text-xs text-gray-500">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Ngôn ngữ</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-medium py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.id} value={l.id}>{l.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Thời lượng</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value)}
                        className={`py-2.5 px-1 border rounded-xl text-center transition-colors ${
                          duration === d.value
                            ? 'bg-blue-100/50 border-blue-200 shadow-inner'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`font-bold text-lg ${duration === d.value ? 'text-blue-700' : 'text-gray-900'}`}>{d.value}</div>
                        <div className={`text-xs ${duration === d.value ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>phút</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* JD */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Mô tả công việc (JD)</label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  rows={4}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                  placeholder="Dán JD vào đây để AI cá nhân hóa câu hỏi (tùy chọn)..."
                />
                <p className="text-xs text-gray-500 mt-1">{jd.length} ký tự</p>
              </div>

              <div className="bg-[#f4f7fa] border border-blue-100 rounded-xl p-4 flex gap-3 mt-2">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Cá nhân hóa bằng AI</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    AI sẽ dựa trên cấu hình + JD của bạn để sinh bộ câu hỏi phù hợp với vị trí ứng tuyển tại FPT.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => navigate('/interview/career-goal')}
                  className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center bg-[#0e3a9f] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-md"
                >
                  Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              <p className="text-center text-[10px] text-gray-400 mt-4">© 2024 Smartfolio AI Platform. Bảo mật thông tin người dùng là ưu tiên hàng đầu.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
