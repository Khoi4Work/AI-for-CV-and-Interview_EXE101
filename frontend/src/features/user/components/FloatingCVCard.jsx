import React from 'react';

export default function FloatingCVCard() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-lg border border-white/20 bg-white shadow-[0_28px_80px_rgba(0,0,0,.28)]">
      <img
        src="https://i.postimg.cc/GtchNc1m/polished.png"
        alt="Bản xem trước một mẫu CV Smartfolio"
        className="block aspect-[3/4] h-auto w-full object-cover"
        fetchPriority="high"
      />
    </div>
  );
}
