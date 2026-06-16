import React, { useEffect, useRef } from 'react';

export default function FloatingCVCard() {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="relative flex justify-center items-center w-full h-full min-h-[500px]">
      {/* Ambient Glow background */}
      <div className="absolute -z-10 w-[500px] h-[500px] bg-primary-fixed opacity-20 blur-[100px] rounded-full"></div>

      {/* The Card */}
      <div
        ref={cardRef}
        className="relative w-full max-w-[480px] aspect-[3/4] bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant flex flex-col gap-sm transition-transform duration-200 ease-out will-change-transform"
      >
        <img
          src="https://i.postimg.cc/zBSnG0vR/Home.jpg"
          alt="CV Preview"
          className="w-full h-full object-cover"
        />

        {/* Floating AI Suggestion Bubble */}
        <div
          className="absolute bottom-1/4 right-0 transform translate-x-4 glass-effect p-sm rounded-xl shadow-lg border border-white/20 ai-glow w-fit max-w-[300px] flex flex-col gap-xs animate-bounce"
          style={{ animationDuration: '4s' }}
        >
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-label-md text-label-md text-primary font-bold">AI Suggestion</span>
          </div>
          <p className="font-body-sm text-sm text-on-surface-variant italic leading-relaxed whitespace-normal">
            "Hãy thêm từ khóa 'Quản lý dự án Agile' để tăng 40% cơ hội lọt qua bộ lọc ATS."
          </p>
        </div>
      </div>
    </div>
  );
}
