import React from 'react';
import { Download, History, Sparkles, FileText } from 'lucide-react';
import {Header} from "../../components/layout/PublicHeader.jsx";
import {Footer} from "../../components/layout/Footer.jsx";
import {useNavigation} from "react-router-dom";

export function InterviewResults() {
    const { navigate } = useNavigation();

    return (
        <div className="min-h-screen flex flex-col bg-[#111827] text-gray-100 font-sans selection:bg-[#1e3a8a]">
            {/* Dark mode header variant */}
            <Header/>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">

                {/* Left Column - Scores */}
                <div className="space-y-6">

                    {/* Total Score Card */}
                    <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-700 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-display font-semibold">Tổng điểm AI</h2>
                            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">Xuất sắc</span>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#374151" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251" strokeDashoffset="50" strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-3xl font-display font-bold">80<span className="text-sm font-sans text-gray-400 font-medium">/100</span></span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                <strong className="text-white block mb-1">AI nhận xét: </strong>
                                Kỹ năng giao tiếp của bạn rất tốt, tuy nhiên cần chú trọng hơn vào độ chính xác của các kiến thức chuyên môn kỹ thuật.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('cv')}
                                className="flex-1 flex justify-center items-center gap-2 bg-white text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
                                <Download size={16} /> Lưu kết quả
                            </button>
                            <button className="flex-1 flex justify-center items-center gap-2 bg-transparent text-gray-300 border border-gray-600 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors">
                                <History size={16} /> Lịch sử
                            </button>
                        </div>
                    </div>

                    {/* Detail Scores Card */}
                    <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-700 shadow-lg">
                        <h3 className="text-xs font-bold text-gray-400 mb-5 tracking-wider uppercase">Chi Tiết Năng Lực</h3>

                        <div className="space-y-4">
                            {[
                                { label: 'Giao tiếp (Communication)', score: 82, color: 'bg-blue-500' },
                                { label: 'Nội dung (Content Relevance)', score: 78, color: 'bg-blue-500' },
                                { label: 'Tự tin (Confidence)', score: 85, color: 'bg-blue-500' },
                                { label: 'Cấu trúc (Structure)', score: 80, color: 'bg-blue-500' },
                                { label: 'Kỹ thuật (Technical Accuracy)', score: 74, color: 'bg-blue-400' },
                            ].map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-300">{item.label}</span>
                                        <span className="font-semibold">{item.score}/100</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color} rounded-full`} style={{width: `${item.score}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-700">
                            <h3 className="text-xs font-bold text-gray-400 mb-5 tracking-wider uppercase">So sánh với lần trước</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Giao tiếp', diff: '+4', color: 'bg-emerald-500', width: '85%' },
                                    { label: 'Nội dung', diff: '+10', color: 'bg-emerald-500', width: '90%' },
                                    { label: 'Tự tin', diff: '+2', color: 'bg-emerald-500', width: '82%' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4">
                                        <span className="text-sm text-gray-300 w-20">{item.label}</span>
                                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden relative">
                                            <div className={`absolute left-0 top-0 bottom-0 ${item.color} rounded-full`} style={{width: item.width}}></div>
                                        </div>
                                        <span className="text-sm text-emerald-400 font-semibold w-8 text-right">{item.diff}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-6 py-2 border border-gray-600 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                                Xem chi tiết lịch sử
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Transcript */}
                <div className="bg-[#1f2937] rounded-xl border border-gray-700 shadow-lg flex flex-col overflow-hidden h-[calc(100vh-112px)] sticky top-24">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1f2937] shrink-0">
                        <h2 className="text-lg font-display font-semibold">Bản ghi hội thoại & Đánh giá</h2>
                        <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-medium">4 Đạt</span>
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-medium">1 Cần cải thiện</span>
                        </div>
                    </div>

                    {/* Chat Content log */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                        {/* Question Block 1 */}
                        <div>
                            <div className="flex gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-xs italic">AI</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-purple-400 mb-1 uppercase tracking-wider">AI Phỏng Vấn Viên</p>
                                    <p className="text-gray-200 text-sm leading-relaxed">Hãy giới thiệu ngắn gọn về bản thân và những kinh nghiệm nổi bật nhất của bạn trong 2 năm qua.</p>
                                </div>
                            </div>

                            <div className="ml-11 border-l-2 border-gray-700 pl-4 py-1 relative">
                                <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Câu trả lời của bạn</p>
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">Chào bạn, tôi là một Frontend Developer. Trong 2 năm qua tôi đã làm việc tại công ty X, sử dụng ReactJS để phát triển giao diện cho 3 dự án lớn. Tôi luôn học hỏi công nghệ mới và có trách nhiệm với công việc.</p>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Đạt</span>
                                    <span className="text-sm text-gray-400 italic">Phản hồi tốt nhưng có thể cụ thể hơn về kết quả</span>
                                </div>

                                <div className="bg-[#1e293b] border border-blue-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                                        <Sparkles size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Gợi ý từ AI Smartfolio</span>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        Nên thêm các con số cụ thể như: 'giúp cải thiện 20% tốc độ tải trang' hoặc 'giảm 15% lỗi UI'. Điều này sẽ làm tăng sức thuyết phục cho kinh nghiệm của bạn.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Question Block 2 */}
                        <div>
                            <div className="flex gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                                    <span className="font-bold text-xs italic">AI</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-purple-400 mb-1 uppercase tracking-wider">AI Phỏng Vấn Viên</p>
                                    <p className="text-gray-200 text-sm leading-relaxed">Bạn xử lý thế nào khi có xung đột ý kiến với đồng nghiệp về giải pháp kỹ thuật?</p>
                                </div>
                            </div>

                            <div className="ml-11 border-l-2 border-gray-700 pl-4 py-1 relative">
                                <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Câu trả lời của bạn</p>
                                <p className="text-gray-300 text-sm leading-relaxed mb-3">Thường thì tôi sẽ im lặng để tránh cãi vã và sau đó làm theo ý mình nếu tôi thấy đúng. Tôi không thích tranh luận nhiều.</p>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Cần cải thiện</span>
                                    <span className="text-sm text-gray-400 italic">Thái độ thiếu tính cộng tác</span>
                                </div>

                                <div className="bg-[#1e293b] border border-blue-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                                        <Sparkles size={14} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Gợi ý cách trả lời chuyên nghiệp</span>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        Tôi thường lắng nghe quan điểm của đồng nghiệp trước, sau đó đưa ra các dữ liệu hoặc bằng chứng kỹ thuật để cả hai cùng thảo luận khách quan. Mục tiêu cuối cùng là chọn ra giải pháp tốt nhất cho dự án chứ không phải thắng thua cá nhân.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-4 border-t border-gray-700 bg-[#1f2937] flex justify-end shrink-0">
                        <button className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm">
                            <FileText size={16} /> Xuất báo cáo PDF
                        </button>
                    </div>
                </div>

            </main>

            <Footer/>

            {/* Adding custom scrollbar styling globally for this dark theme context inline */}
            <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}} />
        </div>
    );
}

// Minimal icons for header since we separated it for dark mode
function BellIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>; }
function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
