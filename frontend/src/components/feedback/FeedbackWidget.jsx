import {useEffect, useRef, useState} from "react";
import {
    MessageSquare, X, Bug, Palette, Gauge, Lightbulb, HelpCircle,
    FileText, MessageCircle, ImagePlus, Check, Loader2, Send,
} from "lucide-react";
import {feedbackService} from "../../service/feedbackService.js";

/**
 * FeedbackWidget
 * ─────────────────────────────────────────────────────────────────
 * Floating feedback button (bottom-left) + modal form, available on
 * every page. Form draft (type / nickname / message) persists across
 * opens and route changes; cleared only when the user reloads or
 * closes the tab. Submit is a single async hook so the consumer can
 * wire it to any backend without touching the UI.
 *
 * Props
 *   onSubmit(payload, file) -> Promise<{ ok: boolean, message?: string }>
 *     payload = { type, nickname, message, pageUrl }
 *     file    = File | null  (an attached screenshot, if any)
 *
 *   Default onSubmit posts multipart/form-data to /api/feedback.
 *   Override the prop to integrate with your real API.
 */

const STORAGE_KEY = "smartfolio.feedback.draft.v1";

const TYPES = [
    {key: "bug", label: "Lỗi", icon: Bug, hint: "Báo lỗi kỹ thuật"},
    {key: "ui", label: "UI/UX", icon: Palette, hint: "Giao diện & trải nghiệm"},
    {key: "performance", label: "Hiệu năng", icon: Gauge, hint: "Tốc độ, giật, lag"},
    {key: "idea", label: "Ý tưởng", icon: Lightbulb, hint: "Đề xuất tính năng"},
    {key: "question", label: "Câu hỏi", icon: HelpCircle, hint: "Thắc mắc chung"},
    {key: "content", label: "Nội dung", icon: FileText, hint: "CV, mẫu, tài liệu"},
    {key: "other", label: "Khác", icon: MessageCircle, hint: "Không thuộc các mục trên"},
];

function loadDraft() {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (typeof data !== "object" || data === null) return null;
        return {
            type: typeof data.type === "string" ? data.type : "bug",
            nickname: typeof data.nickname === "string" ? data.nickname : "",
            message: typeof data.message === "string" ? data.message : "",
        };
    } catch {
        return null;
    }
}

function saveDraft(draft) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
        // quota / private mode — silently ignore
    }
}

export default function FeedbackWidget({onSubmit}) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState(() => loadDraft()?.type ?? "bug");
    const [nickname, setNickname] = useState(() => loadDraft()?.nickname ?? "");
    const [message, setMessage] = useState(() => loadDraft()?.message ?? "");
    // Files (binary) cannot be persisted to localStorage — kept in memory only.
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState("idle"); // idle | submitting | success | error
    const [errorMsg, setErrorMsg] = useState("");

    const fileRef = useRef(null);
    const dialogRef = useRef(null);
    const firstFieldRef = useRef(null);

    // Persist draft whenever form fields change.
    useEffect(() => {
        saveDraft({type, nickname, message});
    }, [type, nickname, message]);

    // Close on ESC, lock body scroll while open
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        setTimeout(() => firstFieldRef.current?.focus(), 60);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Revoke object URL when the preview changes / unmounts
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // Clear draft + binary state after a successful send.
    const clearDraft = () => {
        try {
            window.localStorage.removeItem(STORAGE_KEY);
        } catch { /* noop */
        }
        setType("bug");
        setNickname("");
        setMessage("");
        setFile(null);
        setPreview(null);
        setErrorMsg("");
    };

    const close = () => {
        setOpen(false);
        // NOTE: do NOT clear the draft here — only on successful submit
        // or full page reload (which happens when the user closes the tab).
    };

    const handleFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) {
            setErrorMsg("Chỉ hỗ trợ file ảnh.");
            return;
        }
        if (f.size > 5 * 1024 * 1024) {
            setErrorMsg("Ảnh tối đa 5MB.");
            return;
        }
        setErrorMsg("");
        setFile(f);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            setErrorMsg("Vui lòng nhập nội dung góp ý.");
            return;
        }
        setStatus("submitting");
        setErrorMsg("");

        const payload = {
            type,
            nickname: nickname.trim() || "Ẩn danh",
            message: message.trim(),
            pageUrl: typeof window !== "undefined" ? window.location.href : "",
        };

        try {
            const result = await submitFeedback(payload, file, onSubmit);
            if (result?.ok) {
                setStatus("success");
                clearDraft();
                setTimeout(close, 1400);
            } else {
                setStatus("error");
                setErrorMsg(result?.message || "Gửi thất bại, vui lòng thử lại.");
            }
        } catch (err) {
            setStatus("error");
            setErrorMsg(err?.message || "Gửi thất bại, vui lòng thử lại.");
        }
    };

    /* ── API plumbing ─────────────────────────────────────────────────── */
    /**
     * submitFeedback — single integration point. If no onSubmit is provided,
     * we default to a multipart POST to /api/feedback. The consumer can
     * override by passing a different onSubmit to <FeedbackWidget />.
     */
    async function submitFeedback(payload, file, onSubmit) {
        if (onSubmit) return onSubmit(payload, file);

        const fd = new FormData();
        fd.append("userName", payload.nickname);
        fd.append("category", payload.type);
        fd.append("content", payload.message);
        fd.append("pageUrl", payload.pageUrl);
        if (file) fd.append("image", file); else fd.append("image", null);

        const res = await feedbackService.feedback(fd);

        if (!res.ok) {
            let msg = `HTTP ${res.status}`;
            try {
                const data = await res.json();
                if (data?.message) msg = data.message;
            } catch { /* noop */
            }
            return {ok: false, message: msg};
        }
        return {ok: true};
    }

    return (
        <>
            {/* Floating button */}
            <button
                type="button"
                aria-label="Gửi góp ý"
                onClick={() => setOpen(true)}
                className="fw-fab fixed bottom-6 left-6 z-40 group inline-flex items-center gap-2
                           pl-3 pr-4 py-3 rounded-full bg-white/90 backdrop-blur
                           border border-[color:var(--color-outline-variant)]
                           text-[color:var(--color-primary)]
                           shadow-[0_8px_24px_-8px_rgba(11,60,143,0.25),0_2px_6px_-2px_rgba(15,23,42,0.06)]
                           hover:shadow-[0_12px_28px_-8px_rgba(11,60,143,0.35),0_4px_10px_-2px_rgba(15,23,42,0.08)]
                           hover:-translate-y-0.5
                           active:translate-y-0 active:scale-[0.98]
                           transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
                           select-none"
            >
                <span
                    className="grid place-items-center w-8 h-8 rounded-full
                               bg-[color:var(--color-primary)] text-white
                               transition-transform duration-300 group-hover:rotate-12"
                >
                    <MessageSquare className="w-4 h-4" strokeWidth={2.25}/>
                </span>
                <span className="text-sm font-semibold tracking-tight">Góp ý</span>
            </button>

            {/* Modal — flex-centered so it always sits in the viewport center,
                independent of page scroll position. */}
            {open && (
                <div
                    className="fw-overlay fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px]
                               flex items-center justify-center p-4 sm:p-6"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) close();
                    }}
                    role="presentation"
                >
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="fw-title"
                        className="fw-modal w-full max-w-[560px] max-h-[calc(100vh-32px)]
                                   bg-[color:var(--color-cream)]
                                   border border-[color:var(--color-outline-variant)]
                                   rounded-2xl shadow-[0_24px_60px_-20px_rgba(15,23,42,0.30),0_8px_20px_-8px_rgba(15,23,42,0.12)]
                                   overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
                            <div>
                                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[color:var(--color-primary)]">
                                    Smartfolio
                                </p>
                                <h2 id="fw-title" className="mt-1 text-xl font-semibold text-slate-900 tracking-tight">
                                    {status === "success" ? "Cảm ơn bạn!" : "Chia sẻ góp ý của bạn"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {status === "success"
                                        ? "Góp ý đã được ghi nhận. Chúng tôi sẽ xem xét sớm nhất."
                                        : "Mỗi góp ý giúp Smartfolio hoàn thiện hơn. Bản nháp được giữ lại cho lần sau."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={close}
                                aria-label="Đóng"
                                className="fw-focus -m-2 p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white/60 transition-colors"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* Body */}
                        {status === "success" ? (
                            <div className="px-6 pb-7 pt-2 flex flex-col items-center text-center">
                                <div
                                    className="w-12 h-12 rounded-full bg-[color:var(--color-primary)] text-white grid place-items-center">
                                    <Check className="w-6 h-6" strokeWidth={2.5}/>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2 overflow-y-auto">
                                {/* Type chips — 2 rows on desktop, wrap on mobile */}
                                <fieldset>
                                    <legend
                                        className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 mb-2">
                                        Loại góp ý
                                    </legend>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {TYPES.map((t) => (
                                            <TypeChip
                                                key={t.key}
                                                active={type === t.key}
                                                onClick={() => setType(t.key)}
                                                icon={t.icon}
                                                label={t.label}
                                            />
                                        ))}
                                    </div>
                                </fieldset>

                                {/* Nickname */}
                                <div className="mt-5">
                                    <label htmlFor="fw-nick"
                                           className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                                        Biệt danh <span
                                        className="text-slate-400 normal-case font-normal tracking-normal">(tuỳ chọn)</span>
                                    </label>
                                    <input
                                        ref={firstFieldRef}
                                        id="fw-nick"
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        maxLength={40}
                                        placeholder="Ẩn danh"
                                        className="fw-focus mt-1.5 w-full rounded-lg bg-white border border-[color:var(--color-outline-variant)]
                                                   px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                                                   transition-colors"
                                    />
                                </div>

                                {/* Message */}
                                <div className="mt-4">
                                    <label htmlFor="fw-msg"
                                           className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                                        Nội dung <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        id="fw-msg"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                        rows={4}
                                        maxLength={1000}
                                        placeholder="Mô tả ngắn gọn điều bạn gặp phải hoặc muốn cải thiện…"
                                        className="fw-focus mt-1.5 w-full resize-none rounded-lg bg-white border border-[color:var(--color-outline-variant)]
                                                   px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
                                                   transition-colors"
                                    />
                                    <div className="mt-1 text-[11px] text-slate-400 text-right">
                                        {message.length}/1000
                                    </div>
                                </div>

                                {/* Image attachment */}
                                <div className="mt-4">
                                    <label
                                        className="text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500">
                                        Ảnh đính kèm <span
                                        className="text-slate-400 normal-case font-normal tracking-normal">(tuỳ chọn, tối đa 5MB)</span>
                                    </label>
                                    <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={() => fileRef.current?.click()}
                                            className="fw-focus inline-flex items-center gap-2 rounded-lg bg-white
                                                       border border-[color:var(--color-outline-variant)]
                                                       px-3 py-2 text-sm text-slate-700
                                                       hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]
                                                       transition-colors"
                                        >
                                            <ImagePlus className="w-4 h-4"/>
                                            {file ? "Đổi ảnh" : "Chọn ảnh"}
                                        </button>
                                        {file && (
                                            <div className="flex items-center gap-2 min-w-0">
                                                {preview && (
                                                    <img src={preview} alt=""
                                                         className="w-9 h-9 rounded-md object-cover border border-[color:var(--color-outline-variant)]"/>
                                                )}
                                                <span
                                                    className="text-xs text-slate-500 truncate max-w-[160px]">{file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setFile(null)}
                                                    className="text-slate-400 hover:text-rose-500 transition-colors"
                                                    aria-label="Gỡ ảnh"
                                                >
                                                    <X className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        )}
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFile}
                                            className="hidden"
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {errorMsg && (
                                    <p className="mt-4 text-sm text-rose-600">{errorMsg}</p>
                                )}

                                {/* Actions */}
                                <div className="mt-6 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={close}
                                        className="fw-focus px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600
                                                   hover:text-slate-900 hover:bg-white/60 transition-colors"
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={status === "submitting"}
                                        className="fw-ink inline-flex items-center gap-2 px-5 py-2.5 rounded-lg
                                                   bg-[color:var(--color-primary)] text-white
                                                   border border-[color:var(--color-primary)]
                                                   text-sm font-semibold tracking-tight
                                                   shadow-[0_4px_12px_-4px_rgba(11,60,143,0.45)]
                                                   hover:bg-[#0a3582] hover:shadow-[0_8px_20px_-6px_rgba(11,60,143,0.55)]
                                                   hover:-translate-y-0.5
                                                   active:translate-y-0 active:shadow-[0_2px_6px_-2px_rgba(11,60,143,0.35)]
                                                   disabled:opacity-60 disabled:cursor-not-allowed
                                                   transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                    >
                                        {status === "submitting" ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin"/>
                                                Đang gửi…
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4"/>
                                                Gửi góp ý
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

/* ── Sub-component: type chip ─────────────────────────────────────── */
function TypeChip({active, onClick, icon: Icon, label}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            className={[
                "fw-focus inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium",
                "border transition-all duration-200",
                active
                    ? "bg-[color:var(--color-primary)] text-white border-[color:var(--color-primary)] shadow-[0_4px_12px_-4px_rgba(11,60,143,0.45)]"
                    : "bg-white text-slate-700 border-[color:var(--color-outline-variant)] hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]",
            ].join(" ")}
        >
            <Icon className="w-4 h-4" strokeWidth={2}/>
            {label}
        </button>
    );
}


