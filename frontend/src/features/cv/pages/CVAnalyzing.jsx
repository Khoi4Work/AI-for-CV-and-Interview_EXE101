import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cvPipelineService } from '../services/cvPipelineService.js';

const MESSAGES = [
  "Đang quét cấu trúc CV...",
  "Đang trích xuất kỹ năng cốt lõi...",
  "Đang phân tích mô tả công việc...",
  "Đang tính toán điểm tương thích...",
  "Đang tạo gợi ý cải thiện...",
];

const CVAnalyzing = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');

  // Lấy điểm đến từ state, nếu không có thì mặc định về /optimizer hoặc /cv-result
  const target = location.state?.target || '/optimizer';

  useEffect(() => {
    if (location.state?.jobId) return undefined;
    if (step < MESSAGES.length - 1) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === MESSAGES.length - 1) {
      const timer = setTimeout(() => {
        navigate(target, { state: location.state });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, navigate, location.state, target]);

  useEffect(() => {
    const jobId = location.state?.jobId;
    if (!jobId) return undefined;

    let active = true;
    let timer;
    const poll = async () => {
      try {
        const status = await cvPipelineService.getOptimizationStatus(jobId);
        if (!active) return;
        setStep(Math.min(Math.floor((status.progress || 0) / 20), MESSAGES.length - 1));

        if (status.status === 'COMPLETED') {
          const result = await cvPipelineService.getOptimizationResult(jobId);
          if (active) navigate(target, {state: {...location.state, optimizationResult: result}});
          return;
        }
        if (status.status === 'FAILED') {
          setError('AI chưa thể tối ưu CV này. Bạn có thể quay lại và thử lại.');
          return;
        }
        timer = setTimeout(poll, 1500);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || 'Không thể kiểm tra trạng thái tối ưu CV.');
      }
    };

    poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [location.state, navigate, target]);

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-surface px-4 text-on-surface">
          <section role="alert" className="error-card rounded-2xl border border-outline-variant bg-surface-container p-6 text-center shadow-lg">
            <p className="mb-5 text-lg font-semibold">{error}</p>
            <button className="rounded-xl bg-primary px-5 py-3 font-bold text-on-primary" onClick={() => navigate('/builder')}>
              Quay lại CV Builder
            </button>
          </section>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
      <div className="flex flex-col items-center gap-12">
        {/* Visual Analysis Element */}
        <div className="relative flex items-center justify-center">
          {/* Background glow circles */}
          <div className="absolute w-64 h-64 bg-primary/20 rounded-full animate-pulse-glow" />
          <div className="absolute w-48 h-48 bg-primary/30 rounded-full animate-pulse-glow [animation-delay:0.5s]" />

          {/* Central core */}
          <div className="relative z-10 w-32 h-32 bg-primary rounded-full shadow-xl flex items-center justify-center text-white">
            <svg
              className="w-16 h-16 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v4" />
              <path d="M12 18v4" />
              <path d="M4.93 4.93l2.12 2.12" />
              <path d="M19.07 19.07l-2.12-2.12" />
              <path d="M2 12h4" />
              <path d="M18 12h4" />
              <path d="M4.93 19.07l2.12-2.12" />
              <path d="M19.07 4.93l-2.12 2.12" />
            </svg>
          </div>
        </div>

        {/* Status Message */}
        <div className="h-12 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xl font-medium text-on-surface-variant"
            >
              {MESSAGES[step]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CVAnalyzing;
