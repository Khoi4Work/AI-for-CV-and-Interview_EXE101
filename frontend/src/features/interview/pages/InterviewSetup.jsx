// /src/pages/interview/InterviewSetup.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { INTERVIEW_TYPES, LANGUAGES, DURATIONS } from '../constants/interviewTypes.js';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import { paymentService } from '../../payment/services/paymentService.js';
import {normalizeInterviewType} from '../services/interviewConfiguration.js';

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();

  const [type, setType] = useState(() => {
    try {return INTERVIEW_TYPES.find(item => normalizeInterviewType(item.id) === normalizeInterviewType(data.interviewConfig?.type || 'HR'))?.id || 'HR';}
    catch {return 'HR';}
  });
  const [language, setLanguage] = useState(data.interviewConfig?.language || 'vi');
  const [duration, setDuration] = useState(data.interviewConfig?.duration || 10);
  const [jd, setJd] = useState(data.interviewConfig?.jd || '');
  const [jdId, setJdId] = useState(data.interviewConfig?.jdId || null);
  const [quota, setQuota] = useState(null);
  const [quotaError, setQuotaError] = useState('');

  useEffect(() => {
    let active = true;
    paymentService.getCurrentQuota()
      .then((value) => { if (active) { setQuota(value); setQuotaError(''); } })
      .catch(() => { if (active) setQuotaError('Không tải được quota Interview. Vui lòng thử lại.'); });
    return () => { active = false; };
  }, []);

  const maxDuration = quota?.interviewPlan === 'ENHANCE' ? 15 : quota?.interviewPlan === 'MIDDLE' ? 10 : 5;
  const remainingMinutes = Number(quota?.remainingInterviewMinutes ?? 0);
  const canChooseDuration = (minutes) => minutes <= maxDuration && minutes <= remainingMinutes;
  const hasAvailableDuration = DURATIONS.some((item) => canChooseDuration(item.value));

  const chosenDuration=canChooseDuration(Number(duration))?Number(duration):DURATIONS.find(item=>canChooseDuration(item.value))?.value;

  useEffect(() => {
    setStep(5);
  }, [setStep]);

  const handleNext = () => {
    if (!quota || !canChooseDuration(Number(chosenDuration))) return;
    update({
      interviewConfig: {
        type,
        language,
        duration:chosenDuration,
        jd,
        jdId,
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
              {/* Company context is resolved from the selected JD on the server. */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Công ty</label>
                <div className="w-full bg-primary/15 border border-primary/30 text-black py-3 px-4 rounded-xl text-sm flex items-center justify-between">
                  <span className="font-medium">Theo JD được sử dụng trong buổi phỏng vấn</span>
                  <span className="text-xs text-black bg-interview-selection-bg px-2 py-0.5 rounded-full font-bold">Phỏng vấn mô phỏng</span>
                </div>
                <p className="text-xs text-black/60 mt-2">Khi chưa có thông tin văn hóa công ty có nguồn, câu hỏi sẽ dùng ngữ cảnh môi trường làm việc chung.</p>
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
                  <p className="text-xs text-black/70 mb-2" aria-live="polite">
                    Quota Interview: {quota ? `${remainingMinutes} phút còn lại` : quotaError || 'Đang tải...'}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value)}
                        disabled={!canChooseDuration(d.value)}
                        title={!canChooseDuration(d.value) ? (d.value > maxDuration ? `Gói hiện tại chỉ hỗ trợ tối đa ${maxDuration} phút/buổi` : 'Quota còn lại không đủ cho thời lượng này') : ''}
                        className={`py-2.5 px-1 border rounded-xl text-center transition-colors bg-interview-card-bg disabled:opacity-40 disabled:cursor-not-allowed ${
                          chosenDuration === d.value
                            ? 'selection-card-selected'
                            : 'border-transparent shadow-sm hover:border-primary'
                        }`}
                      >
                        <div className={`font-bold text-lg text-black`}>{d.value}</div>
                        <div className={`text-xs text-black`}>phút</div>
                      </button>
                    ))}
                  </div>
                  {quota && !hasAvailableDuration && (
                    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3" role="status">
                      <p className="text-sm font-semibold text-amber-900">
                        {remainingMinutes <= 0
                          ? 'Bạn đã dùng hết quota Interview.'
                          : `Bạn còn ${remainingMinutes} phút, chưa đủ cho buổi phỏng vấn tối thiểu 5 phút.`}
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        Mua thêm phút để tiếp tục. Quota mới sẽ được cộng vào số phút hiện có và không hết hạn.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/pricing#interview-plans')}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-amber-900 underline underline-offset-2"
                      >
                        Mua thêm quota Interview <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* JD */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Mô tả công việc (JD)</label>
                <textarea
                  value={jd}
                  onChange={(e) => {setJd(e.target.value); setJdId(null);}}
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
                    AI sẽ dựa trên loại phỏng vấn, cấp độ và JD của bạn để tạo câu hỏi luyện tập.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => navigate('/interview/career-goal')}
                  className="
                  w-full
                  flex
                  items-center
                  justify-center
                  bg-surface-container
                  border
                  border-on-primary
                  text-outline
                  py-3.5
                  rounded-xl
                  text-sm
                  font-bold
                  hover:text-on-surface
                  hover:bg-surface-container-low
                   transition-colors shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </button>
                <button
                  onClick={handleNext}
                  disabled={!quota || !canChooseDuration(Number(duration))}
                  className="
                  hover:text-on-primary
                  hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                  w-full flex items-center justify-center bg-primary text-on-primary/60 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-md"
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
