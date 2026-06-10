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
        className="relative w-full max-w-[480px] aspect-[3/4] bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden border border-outline-variant p-sm flex flex-col gap-sm transition-transform duration-200 ease-out will-change-transform"
      >
        {/* Simulated CV Header */}
        <div className="h-12 w-full bg-surface-container-high rounded-lg mb-xs"></div>

        {/* Simulated Profile Section */}
        <div className="flex gap-sm">
          <div className="h-24 w-24 bg-surface-container rounded-lg shrink-0"></div>
          <div className="flex flex-col gap-base w-full">
            <div className="h-4 w-3/4 bg-surface-container-high rounded"></div>
            <div className="h-4 w-1/2 bg-surface-container rounded"></div>
            <div className="h-3 w-1/4 bg-surface-container-low rounded mt-base"></div>
          </div>
        </div>

        {/* Simulated Content Lines */}
        <div className="space-y-sm mt-md">
          <div className="h-3 w-full bg-surface-container rounded"></div>
          <div className="h-3 w-5/6 bg-surface-container rounded"></div>
          <div className="h-3 w-4/5 bg-surface-container rounded"></div>
        </div>

        {/* Floating AI Suggestion Bubble - FIX: Use w-fit and increase max-width */}
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

        {/* Bottom CV Content */}
        <div className="mt-auto space-y-sm">
          <div className="h-10 w-full bg-primary-container/10 rounded-lg"></div>
          <div className="h-10 w-full bg-surface-container rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
