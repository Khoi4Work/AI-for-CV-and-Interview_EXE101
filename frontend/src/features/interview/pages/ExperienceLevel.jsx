// /src/pages/interview/ExperienceLevel.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, GraduationCap, Rocket, Medal, Crown } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { EXPERIENCE_LEVELS } from '../constants/experienceLevels.js';
import { useInterviewSession } from '../hooks/useInterviewSession.js';

const ICONS = { GraduationCap, Rocket, Medal, Crown };

export default function ExperienceLevel() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const [selected, setSelected] = useState(data.experienceLevel || null);

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const handleNext = () => {
    if (!selected) return;
    update({ experienceLevel: selected });
    navigate('/interview/career-goal');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans relative text-on-surface">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-10 px-6 pb-20">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-10 w-full max-w-3xl mx-auto">
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-4">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: '30%' }} />
            </div>
            <p className="text-sm text-on-surface-variant font-medium">Bước 3 trên 10 • 30% hoàn tất</p>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface mb-4">Mức độ kinh nghiệm của bạn?</h1>
            <p className="text-on-surface-variant text-lg">Điều này giúp chúng tôi cá nhân hóa các gợi ý AI và mẫu CV phù hợp nhất với lộ trình sự nghiệp của bạn.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-20">
            {EXPERIENCE_LEVELS.map((level) => {
              const Icon = ICONS[level.icon] || GraduationCap;
              const isSelected = selected === level.id;
              return (
                <div
                  key={level.id}
                  onClick={() => setSelected(level.id)}
                  className={`bg-surface-container p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col ${
                    isSelected ? 'border-primary shadow-md bg-primary/10' : 'border-outline-variant shadow-sm hover:border-primary'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isSelected ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-primary'}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-on-surface mb-2">{level.title}</h3>
                  <p className="text-on-surface-variant text-sm flex-grow leading-relaxed">{level.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => navigate('/interview/cv-status')}
              className="flex items-center text-on-surface-variant hover:text-on-surface font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </button>
            <button
              onClick={handleNext}
              disabled={!selected}
              className={`flex items-center px-8 py-3 rounded-xl font-medium transition-colors shadow-sm ${
                selected ? 'bg-primary text-on-primary hover:opacity-90' : 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant'
              }`}
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
