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
    // XÓA kết quả phỏng vấn cũ khi bắt đầu luồng chuẩn bị mới
    // Điều này ngăn chặn việc bị skip InterviewRoom do skipStreak hoặc feedback từ session trước
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative">
      <Header />
      <div className="flex-1 pt-8 px-6 max-w-3xl mx-auto w-full">
        <ProgressBar current={1} />

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Bạn đang tìm việc ở ngành nào?</h1>
          <p className="text-gray-600">Chúng tôi sẽ tùy chỉnh các mẫu CV và gợi ý kỹ năng AI dựa trên vai trò mong muốn của bạn.</p>
        </div>

        <div className="relative mb-8 shadow-sm rounded-xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                className={`flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'border-blue-100 bg-blue-50/10' : 'border-transparent shadow-sm hover:border-gray-100'
                }`}
                style={{
                  boxShadow: isSelected ? '0 4px 20px -5px rgba(37, 99, 235, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                  borderColor: isSelected ? '#dbeafe' : '#f1f5f9',
                }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-500'}`}>
                  <Icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-sm text-gray-500 text-center">{job.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center mt-12 pb-24">
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedId}
            className={`flex items-center px-6 py-2.5 rounded-lg font-medium transition-colors ${
              selectedId
                ? 'bg-[#1a56db] text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
      <p className="text-sm text-gray-500 font-medium mb-3">Bước {current} trên {total} • {Math.round((current / total) * 100)}% hoàn tất</p>
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full rounded-full transition-all"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
