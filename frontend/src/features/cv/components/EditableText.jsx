import React, { useRef, useLayoutEffect } from 'react';

/**
 * EditableText is a component that allows inline editing of text within a CV template.
 * Text fields wrap and grow with their content so a long value cannot be clipped
 * by the fixed dimensions of a template section.
 */
const EditableText = ({ value, onChange, multiline = false, className = "" }) => {
    const textareaRef = useRef(null);
    // Removed w-full from commonStyles to prevent forced truncation in flex containers
    const commonStyles = "bg-transparent border-none outline-none transition-all focus:bg-white focus:ring-1 focus:ring-blue-300 focus:border-slate-200 rounded px-1";

    // Auto-resize after edits so wrapped lines remain visible in the template.
    useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return undefined;

        const fitText = () => {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
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
    }, [value, multiline]);

    const handleInput = (e) => {
        onChange(e.target.value);
    };

    return (
        <>
            <textarea
                ref={textareaRef}
                className={`cv-editable-field ${commonStyles} block w-full min-w-0 max-w-full resize-none overflow-hidden whitespace-pre-wrap break-words align-top leading-[inherit] ${className}`}
                value={value ?? ''}
                onChange={handleInput}
                rows={1}
                wrap="soft"
                style={{ minHeight: '1em', lineHeight: 'inherit' }}
            />
            <span className={`cv-print-text ${className}`}>{value ?? ''}</span>
        </>
    );
};

export default EditableText;
