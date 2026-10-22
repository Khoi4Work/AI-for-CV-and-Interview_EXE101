import {useEffect, useId, useRef} from 'react';
import {AlertTriangle, X} from 'lucide-react';

export default function ConfirmationDialog({isOpen, title, message, confirmLabel = 'Xác nhận', danger = false, onConfirm, onCancel}) {
    const dialog = useRef(null);
    const cancelButton = useRef(null);
    const titleId = useId();
    const messageId = useId();
    useEffect(() => {
        const element = dialog.current;
        if (isOpen && !element.open) {
            element.showModal();
            cancelButton.current?.focus();
        }
        else if (!isOpen && element.open) element.close();
    }, [isOpen]);

    return <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={messageId}
        style={{width: 'min(28rem, calc(100vw - 2rem))', maxWidth: 'calc(100vw - 2rem)'}}
        onCancel={event => { event.preventDefault(); onCancel(); }}
        onClick={event => { if (event.target === event.currentTarget) onCancel(); }}
        className="fixed inset-0 m-auto max-h-[90vh] overflow-auto rounded-2xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h2 id={titleId} className="flex items-center gap-2 text-base font-bold">
                <AlertTriangle size={20} className={danger ? 'text-red-600' : 'text-amber-600'}/>{title}
            </h2>
            <button type="button" onClick={onCancel} aria-label="Đóng"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-blue-700"><X size={18}/></button>
        </div>
        <div className="px-6 py-5">
            <p id={messageId} className="break-words text-sm leading-6 text-slate-600">{message}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button ref={cancelButton} type="button" onClick={onCancel}
                    className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-700">Hủy</button>
                <button type="button" onClick={onConfirm}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 ${danger ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600' : 'bg-[#0b3c8f] hover:bg-blue-900 focus-visible:outline-blue-700'}`}>{confirmLabel}</button>
            </div>
        </div>
    </dialog>;
}
