import { Check, Loader2, ShieldCheck } from 'lucide-react';
import './auth-experience.css';

export default function AuthProgress({
  success = false,
  title = 'Đang xử lý',
  message = 'Vui lòng chờ trong giây lát.',
  overlay = true,
}) {
  return (
    <div className={overlay ? 'auth-loading-overlay' : 'auth-loading-screen'}>
      <section className={`auth-progress-card${success ? ' is-success' : ''}`} role="status" aria-live="polite" aria-atomic="true">
        <div className={`auth-progress__mark${success ? ' is-success' : ''}`}>
          {success
            ? <Check className="h-8 w-8" aria-hidden="true" />
            : <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="auth-progress__track" aria-hidden="true"><span /></div>
        <div className="auth-progress__secure"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Kết nối an toàn</div>
      </section>
    </div>
  );
}
