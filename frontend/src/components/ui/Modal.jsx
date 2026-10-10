import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, solid = false, size = 'default', resizable = false }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);
55
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Dialog Box */}
            <div
                role="dialog"
                aria-modal="true"
                className={`relative min-w-0 shrink-0 rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col ${size === 'wide' ? 'w-[94vw] max-w-[1440px]' : 'w-full max-w-3xl'} max-h-[90vh] ${resizable ? 'resize' : ''} ${solid ? 'border border-slate-200 bg-white' : 'glass-panel'}`}
                style={resizable ? {
                    resize: 'both',
                    minWidth: 'min(720px, calc(100vw - 2rem))',
                    minHeight: 'min(420px, calc(100vh - 2rem))',
                    maxWidth: 'calc(100vw - 2rem)',
                    maxHeight: 'calc(100vh - 2rem)',
                } : undefined}
            >
                {/* Header */}
                <div className={`flex items-center justify-between px-6 py-4 border-b ${solid ? 'border-slate-200 bg-slate-50' : 'border-outline-variant bg-surface-container-low'}`}>
                    <h3 className={`text-sm font-bold ${solid ? 'text-slate-900' : 'text-on-surface'}`}>{title}</h3>
                    <button
                        onClick={onClose}
                        aria-label="Đóng"
                        className={`p-1.5 rounded-lg transition-colors ${solid ? 'text-slate-600 hover:bg-slate-200 hover:text-slate-900' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className={`min-h-0 flex-1 p-6 overflow-auto ${solid ? 'bg-white text-slate-700' : 'text-on-surface-variant'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
