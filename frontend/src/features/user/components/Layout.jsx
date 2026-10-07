import React from 'react';

// Common Card Component
export const Card = ({ children, className = '', ...props }) => {
    const hasBg = className.includes('bg-');
    const bgClass = hasBg ? '' : 'bg-[#E2E8F0]';
    return (
        <div className={`${bgClass} rounded-xl overflow-hidden shadow-sm ${className}`} {...props}>
            {children}
        </div>
    );
};

// Common Button Component
export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
    const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none";

    const variants = {
        primary: "bg-[#10B981] hover:bg-[#059669] text-white",
        secondary: "bg-[#0F766E] hover:bg-[#0D9488] text-white",
        outline: "border border-[#475569] text-white hover:bg-[#334155]",
        'light-outline': "border border-[#94A3B8] text-[#0F172A] hover:bg-[#CBD5E1]",
        ghost: "text-[#94A3B8] hover:text-white hover:bg-[#1E2E42]",
        dark: "bg-[#134E4A] hover:bg-[#042F2E] text-white",
        purple: "bg-[#7D5BE2] hover:bg-[#684AC7] text-white",
        blue: "bg-[#0284C7] hover:bg-[#0369A1] text-white",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

// Common Input Component
export const Input = ({ label, icon, className = '', labelClassName = "text-white", inputClassName = "bg-[#CBD5E1] text-[#0F172A]", ...props }) => (
    <div className="flex flex-col gap-1.5 w-full">
        {label && <label className={`text-sm font-medium ml-1 ${labelClassName}`}>{label}</label>}
        <div className="relative flex items-center">
            {icon && <div className="absolute left-3 text-[#64748B]">{icon}</div>}
            <input
                className={`w-full rounded-lg placeholder-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#10B981] transition-colors ${icon ? 'pl-10' : 'px-4'} py-2.5 ${inputClassName} ${className}`}
                {...props}
            />
        </div>
    </div>
);

// Toggle Component
export const Toggle = ({ checked, onChange }) => (
    <div
        className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${checked ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`}
        onClick={onChange}
    >
        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
);

// Badge Component
export const Badge = ({ children, variant = 'default', className = '' }) => {
    const variants = {
        default: "bg-[#94A3B8] text-white",
        success: "bg-[#064E3B] text-[#34D399]",
        warning: "bg-[#78350F] text-[#F59E0B]",
        purple: "bg-[#7D5BE2] text-white",
        light: "bg-white text-[#0F172A]"
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
          {children}
        </span>
    );
};

// Section Header Component
export const SectionHeader = ({ title, icon, className = '', titleClassName = "text-white" }) => (
    <div className={`flex items-center gap-2 mb-4 ${className}`}>
        {icon && <div className="text-[#10B981]">{icon}</div>}
        <h3 className={`text-lg font-semibold ${titleClassName}`}>{title}</h3>
    </div>
);
