// /src/pages/interview/InterviewSetup.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { INTERVIEW_TYPES, LANGUAGES, DURATIONS } from '../constants/interviewTypes.js';
import { COMPANIES } from '../constants/companies.js';
import { useInterviewSession } from '../hooks/useInterviewSession.js';

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
    <div className="min-h-screen flex flex-col bg-interview-radial font-sans text-on-surface">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-8 px-6 pb-20 relative">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-4">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: '50%' }} />
            </div>
            <p className="text-sm text-on-surface-variant font-medium">Bước 5 trên 10 • 50% hoàn tất</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-on-surface mb-2">Cấu hình phỏng vấn</h1>
            <p className="text-on-surface-variant text-sm">Thiết lập buổi luyện tập với các chi tiết để AI cá nhân hóa.</p>
          </div>

          <div className="bg-interview-card-bg rounded-2xl border border-outline-variant shadow-xl p-8 lg:p-10 w-full z-20">
            <div className="space-y-6">
              {/* Company (FPT cố định) */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Công ty</label>
                <div className="w-full bg-primary/15 border border-primary/30 text-black py-3 px-4 rounded-xl text-sm flex items-center justify-between">
                  <span className="font-medium">{fpt.name} <span className="text-black/60 font-normal">— {fpt.industry}</span></span>
                  <span className="text-xs text-black bg-interview-selection-bg px-2 py-0.5 rounded-full font-bold">Đã xác nhận</span>
                </div>
                <p className="text-xs text-black/60 mt-2 italic">"{fpt.culture}"</p>
              </div>

              {/* Interview Type */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Loại phỏng vấn</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {INTERVIEW_TYPES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all bg-interview-card-bg ${
                        type === t.id
                          ? 'selection-card-selected'
                          : 'border-transparent shadow-sm hover:border-primary'
                      }`}
                    >
                      <div className="font-bold text-black text-sm mb-1">{t.title}</div>
                      <div className="text-black text-xs">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Ngôn ngữ</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full appearance-none bg-interview-card-bg border border-outline-variant text-black font-medium py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      {LANGUAGES.map((l) => (
                        <option key={l.id} value={l.id}>{l.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black/40">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Thời lượng</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value)}
                        className={`py-2.5 px-1 border rounded-xl text-center transition-colors bg-interview-card-bg ${
                          duration === d.value
                            ? 'selection-card-selected'
                            : 'border-transparent shadow-sm hover:border-primary'
                        }`}
                      >
                        <div className={`font-bold text-lg text-black`}>{d.value}</div>
                        <div className={`text-xs text-black`}>phút</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* JD */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Mô tả công việc (JD)</label>
                <textarea
                  value={jd}
                  onChange={(e) => setJd(e.target.value)}
                  rows={4}
                  className="w-full bg-interview-card-bg border border-outline-variant text-black py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  placeholder="Dán JD vào đây để AI cá nhân hóa câu hỏi (tùy chọn)..."
                />
                <p className="text-xs text-black/60 mt-1">{jd.length} ký tự</p>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex gap-3 mt-2">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-black mb-1">Cá nhân hóa bằng AI</h4>
                  <p className="text-xs text-black/60 leading-relaxed">
                    AI sẽ dựa trên cấu hình + JD của bạn để sinh bộ câu hỏi phù hợp với vị trí ứng tuyển tại FPT.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => navigate('/interview/career-goal')}
                  className="w-full flex items-center justify-center bg-surface-container border border-outline-variant text-on-surface-variant py-3.5 rounded-xl text-sm font-bold hover:bg-surface-container-low transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </button>
                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center bg-primary text-on-primary py-3.5 rounded-xl text-sm font-bold hover:opacity-90 transition-colors shadow-md"
                >
                  Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>

              <p className="text-center text-[10px] text-outline mt-4">© 2024 Smartfolio AI Platform. Bảo mật thông tin người dùng là ưu tiên hàng đầu.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
