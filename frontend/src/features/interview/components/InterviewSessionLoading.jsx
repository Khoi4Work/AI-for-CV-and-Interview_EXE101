import {useEffect, useState} from 'react';
import {ClipboardList, LoaderCircle, Sparkles} from 'lucide-react';

const LOADING_MESSAGES = [
  'Đang khởi tạo phiên phỏng vấn và chuẩn bị thiết bị.',
  'Đang chọn câu hỏi phù hợp với loại phỏng vấn và cấp độ của bạn.',
  'Nếu cần bổ sung câu hỏi mới, bước chuẩn bị có thể lâu hơn một chút.',
];

export default function InterviewSessionLoading({config}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((index) => (index + 1) % LOADING_MESSAGES.length);
    }, 3500);
    const elapsedTimer = window.setInterval(() => setElapsedSeconds((seconds) => seconds + 1), 1000);
    return () => {
      window.clearInterval(messageTimer);
      window.clearInterval(elapsedTimer);
    };
  }, []);

  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'grid',
        placeItems: 'center',
        width: '100vw',
        minHeight: '100vh',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
        background: 'radial-gradient(circle at center, var(--color-interview-bg-start) 0%, var(--color-interview-bg-end) 100%)',
      }}
    >
      <section
        style={{
          width: 'min(42rem, calc(100vw - 2rem))',
          minWidth: 'min(18rem, calc(100vw - 2rem))',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <div className="relative mb-8 flex h-48 w-48 items-center justify-center" aria-hidden="true">
          <div className="absolute h-48 w-48 animate-pulse-glow rounded-full bg-primary/10" />
          <div className="absolute h-36 w-36 animate-pulse-glow rounded-full bg-primary/20 [animation-delay:0.5s]" />
          <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-primary text-on-primary shadow-xl">
            <ClipboardList className="h-12 w-12" />
          </div>
          <LoaderCircle className="absolute h-40 w-40 animate-spin text-primary/80" strokeWidth={1.5} />
          <Sparkles className="absolute -right-1 top-7 h-6 w-6 animate-pulse text-primary" />
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">Chuẩn bị phỏng vấn</p>
        <h1 className="mb-3 text-2xl font-bold text-on-surface sm:text-3xl">Đang tạo buổi phỏng vấn</h1>
        <p className="mb-4 w-full text-sm leading-6 text-on-surface-variant">{LOADING_MESSAGES[messageIndex]}</p>
        <p className="mb-6 text-xs font-medium text-on-surface-variant">
          {config?.type || 'Phỏng vấn'} · {config?.duration || '?'} phút · Đã chờ {elapsedSeconds} giây
        </p>
        <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-surface-container" aria-hidden="true">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
        </div>
        <p className="mt-5 text-xs text-on-surface-variant">Vui lòng đợi trong khi chúng tôi chuẩn bị câu hỏi cho bạn.</p>
      </section>
    </main>
  );
}
