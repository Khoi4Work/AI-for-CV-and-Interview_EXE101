import React from 'react';
import { Download, Sparkles, FileText, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout';
import {useNavigation} from "react-router-dom";

export function CvAnalysis() {
    const { navigate } = useNavigation();

    return (
        <MainLayout>
            <div className="w-full flex justify-between items-end mb-8 pt-2">
                <div>
                    <h1 className="text-[28px] font-display font-semibold text-gray-900 mb-1">Phân tích CV theo JD</h1>
                    <p className="text-gray-500 text-sm">Tối ưu hóa hồ sơ của bạn với sức mạnh AI dựa trên mô tả công việc cụ thể.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                        <Download size={16} /> Báo cáo chi tiết
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#144296] text-white rounded-lg text-sm font-medium hover:bg-[#00388d] shadow-sm">
                        <Sparkles size={16} /> Tối ưu ngay với AI
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left & Middle Flow (Col 1 Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Top Row: Documents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl border border-blue-100 shadow-sm p-5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-gray-800 font-semibold mb-1">
                                    <UserIcon /> CV của bạn
                                </div>
                                <button className="text-blue-600 text-xs font-semibold hover:underline">Thay đổi</button>
                            </div>

                            <div className="h-32 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                <FileText size={28} className="text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700">Nguyen_Van_A_CV.pdf</p>
                                <p className="text-xs text-gray-500">Đã tải lên 2 giờ trước</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-gray-800 font-semibold mb-1">
                                    <BriefcaseIcon /> Mô tả công việc (JD)
                                </div>
                                <button className="text-blue-600 text-xs font-semibold hover:underline">Dán JD mới</button>
                            </div>

                            <div className="h-32 bg-gray-50 rounded-lg p-3 text-sm text-gray-600 overflow-y-auto custom-scrollbar border border-gray-100">
                                <p className="font-semibold text-gray-800 mb-1">Vị trí: Senior Product Designer</p>
                                <p className="leading-relaxed">Chúng tôi đang tìm kiếm một Senior Product Designer đam mê với việc xây dựng các trải nghiệm người dùng tuyệt vời... Yêu cầu 5+ năm kinh nghiệm, thành thạo Figma, Design System, và khả năng làm việc với AI Tools.</p>
                            </div>
                        </div>
                    </div>

                    {/* Gap Analysis */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold mb-5 text-lg">
                            <ChartIcon /> Phân tích khoảng cách kỹ năng
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">KỸ NĂNG HIỆN CÓ</h4>
                                <ul className="space-y-3">
                                    <li className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-800"><CheckCircle2 size={16} className="text-green-500" /> UI/UX Design</span>
                                        <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Khớp</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-800"><CheckCircle2 size={16} className="text-green-500" /> Figma Mastery</span>
                                        <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Khớp</span>
                                    </li>
                                    <li className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-800"><CheckCircle2 size={16} className="text-green-500" /> Prototyping</span>
                                        <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Khớp</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">KỸ NĂNG CÒN THIẾU</h4>
                                <ul className="space-y-3">
                                    <li className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-800"><AlertCircle size={16} className="text-red-500" /> Design Systems</span>
                                        <button className="flex items-center gap-1 text-[10px] uppercase font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"><Plus size={10} /> Thêm</button>
                                    </li>
                                    <li className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-800"><AlertCircle size={16} className="text-red-500" /> AI-Assisted Workflow</span>
                                        <button className="flex items-center gap-1 text-[10px] uppercase font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"><Plus size={10} /> Thêm</button>
                                    </li>
                                    <li className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 opacity-70">
                                        <span className="flex items-center gap-2 text-sm font-medium text-gray-600"> <TriAlertIcon /> Stakeholder Management</span>
                                        <button className="flex items-center gap-1 text-[10px] uppercase font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"><Plus size={10} /> Thêm</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* ATS Optimization */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-2 text-gray-800 font-semibold mb-2 text-lg">
                            <SettingsIcon /> Tối ưu hóa ATS
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Thêm các "Power Words" sau vào phần mô tả kinh nghiệm để tăng thứ hạng lọc hồ sơ:</p>
                        <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">Optimized conversion by 20%</span>
                            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">Scalable Design System</span>
                            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">Collaborated with stakeholders</span>
                            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">Led a team of 3</span>
                            <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">Accessibility standards</span>
                        </div>
                    </div>

                </div>

                {/* Right Column (Widget) */}
                <div className="space-y-6">

                    {/* Score Card */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#f3f4f6" strokeWidth="10" />
                                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#144296" strokeWidth="10" strokeDasharray="264" strokeDashoffset="58" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                <span className="text-3xl font-display font-bold text-gray-900 leading-none">78%</span>
                                <span className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">Matching</span>
                            </div>
                        </div>

                        <div className="inline-block px-3 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-full mb-3 border border-amber-200">
                            Cần tối ưu thêm
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Khá ổn định</h3>
                        <p className="text-sm text-gray-600 mb-6">Bạn chỉ cách mức "Hợp nhất" 12% điểm kỹ năng quan trọng.</p>

                        <button className="w-full py-3 bg-[#111c3a] hover:bg-black text-white rounded-lg font-medium shadow-sm transition-colors mb-3">
                            Tự động sửa CV với AI
                        </button>
                        <button
                            onClick={() => navigate('audio')}
                            className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-[#144296] border border-blue-100 rounded-lg font-medium transition-colors">
                            <div className="flex items-center justify-center gap-2">
                                <MicIcon /> Bắt đầu Phỏng vấn thử
                            </div>
                        </button>
                    </div>

                    {/* AI Callout */}
                    <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 text-blue-200" size={32} />
                        <div className="flex items-center gap-2 text-[#144296] font-bold mb-4">
                            <Sparkles size={18} /> Gợi ý từ AI
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-1">Professional Summary</h5>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    "Hãy nhấn mạnh hơn vào kinh nghiệm xây dựng **Design System** từ số 0. Đây là yêu cầu trọng tâm của JD này."
                                </p>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-1">Work Experience</h5>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    "Sử dụng các con số cụ thể như 'Giảm 15% thời gian phát triển' thay vì chỉ nói 'Làm việc hiệu quả'."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Interview Prep Banner */}
                    <div className="bg-[#144296] rounded-xl p-5 text-white shadow-md">
                        <h3 className="font-semibold text-lg mb-2">Luyện tập Phỏng vấn</h3>
                        <p className="text-sm text-blue-100/90 leading-relaxed mb-4">
                            Dựa trên JD này, AI đã chuẩn bị 5 câu hỏi phỏng vấn kỹ thuật và hành vi dành riêng cho bạn.
                        </p>
                        {/* Just a decorative block as per cut-off image */}
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
      `}} />
        </MainLayout>
    );
}

// Icons
function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function BriefcaseIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>; }
function ChartIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>; }
function SettingsIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>; }
function TriAlertIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>; }
function MicIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>; }
