// /src/pages/interview/InterviewSetup.jsx
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Sparkles, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { INTERVIEW_TYPES, LANGUAGES, DURATIONS } from '../constants/interviewTypes.js';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import {normalizeInterviewType} from '../domain/interviewConfiguration.js';
import '../interview.css';

const MAX_JD_LENGTH = 50000;

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const savedDraft = data.interviewSetupDraft || data.interviewConfig || {};

  const [type, setType] = useState(() => {
    try {return INTERVIEW_TYPES.find(item => normalizeInterviewType(item.id) === normalizeInterviewType(savedDraft.type || 'HR'))?.id || 'HR';}
    catch {return 'HR';}
  });
  const [language, setLanguage] = useState(savedDraft.language || 'vi');
  const [duration, setDuration] = useState(savedDraft.duration || 10);
  const [jd, setJd] = useState(savedDraft.jd || '');
  const [jdId, setJdId] = useState(savedDraft.jdId || null);
  const [feedbackStyle, setFeedbackStyle] = useState(
    ['SUPPORTIVE', 'DIRECT', 'COACHING'].includes(savedDraft.feedbackStyle) ? savedDraft.feedbackStyle : 'SUPPORTIVE',
  );
  const [jdError, setJdError] = useState('');

  const quota = data.quotaSnapshot;
  const persistDraft = (patch) => update({
    interviewSetupDraft: { type, language, duration, jd, jdId, feedbackStyle, ...patch },
  });

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
    if (jd.length > MAX_JD_LENGTH) {
      setJdError('JD không được vượt quá 50.000 ký tự.');
      return;
    }
    setJdError('');
    update({
      interviewConfig: {
        type,
        language,
        duration:chosenDuration,
        jd,
        jdId,
        feedbackStyle,
      },
      interviewSetupDraft: { type, language, duration: chosenDuration, jd, jdId, feedbackStyle },
    });
    navigate('/audio-setup');
  };

  if (!quota) return <Navigate to="/interview/job-selection" replace />;

  return (
    <div className="interview-flow-page font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-8 px-6 pb-20 relative">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-10">
            <div className="interview-flow-progress-track w-full mb-4">
              <div className="interview-flow-progress-fill" style={{ width: '50%' }} />
            </div>
            <p className="interview-flow-progress-label text-sm font-medium">Bước 5 trên 10 • 50% hoàn tất</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="interview-flow-heading text-2xl font-bold mb-2">Cấu hình phỏng vấn</h1>
            <p className="interview-flow-description text-sm">Thiết lập buổi luyện tập với các chi tiết để AI cá nhân hóa.</p>
          </div>

          <div className="interview-flow-card interview-flow-card--prominent p-8 lg:p-10 w-full z-20">
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
                      onClick={() => { setType(t.id); persistDraft({ type: t.id }); }}
                      className={`interview-flow-choice text-left p-3 rounded-xl border-2 ${
                        type === t.id
                          ? 'selection-card-selected'
                          : 'shadow-sm'
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
                      onChange={(e) => { setLanguage(e.target.value); persistDraft({ language: e.target.value }); }}
                      className="interview-flow-control w-full appearance-none font-medium py-3 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
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
                    Quota Interview: {remainingMinutes} phút còn lại
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => { setDuration(d.value); persistDraft({ duration: d.value }); }}
                        disabled={!canChooseDuration(d.value)}
                        title={!canChooseDuration(d.value) ? (d.value > maxDuration ? `Gói hiện tại chỉ hỗ trợ tối đa ${maxDuration} phút/buổi` : 'Quota còn lại không đủ cho thời lượng này') : ''}
                        className={`interview-flow-choice interview-flow-choice--thin-border py-2.5 px-1 rounded-xl text-center disabled:opacity-40 disabled:cursor-not-allowed ${
                          chosenDuration === d.value
                            ? 'selection-card-selected'
                            : 'shadow-sm'
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

              <fieldset>
                <legend className="block text-sm font-semibold text-black mb-2">Cách AI phản hồi</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'SUPPORTIVE', title: 'Khích lệ', description: 'Nhẹ nhàng, tập trung vào tiến bộ.' },
                    { id: 'DIRECT', title: 'Trực tiếp', description: 'Nêu rõ điểm cần sửa, ngắn gọn.' },
                    { id: 'COACHING', title: 'Huấn luyện', description: 'Gợi ý từng bước để tự cải thiện.' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      aria-pressed={feedbackStyle === style.id}
                      onClick={() => { setFeedbackStyle(style.id); persistDraft({ feedbackStyle: style.id }); }}
                      className={`interview-flow-choice text-left p-3 rounded-xl border-2 ${feedbackStyle === style.id ? 'selection-card-selected' : 'shadow-sm'}`}
                    >
                      <span className="block font-bold text-black text-sm">{style.title}</span>
                      <span className="block text-black text-xs mt-1">{style.description}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-black/60 mt-2">Cách diễn đạt thay đổi; tiêu chí và điểm đánh giá vẫn giữ nguyên.</p>
              </fieldset>

              {/* JD */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Mô tả công việc (JD)</label>
                <textarea
                  value={jd}
                  maxLength={MAX_JD_LENGTH}
                  onChange={(e) => { const nextJd = e.target.value; setJd(nextJd); setJdId(null); setJdError(''); persistDraft({ jd: nextJd, jdId: null }); }}
                  rows={4}
                  className="interview-flow-control w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                  placeholder="Dán JD vào đây để AI cá nhân hóa câu hỏi (tùy chọn)..."
                />
                <p className="text-xs text-black/60 mt-1">{jd.length}/{MAX_JD_LENGTH} ký tự · JD tùy chọn</p>
                {jdError && <p role="alert" className="mt-1 text-xs text-red-700">{jdError}</p>}
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
                  className="interview-flow-button-secondary w-full flex items-center justify-center py-3.5 text-sm shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canChooseDuration(Number(chosenDuration))}
                  className="interview-flow-button-primary interview-flow-button-primary--dim-disabled w-full flex items-center justify-center py-3.5 text-sm shadow-md"
                >
                  Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
