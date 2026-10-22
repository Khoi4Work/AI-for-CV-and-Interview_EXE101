import { Check, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginLoading({ success = false }) {
    return (
        <div
            className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm"
            style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', padding: '1rem', boxSizing: 'border-box' }}
        >
            <div role="status" aria-live="polite" aria-atomic="true"
                 style={{ width: 'min(28rem, calc(100vw - 2rem))', minWidth: 0, boxSizing: 'border-box', justifySelf: 'center' }}
                 className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
                <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-[#0b3c8f]'}`}>
                    {success ? <Check className="h-8 w-8" aria-hidden="true" />
                        : <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                    {success ? 'Đăng nhập thành công' : 'Đang đăng nhập'}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                    {success ? 'Đang chuẩn bị tài khoản và chuyển bạn đến trang tiếp theo…'
                        : 'Vui lòng chờ trong giây lát để xác thực tài khoản của bạn.'}
                </p>
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="h-4 w-4 text-[#0b3c8f]" aria-hidden="true" />
                    Kết nối an toàn
                </div>
            </div>
        </div>
    );
}
