import { Loader2, ShieldCheck } from 'lucide-react';

export default function LogoutLoading() {
    return <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
        <div role="status" aria-live="polite" aria-atomic="true"
            className="ww-full max-w-3xl rounded-3x border border-slate-200 bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#0b3c8f]">
                <Loader2 className="h-8 w-8 animate-spin motion-reduce:animate-none" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Đang đăng xuất</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Vui lòng chờ trong giây lát để kết thúc phiên đăng nhập của bạn.</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-[#0b3c8f]" aria-hidden="true" />
                Kết nối an toàn
            </div>
        </div>
    </div>;
}
