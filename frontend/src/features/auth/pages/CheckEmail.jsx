import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MailCheck, LoaderCircle, ArrowLeft } from 'lucide-react';
import GuestHeader from '../../../components/layout/GuestHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { getResendWaitSeconds, resendVerificationEmail } from '../../../service/emailVerificationService.js';

export default function CheckEmail() {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || '');
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [waitUntil, setWaitUntil] = useState(() => location.state?.registeredAt ? location.state.registeredAt + 60000 : 0);
    const [now, setNow] = useState(() => Date.now());
    const inProgress = useRef(false);
    const mounted = useRef(false);
    const remaining = Math.max(0, Math.ceil((waitUntil - now) / 1000));

    useEffect(() => {
        mounted.current = true;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => {
            mounted.current = false;
            window.clearInterval(timer);
        };
    }, []);

    const resend = async (event) => {
        event.preventDefault();
        if (inProgress.current || Date.now() < waitUntil) return;
        inProgress.current = true;
        setPending(true);
        setMessage('');
        setError('');
        try {
            await resendVerificationEmail(email);
            if (!mounted.current) return;
            const sentAt = Date.now();
            setNow(sentAt);
            setWaitUntil(sentAt + 60000);
            setMessage('Nếu email này có tài khoản đang chờ xác thực, hệ thống sẽ gửi đường dẫn mới. Vui lòng kiểm tra cả thư mục Spam.');
        } catch (failure) {
            if (!mounted.current) return;
            if (failure.response?.status === 429) {
                const retryAt = Date.now();
                setNow(retryAt);
                setWaitUntil(retryAt + getResendWaitSeconds(failure) * 1000);
                setError('Bạn đã yêu cầu quá nhiều lần. Vui lòng chờ rồi thử lại.');
            } else {
                setError(getApiErrorMessage(failure));
            }
        } finally {
            inProgress.current = false;
            if (mounted.current) setPending(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-surface">
            <GuestHeader />
            <main className="flex flex-1 items-center justify-center px-sm py-xl">
                <section className="w-full max-w-[480px] rounded-2xl border border-outline-variant bg-surface-container-lowest p-lg md:p-xl shadow-sm">
                    <div className="mx-auto mb-md flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <MailCheck className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h1 className="mb-sm text-center text-2xl font-bold text-primary">Kiểm tra email của bạn</h1>
                    <p className="mb-md text-center text-sm leading-relaxed text-on-surface-variant">
                        Mở đường dẫn trong email để kích hoạt tài khoản. Đường dẫn có hiệu lực trong 24 giờ.
                        Nếu chưa nhận được thư hoặc đường dẫn đã hết hạn, bạn có thể yêu cầu gửi lại bên dưới.
                    </p>
                    <form onSubmit={resend} className="space-y-md" aria-busy={pending}>
                        <div>
                            <label htmlFor="verification-email" className="mb-xs block text-sm font-medium text-on-surface">Email đăng ký</label>
                            <input id="verification-email" type="email" autoComplete="email" required maxLength={254}
                                value={email} disabled={pending} onChange={(event) => { setEmail(event.target.value); setMessage(''); setError(''); }}
                                className="w-full rounded-lg border border-outline-variant bg-surface px-sm py-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="email@example.com" />
                        </div>
                        {message && <p role="status" className="rounded-lg bg-emerald-50 p-sm text-sm text-emerald-800">{message}</p>}
                        {error && <p role="alert" className="rounded-lg bg-red-50 p-sm text-sm text-red-700">{error}</p>}
                        <button type="submit" disabled={pending || remaining > 0}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50">
                            {pending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                            {pending ? 'Đang yêu cầu gửi email...' : remaining > 0 ? `Gửi lại sau ${remaining}s` : 'Gửi lại email xác thực'}
                        </button>
                    </form>
                    <p className="mt-md text-center text-xs leading-relaxed text-on-surface-variant">Tài khoản chưa xác thực sau 2 ngày có thể được dọn khỏi hệ thống. Khi đó, bạn có thể đăng ký lại.</p>
                    <div className="mt-lg flex flex-wrap justify-center gap-md text-sm text-primary">
                        <Link to="/login" state={{ from: location.state?.from }} className="flex items-center gap-1 hover:underline"><ArrowLeft className="h-4 w-4" /> Đăng nhập</Link>
                        <Link to="/register" state={{ from: location.state?.from }} className="hover:underline">Đăng ký lại</Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
