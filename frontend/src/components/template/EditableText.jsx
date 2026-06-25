import React, { useRef, useLayoutEffect } from 'react';

/**
 * EditableText is a component that allows inline editing of text within a CV template.
 * It switches between an <input> and a <textarea> based on the `multiline` prop.
 * It is designed to be "invisible" until focused, maintaining the template's aesthetic.
 */
const EditableText = ({ value, onChange, multiline = false, className = "" }) => {
    const textareaRef = useRef(null);
    // Removed w-full from commonStyles to prevent forced truncation in flex containers
    const commonStyles = "bg-transparent border-none outline-none transition-all focus:bg-white focus:ring-1 focus:ring-blue-300 focus:border-slate-200 rounded px-1";

    // Auto-resize textarea whenever value changes or component mounts
    useLayoutEffect(() => {
        if (multiline && textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [value, multiline]);

    const handleInput = (e) => {
        onChange(e.target.value);
    };

    if (multiline) {
        return (
            <textarea
                ref={textareaRef}
                className={`${commonStyles} w-full resize-none overflow-hidden block ${className}`}
                value={value}
                onChange={handleInput}
                rows={1}
                style={{ minHeight: '1em' }}
            />
        );
    }
    return (
        <input
            className={`${commonStyles} w-full ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );
};

export default EditableText;
