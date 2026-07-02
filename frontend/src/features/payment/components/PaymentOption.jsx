import React from 'react';
import { Circle, CheckCircle2 } from 'lucide-react';

export function PaymentOption({ title, logo, selected, onClick, children }) {
    return (
        <div
            className={`rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border ${
                selected ? 'bg-white border-transparent shadow-md' : 'bg-[#1b2a36] border-[#1b2a36] hover:border-gray-600'
            }`}
            onClick={onClick}
        >
            <div className={`p-4 flex items-center justify-between ${selected ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3">
                    {selected ? (
                        <CheckCircle2 className="w-[22px] h-[22px] text-[#1c8c54]" />
                    ) : (
                        <Circle className="w-[22px] h-[22px] text-gray-400" />
                    )}
                    <span className={`font-medium text-sm ${selected ? 'text-gray-900' : 'text-gray-200'}`}>
            {title}
          </span>
                </div>
                <div>{logo}</div>
            </div>
            {selected && children && (
                <div className="p-8 bg-white flex justify-center">
                    {children}
                </div>
            )}
        </div>
    );
}
