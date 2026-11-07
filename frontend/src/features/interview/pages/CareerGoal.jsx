// /src/pages/interview/CareerGoal.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import './interview-pages.css';

const SUGGESTIONS = [
  '+ Học hỏi công nghệ mới',
  '+ Đóng góp giá trị',
  '+ Định hướng lãnh đạo',
  '+ Tối ưu quy trình',
];
const MAX_GOAL_LENGTH = 1000;

export default function CareerGoal() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const [goal, setGoal] = useState(data.careerGoal || '');

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const handleAppend = (text) => {
    const suggestion = text.replace(/^\+\s*/, '').trim();
    if (goal.toLocaleLowerCase().includes(suggestion.toLocaleLowerCase())) return;
    const prefix = goal.trim() ? `${goal.trim()} ` : '';
    const nextGoal = `${prefix}${suggestion}`.slice(0, MAX_GOAL_LENGTH);
    setGoal(nextGoal);
    update({ careerGoal: nextGoal });
  };

  const handleNext = () => {
    update({ careerGoal: goal });
    navigate('/interview/setup');
  };

  return (
    <div className="interview-flow-page font-sans">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-10 px-6 pb-20">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center mb-10 w-full max-w-2xl mx-auto">
            <div className="interview-flow-progress-track w-full mb-4">
              <div className="interview-flow-progress-fill" style={{ width: '40%' }} />
            </div>
            <p className="interview-flow-progress-label text-sm font-medium">Bước 4 trên 10 • 40% hoàn tất</p>
          </div>

          <div className="mb-8">
            <h1 className="interview-flow-heading text-3xl font-bold mb-3">Mục tiêu nghề nghiệp?</h1>
            <p className="interview-flow-description text-base">Mô tả ngắn gọn về định hướng và giá trị bạn muốn mang lại. AI của chúng tôi sẽ giúp bạn hoàn thiện nó.</p>
          </div>

          <div className="interview-flow-card overflow-hidden mb-12">
            <textarea
              value={goal}
              onChange={(e) => { const nextGoal = e.target.value.slice(0, MAX_GOAL_LENGTH); setGoal(nextGoal); update({ careerGoal: nextGoal }); }}
              maxLength={MAX_GOAL_LENGTH}
              aria-label="Mục tiêu nghề nghiệp"
              className="interview-flow-control w-full h-40 p-5 focus:outline-none resize-none rounded-t-2xl"
              placeholder="Tôi muốn đóng góp vào các dự án..."
            />
            <p className="px-5 pb-3 text-right text-xs text-on-surface-variant">{goal.length}/{MAX_GOAL_LENGTH}</p>

            <div className="bg-white p-5 border-t border-outline-variant">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-bold text-black">Gợi ý từ AI</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-pressed={goal.toLocaleLowerCase().includes(sug.replace(/^\+\s*/, '').toLocaleLowerCase())}
                    onClick={() => handleAppend(sug)}
                    className={`bg-interview-card-bg text-black border-2 border-selection-border selection-card-hover px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${goal.toLocaleLowerCase().includes(sug.replace(/^\+\s*/, '').toLocaleLowerCase()) ? 'ring-2 ring-primary/30' : ''}`}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-outline-variant mb-8" />

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => navigate('/interview/experience-level')}
              className="interview-flow-button-secondary w-full flex items-center justify-center py-3.5 text-sm shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </button>
            <button
              onClick={handleNext}
              className="interview-flow-button-primary w-full flex items-center justify-center py-3.5 text-sm shadow-md"
            >
              Bắt đầu ngay
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-2">
              Thông tin này sẽ được sử dụng để tối ưu hồ sơ Smartfolio của bạn.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
