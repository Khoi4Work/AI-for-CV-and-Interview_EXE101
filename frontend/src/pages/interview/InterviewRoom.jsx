import React from 'react';
import { Clock, Settings, MicOff, ArrowRight, Sparkles } from 'lucide-react';
import {useNavigate} from "react-router-dom";

export function InterviewRoom() {
    const navigate  = useNavigate();

    return (
        <div className="min-h-screen flex flex-col bg-surface-dim font-sans">
            {/* Minimal Header */}
            <header className="w-full h-16 flex items-center justify-between px-6 bg-white border-b border-border shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-bold text-xs italic">S</div>
                    <span className="font-display font-bold text-xl tracking-tight text-primary">Smartfolio</span>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
                    <span className="w-2 h-2 rounded-full bg-[#1a56db]"></span>
                    <span className="text-sm font-semibold text-[#1a56db] tracking-wide">PHÒNG PHỎNG VẤN</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                    <Clock size={16} />
                    <span>Thời gian: 12:45</span>
                </div>
            </header>

            {/* Main Content Stage */}
            <main className="flex-1 relative flex flex-col items-center justify-center p-6">

                <div className="w-32 h-32 bg-gray-200 rounded-full mb-8 relative border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                    {/* Fake User Avatar placeholder */}
                    <div className="w-full h-full bg-gray-300"></div>

                    {/* Simulated pulse ring behind would go here */}
                </div>

                <div className="flex items-center gap-1 mb-8 text-[#1a56db] opacity-60">
                    {/* Fake Waveform */}
                    {[1, 2, 4, 2, 1, 3, 6, 8, 5, 2, 4, 7, 10, 8, 4, 2, 5, 3, 1, 2].map((h, i) => (
                        <div key={i} className="w-1.5 bg-current rounded-full mx-px" style={{height: `${h * 4}px`}}></div>
                    ))}
                </div>

                <div className="bg-blue-100/50 text-[#1a56db] px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a56db] animate-pulse"></span>
                    ĐANG GHI ÂM...
                </div>

                <p className="max-w-2xl text-center text-lg md:text-xl font-medium text-gray-800 leading-relaxed">
                    "Về câu hỏi về thử thách lớn nhất trong dự án gần đây, tôi xin chia sẻ một trải nghiệm khi làm việc với đội ngũ phát triển để tích hợp một API mới..."
                </p>

                {/* AI Floating Suggestion */}
                <div className="absolute right-8 bottom-8 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-5 z-10">
                    <div className="flex items-center gap-2 font-display font-semibold text-xs tracking-wider text-gray-500 mb-3">
                        <Sparkles size={14} className="text-amber-500" />
                        GỢI Ý TỪ AI
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        Hãy nhắc đến phương pháp STAR (Situation, Task, Action, Result) để câu trả lời của bạn mạch lạc hơn.
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        Cụ thể hóa kết quả bằng số liệu nếu có thể.
                    </p>
                </div>
            </main>

            {/* Control Footer */}
            <footer className="w-full h-20 bg-white border-t border-border px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-[#d93025] hover:bg-[#c5221f] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                        <MicOff size={18} />
                        Mute
                    </button>
                    <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                        <Settings size={18} />
                        Settings
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2">
                    <button
                        onClick={() => navigate('/interview/review')}
                        className="flex items-center justify-center gap-2 bg-[#111c3a] hover:bg-black text-white px-8 py-3 w-64 rounded-xl font-medium transition-colors shadow-sm">
                        <ArrowRight size={18} />
                        Hoàn thành câu hỏi
                    </button>
                </div>

                <div className="w-[180px]"> {/* Spacer to balance flex layout */}</div>
            </footer>
        </div>
    );
}
