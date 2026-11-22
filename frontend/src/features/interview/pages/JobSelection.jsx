// /src/pages/interview/JobSelection.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, Monitor, Server, Cloud, Bug, Database, ArrowLeft, ArrowRight } from 'lucide-react';
import { Header } from '../../../components/layout/PublicHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { JOBS } from '../constants/jobs.js';
import { useInterviewSession } from '../hooks/useInterviewSession.js';
import '../interview.css';

const ICONS = { Code, Monitor, Server, Cloud, Bug, Database };

export default function JobSelection() {
  const navigate = useNavigate();
  const { profile } = useAuth();
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

  useEffect(() => {
    if (profile?.quota) {
      update({ quotaSnapshot: profile.quota, quotaSnapshotAt: Date.now() });
    }
  }, [profile?.quota, update]);

  const filtered = JOBS.filter((j) =>
    j.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNext = () => {
    const job = JOBS.find((item) => item.id === selectedId);
    if (!job) return;
    update({ job, quotaSnapshot: profile?.quota || data.quotaSnapshot, quotaSnapshotAt: Date.now() });
    navigate('/interview/cv-status');
  };

  return (
    <div className="interview-flow-page font-sans relative">
      <Header />
      <div className="flex-1 pt-8 px-6 max-w-3xl mx-auto w-full">
        <ProgressBar current={1} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-3">Bạn đang tìm việc ở ngành nào?</h1>
          <p className="text-on-surface-variant">Chúng tôi sẽ tùy chỉnh các mẫu CV và gợi ý kỹ năng AI dựa trên vai trò mong muốn của bạn.</p>
        </div>

        <p className="text-center text-sm text-on-surface-variant mb-5" aria-live="polite">
          {data.quotaSnapshot?.quotaExempt ? 'Tài khoản tester: không giới hạn quota phỏng vấn' : data.quotaSnapshot ? `Còn ${Number(data.quotaSnapshot.remainingInterviewMinutes ?? 0)} phút Interview` : 'Hạn mức sẽ được kiểm tra khi bắt đầu phỏng vấn.'}
        </p>

        <div className="relative mb-8 shadow-sm rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-outline" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="interview-flow-control interview-flow-control--glass block w-full pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
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
                onClick={() => { setSelectedId(job.id); update({ job }); }}
                className={`interview-flow-choice interview-flow-choice--lift flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer ${
                  isSelected ? 'selection-card-selected' : 'shadow-sm'
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
            className="interview-flow-back-button flex items-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedId}
            className="interview-flow-button-primary interview-flow-button-primary--rounded-lg interview-flow-button-primary--muted-disabled interview-flow-button-primary--container-hover flex items-center px-6 py-2.5"
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
      <p className="interview-flow-progress-label text-sm font-medium mb-3">Bước {current} trên {total} • {Math.round((current / total) * 100)}% hoàn tất</p>
      <div className="interview-flow-progress-track w-full">
        <div
          className="interview-flow-progress-fill"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
