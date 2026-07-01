// /src/pages/interview/JobSelection.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, Monitor, Server, Cloud, Bug, Database, ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { JOBS } from '../constants/jobs.js';
import { useInterviewSession } from '../hooks/useInterviewSession.js';

const ICONS = { Code, Monitor, Server, Cloud, Bug, Database };

export default function JobSelection() {
  const navigate = useNavigate();
  const { data, update, setStep } = useInterviewSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(data.job?.id || null);

  useEffect(() => {
    setStep(1);
    update({
      answers: [],
      transcriptLog: [],
      skipStreak: 0,
      feedback: null
    });
  }, [setStep, update]);

  const filtered = JOBS.filter((j) =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => {
    if (!selectedId) return;
    const job = JOBS.find((j) => j.id === selectedId);
    update({ job });
    navigate('/interview/cv-status');
  };

  return (
    <div className="min-h-screen bg-interview-radial flex flex-col font-sans relative">
      <Header />
      <div className="flex-1 pt-8 px-6 max-w-3xl mx-auto w-full">
        <ProgressBar current={1} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-3">Bạn đang tìm việc ở ngành nào?</h1>
          <p className="text-on-surface-variant">Chúng tôi sẽ tùy chỉnh các mẫu CV và gợi ý kỹ năng AI dựa trên vai trò mong muốn của bạn.</p>
        </div>

        <div className="relative mb-8 shadow-sm rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-outline" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 glass-panel border border-outline-variant rounded-xl text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            placeholder="Ví dụ: Senior Software Engineer, Marketing Manager..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {filtered.map((job) => {
            const Icon = ICONS[job.icon] || Code;
            const isSelected = selectedId === job.id;
            return (
              <div
                key={job.id}
                onClick={() => setSelectedId(job.id)}
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md bg-interview-card-bg ${
                  isSelected ? 'selection-card-selected' : 'border-transparent shadow-sm hover:border-primary'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-interview-icon-bg text-interview-icon-text`}>
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-black mb-1">{job.title}</h3>
                <p className="text-sm text-black text-center">{job.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-12 pb-24">
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center text-outline hover:text-on-surface font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedId}
            className={`flex items-center px-6 py-2.5 rounded-lg font-medium transition-colors ${
              selectedId
                ? 'bg-primary text-on-primary hover:bg-primary-container'
                : 'bg-surface-container text-outline cursor-not-allowed'
            }`}
          >
            Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function ProgressBar({ current }) {
  const total = 10;
  return (
    <div className="flex flex-col items-center mb-10">
      <p className="text-sm text-on-surface-variant font-medium mb-3">Bước {current} trên {total} • {Math.round((current / total) * 100)}% hoàn tất</p>
      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
