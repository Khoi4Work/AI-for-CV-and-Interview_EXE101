import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
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
                className="relative w-full max-w-3xl glass-panel rounded-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                    <h3 className="text-sm font-bold text-on-surface">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto text-on-surface-variant">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
