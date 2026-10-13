import { useRef, useLayoutEffect } from 'react';
import { useCVReadOnly } from '../contexts/CVContext.jsx';

/**
 * EditableText is a component that allows inline editing of text within a CV template.
 * Text fields wrap and grow with their content so a long value cannot be clipped
 * by the fixed dimensions of a template section.
 */
const EditableText = ({ value, onChange, multiline = false, resizable = true, className = "" }) => {
    const textareaRef = useRef(null);
    const resizeStartRef = useRef(null);
    const manuallyResizedHeightRef = useRef(false);
    const readOnly = useCVReadOnly();
    // Removed w-full from commonStyles to prevent forced truncation in flex containers
    const commonStyles = "bg-transparent border-none outline-none transition-all focus:bg-white focus:text-slate-900 focus:ring-1 focus:ring-blue-300 focus:border-slate-200 rounded px-1";

    // Auto-resize after edits so wrapped lines remain visible in the template.
    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return undefined;

        const fitText = () => {
            if (!manuallyResizedHeightRef.current) {
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        };
        fitText();

        let previousWidth = textarea.getBoundingClientRect().width;
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
            const width = textarea.getBoundingClientRect().width;
            if (width !== previousWidth) {
                previousWidth = width;
                fitText();
            }
        });
        observer?.observe(textarea.parentElement || textarea);
        return () => observer?.disconnect();
    }, [value, multiline, resizable]);

    const handleInput = (e) => {
        onChange(e.target.value);
    };

    if (readOnly) return <span className={`block w-full min-w-0 whitespace-pre-wrap break-words px-1 ${className}`}>{value ?? ''}</span>;

    return (
        <>
            <textarea
                ref={textareaRef}
                className={`cv-editable-field ${commonStyles} block w-full min-w-0 max-w-full ${resizable ? 'resize both overflow-auto' : 'resize-none overflow-hidden'} whitespace-pre-wrap break-words align-top leading-[inherit] ${className}`}
                value={value ?? ''}
                onChange={handleInput}
                onPointerDown={(event) => {
                    if (!resizable) return;
                    resizeStartRef.current = {
                        width: event.currentTarget.offsetWidth,
                        height: event.currentTarget.offsetHeight,
                    };
                }}
                onPointerUp={(event) => {
                    if (!resizable || !resizeStartRef.current) return;
                    const { height } = resizeStartRef.current;
                    const textarea = event.currentTarget;
                    if (Math.abs(textarea.offsetHeight - height) > 1) manuallyResizedHeightRef.current = true;
                    resizeStartRef.current = null;
                }}
                rows={1}
                wrap="soft"
                style={{ minHeight: '1em', maxHeight: resizable ? (multiline ? '20em' : '6em') : undefined, lineHeight: 'inherit' }}
            />
            <span className={`cv-print-text ${className}`}>{value ?? ''}</span>
        </>
    );
};

export default EditableText;
