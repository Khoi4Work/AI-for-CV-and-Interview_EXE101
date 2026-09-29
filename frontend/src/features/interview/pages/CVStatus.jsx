// /src/pages/interview/CVStatus.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Upload, Lock } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import { interviewService } from '../services/interviewService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';

export default function CvStatus() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const [selected, setSelected] = useState(data.cvStatus || null);
  const [cvId, setCvId] = useState(data.cvId || '');
  const [cvs, setCvs] = useState([]);
  const [loadingCvs, setLoadingCvs] = useState(data.cvStatus === 'have');
  const [cvError, setCvError] = useState('');

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  useEffect(() => {
    if (selected !== 'have') return undefined;
    let active = true;
    interviewService.getGalleryAssets()
      .then((assets) => {
        if (!active) return;
        const availableCvs = assets?.cvs || [];
        setCvs(availableCvs);
        setCvId((previous) => (previous && availableCvs.some((cv) => cv.id === previous) ? previous : ''));
      })
      .catch((error) => {
        if (active) setCvError(getApiErrorMessage(error, 'Không thể tải danh sách CV.'));
      })
      .finally(() => {
        if (active) setLoadingCvs(false);
      });
    return () => { active = false; };
  }, [selected]);

  const handleNext = () => {
    if (!selected) return;
    update({ cvStatus: selected, cvId: selected === 'have' ? cvId : null });
    navigate('/interview/experience-level');
  };

  const handleSelectHaveCv = () => {
    setSelected('have');
    setLoadingCvs(true);
    setCvError('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-interview-radial font-sans relative">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-16 px-6 relative pb-32">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-10 w-full max-w-3xl mx-auto">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-4">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: '20%' }} />
            </div>
            <p className="text-sm text-on-surface-variant font-medium">Bước 2 trên 10 • 20% hoàn tất</p>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-on-surface mb-4">Bạn đã có CV chưa?</h1>
            <p className="text-on-surface-variant">Smartfolio sẽ giúp bạn tối ưu hóa hồ sơ dựa trên tình trạng hiện tại.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <div
              onClick={handleSelectHaveCv}
              className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col bg-interview-card-bg ${
                selected === 'have' ? 'selection-card-selected' : 'border-transparent shadow-sm hover:border-primary'
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-interview-icon-bg text-interview-icon-text flex items-center justify-center mb-6">
                <Upload className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Tôi đã có CV</h3>
              <p className="text-black text-sm mb-8 flex-grow leading-relaxed">
                Chúng tôi sẽ đánh giá bạn như là nguời đã từng tìm hiểu về công việc của mình, và sẽ có những câu hỏi đi sâu về chuyên môn hơn.
              </p>
              {/*<div className="flex items-center text-primary font-semibold text-sm">*/}
              {/*  Tải lên ngay <ArrowRight className="w-4 h-4 ml-1" />*/}
              {/*</div>*/}
            </div>

            <div
              onClick={() => setSelected('nothave')}
              className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col bg-interview-card-bg ${
                selected === 'nothave' ? 'selection-card-selected' : 'border-transparent shadow-sm hover:border-primary'
              }`}
            >
              <div className="w-14 h-14 rounded-xl bg-interview-icon-bg text-interview-icon-text flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-black mb-3">Tôi chưa có CV</h3>
              <p className="text-black text-sm mb-8 flex-grow leading-relaxed">
                Chúng tôi sẽ đánh giá bạn là người chưa từng đi xin việc, và sẽ có những câu hỏi gợi ý cho bạn nêu những gì mình thực sự có.
              </p>
              {/*<div className="flex items-center text-black font-semibold text-sm">*/}
              {/*  Tạo mới bằng Smartfolio*/}
              {/*</div>*/}
            </div>
          </div>

          {selected === 'have' && (
            <div className="bg-interview-card-bg rounded-xl border border-outline-variant p-5 mb-8">
              <label htmlFor="interview-cv" className="block text-sm font-semibold text-black mb-2">Chọn CV đã lưu</label>
              {loadingCvs ? <p className="text-sm text-black/60">Đang tải CV...</p> : (
                <select id="interview-cv" value={cvId} onChange={(event) => setCvId(event.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2.5 text-sm text-black">
                  <option value="">-- Chọn CV --</option>
                  {cvs.map((cv) => <option key={cv.id} value={cv.id}>{cv.name || 'CV chưa đặt tên'}</option>)}
                </select>
              )}
              {cvError && <p role="alert" className="mt-2 text-sm text-red-700">{cvError}</p>}
              {!loadingCvs && !cvError && cvs.length === 0 && <p className="mt-2 text-sm text-black/60">Bạn chưa có CV được lưu. <button type="button" onClick={() => navigate('/templates')} className="text-primary underline">Tạo CV</button></p>}
            </div>
          )}

          <div className="flex items-center justify-between w-full mt-4">
            <button
              onClick={() => navigate('/interview/job-selection')}
              className="flex items-center text-outline hover:text-on-surface font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </button>
            <div className="flex items-center text-outline text-xs">
              <Lock className="w-3 h-3 mr-1" /> Dữ liệu của bạn được bảo mật
            </div>
            <button
              onClick={handleNext}
              disabled={!selected || (selected === 'have' && (!cvId || loadingCvs))}
              className={`px-8 py-3 rounded-lg font-medium transition-colors shadow-sm ${
                selected && (selected !== 'have' || (cvId && !loadingCvs)) ? 'bg-primary text-on-primary hover:bg-primary-container' : 'bg-surface-container text-outline cursor-not-allowed'
              }`}
            >
              Tiếp tục
            </button>
          </div>
        </div>

        {/*<div className="fixed bottom-24 right-8 glass-panel p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-outline-variant max-w-3xl z-10 animate-fade-in-up">*/}
        {/*  <div className="flex gap-4 items-start">*/}
        {/*    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-1">*/}
        {/*      <Sparkles className="w-5 h-5 fill-current" />*/}
        {/*    </div>*/}
        {/*    <div>*/}
        {/*      <p className="text-xs font-bold text-on-surface mb-1">Gợi ý từ AI</p>*/}
        {/*      <p className="text-sm text-on-surface-variant leading-tight">Nên chọn "Tạo mới" nếu bạn muốn thay đổi định hướng nghề nghiệp!</p>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </main>

      <Footer />
    </div>
  );
}
