// /src/pages/interview/ExperienceLevel.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, GraduationCap, Rocket, Medal, Crown } from 'lucide-react';
import { Header } from '../../components/layout/PublicHeader.jsx';
import { Footer } from '../../components/layout/Footer.jsx';
import { EXPERIENCE_LEVELS } from '../../constants/interview/experienceLevels.js';
import { useInterviewSession } from '../../hooks/useInterviewSession';

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
    <div className="min-h-screen flex flex-col bg-white font-sans relative">
      <Header />

      <main className="flex-grow flex flex-col items-center pt-10 px-6 pb-20">
        <div className="w-full max-w-3xl">
          <div className="flex flex-col items-center mb-10 w-full max-w-3xl mx-auto">
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-4">
              <div className="bg-blue-800 h-full rounded-full transition-all" style={{ width: '30%' }} />
            </div>
            <p className="text-sm text-gray-500 font-medium">Bước 3 trên 10 • 30% hoàn tất</p>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Mức độ kinh nghiệm của bạn?</h1>
            <p className="text-gray-600 text-lg">Điều này giúp chúng tôi cá nhân hóa các gợi ý AI và mẫu CV phù hợp nhất với lộ trình sự nghiệp của bạn.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-20">
            {EXPERIENCE_LEVELS.map((level) => {
              const Icon = ICONS[level.icon] || GraduationCap;
              const isSelected = selected === level.id;
              return (
                <div
                  key={level.id}
                  onClick={() => setSelected(level.id)}
                  className={`bg-white p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col ${
                    isSelected ? 'border-blue-100 shadow-md ring-0 bg-blue-50/20' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'
                  }`}
                  style={{ borderColor: isSelected ? '#dbeafe' : '#f1f5f9' }}
                >
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isSelected ? 'bg-blue-100 text-blue-600 shadow-sm shadow-blue-100/50' : 'bg-blue-50 text-blue-500'}`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{level.title}</h3>
                  <p className="text-gray-600 text-sm flex-grow leading-relaxed">{level.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => navigate('/interview/cv-status')}
              className="flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </button>
            <button
              onClick={handleNext}
              disabled={!selected}
              className={`flex items-center px-8 py-3 rounded-xl font-medium transition-colors shadow-sm ${
                selected ? 'bg-[#1a56db] text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
