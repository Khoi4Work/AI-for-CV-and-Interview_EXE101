// /src/pages/interview/CareerGoal.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { useInterviewSession } from '../hooks/useInterviewSession.js';

const SUGGESTIONS = [
  '+ Học hỏi công nghệ mới',
  '+ Đóng góp giá trị',
  '+ Định hướng lãnh đạo',
  '+ Tối ưu quy trình',
];

export default function CareerGoal() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const [goal, setGoal] = useState(data.careerGoal || '');

  useEffect(() => {
    setStep(4);
  }, [setStep]);

  const handleAppend = (text) => {
    const prefix = goal.trim() ? `${goal.trim()} ` : '';
    setGoal(`${prefix}${text.replace('+ ', '')}`);
  };

  const handleNext = () => {
    update({ careerGoal: goal });
    navigate('/interview/setup');
  };

  return (
    <div className="min-h-screen flex flex-col bg-interview-radial font-sans text-on-surface">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-10 px-6 pb-20">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col items-center mb-10 w-full max-w-2xl mx-auto">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-4">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: '40%' }} />
            </div>
            <p className="text-sm text-on-surface-variant font-medium">Bước 4 trên 10 • 40% hoàn tất</p>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface mb-3">Mục tiêu nghề nghiệp?</h1>
            <p className="text-on-surface-variant text-base">Mô tả ngắn gọn về định hướng và giá trị bạn muốn mang lại. AI của chúng tôi sẽ giúp bạn hoàn thiện nó.</p>
          </div>

          <div className="bg-interview-card-bg rounded-2xl border border-outline-variant shadow-sm overflow-hidden mb-12">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full h-40 p-5 text-black placeholder-outline-variant focus:outline-none resize-none bg-interview-card-bg  rounded-t-2xl"
              placeholder="Tôi muốn đóng góp vào các dự án..."
            />

            <div className="bg-interview-card-bg p-5 border-t border-outline-variant">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-bold text-black">Gợi ý từ AI</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAppend(sug)}
                    className="bg-interview-card-bg text-black border-2 border-selection-border selection-card-hover px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer"
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
              className="w-full flex items-center justify-center bg-surface-container border border-on-primary text-outline py-3.5 rounded-xl text-sm font-bold hover:text-on-surface hover:bg-surface-container-low transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </button>
            <button
              onClick={handleNext}
              className="hover:text-on-primary hover:opacity-90 w-full flex items-center justify-center bg-primary text-on-primary/60 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-md"
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
