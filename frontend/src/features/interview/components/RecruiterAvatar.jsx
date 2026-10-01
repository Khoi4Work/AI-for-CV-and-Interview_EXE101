import React from 'react';

/**
 * Map of recruiter avatar images based on the interview phase.
 * Paths are relative to the public directory.
 */
const AVATAR_MAP = {
  asking: '/man_interview_talk.png',
  recording: '/man_interview_default.png',
  processing: '/man_interview_default.png',
  default: '/man_interview_default.png',
};

export function RecruiterAvatar({ phase }) {
  // Resolve image path based on current phase, fallback to default
  const imageSrc = AVATAR_MAP[phase] || AVATAR_MAP.default;

  return (
    <div
      className={`w-32 h-32 md:w-56 md:h-56 rounded-full mb-6 border-4 border-background shadow-sm relative overflow-hidden transition-all
      ${phase === 'asking' ? 'bg-primary/20 ring-4 ring-primary/30 animate-pulse' : 'bg-surface-container'}`}
    >
      {/* Blurred Background Layer: Fills the wide frame and prevents empty space on sides */}
      <img
        src={imageSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
        aria-hidden="true"
      />

      {/* Foreground Image: Displays the full person without cropping (object-contain) */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={imageSrc}
          alt="Recruiter Avatar"
          className="max-w-full max-h-full object-contain"
        />
      </div>
    </div>
  );
}