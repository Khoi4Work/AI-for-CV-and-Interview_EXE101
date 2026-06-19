import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Lấy điểm đến từ state, nếu không có thì mặc định về /optimizer hoặc /cv-result
  const target = location.state?.target || '/optimizer';

  useEffect(() => {
    if (step < MESSAGES.length - 1) {
      const timer = setTimeout(() => {
        setStep((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (step === MESSAGES.length - 1) {
      const timer = setTimeout(() => {
        navigate(target);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

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
