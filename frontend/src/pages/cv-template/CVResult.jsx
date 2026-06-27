import React, { useState } from 'react';
import { Download, Sparkles, FileText, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { MainLayout } from '../../components/interview/MainLayout.jsx';
import { useNavigate, useLocation } from "react-router-dom";
import { cvEvaluations } from '../../constants/cv/cv-evaluation';

export function CVResult() {
    const navigate = useNavigate();
    const location = useLocation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSkillIndex, setActiveSkillIndex] = useState(null);
    const [addedSkills, setAddedSkills] = useState([]);
    const [inputValue, setInputValue] = useState('');

    const scenario = location.state?.scenario || 'default';
    const cvNameFromState = location.state?.cvName || 'My_CV.pdf';
    const evalData = cvEvaluations[scenario];

    if (!evalData) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <AlertCircle size={48} className="text-red-400 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800">Không tìm thấy dữ liệu phân tích</h2>
                    <p className="text-gray-500 mb-6">Vui lòng quay lại trang đánh giá và thử lại.</p>
                    <button
                        onClick={() => navigate('/cv-evaluation')}
                        className="px-6 py-2 bg-[#0b3c8f] text-white rounded-lg font-medium"
                    >
                        Quay lại
                    </button>
                </div>
            </MainLayout>
        );
    }

    const { jd, analysis } = evalData;
    const score = analysis.matchingScore;
    const offset = 264 - (264 * score) / 100;

    const openModal = (idx) => {
        setActiveSkillIndex(idx);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setActiveSkillIndex(null);
        setInputValue('');
    };

    const handleAddSkill = () => {
        if (activeSkillIndex !== null) {
            setAddedSkills(prev => [...prev, activeSkillIndex]);
            closeModal();
        }
    };

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleAddSkill();
        }
    };

    return (
        <MainLayout bgClass="bg-white">
            <div className="w-full flex justify-between items-end mb-8 pt-2">
                <div>
                    <h1 className="text-[28px] font-display font-semibold text-gray-900 mb-1">Phân tích CV theo JD</h1>
                    <p className="text-gray-500 text-sm">Tối ưu hóa hồ sơ của bạn với sức mạnh AI dựa trên mô tả công việc cụ thể.</p>
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
                                <button
                                    onClick={() => navigate('/cv-evaluation')}
                                    className="text-blue-600 text-xs font-semibold hover:underline"
                                >
                                    Thay đổi
                                </button>
                            </div>

                            <div className="h-32 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors">
                                <FileText size={28} className="text-gray-400 mb-2" />
                                <p className="text-sm font-medium text-gray-700 truncate px-4 w-full">
                                    {cvNameFromState}
                                </p>
                                <p className="text-xs text-gray-500">Đã phân tích bởi AI</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-gray-800 font-semibold mb-1">
                                    <BriefcaseIcon /> Mô tả công việc (JD)
                                </div>
                                <button
                                    onClick={() => navigate('/cv-evaluation')}
                                    className="text-blue-600 text-xs font-semibold hover:underline"
                                >
                                    Dán JD mới
                                </button>
                            </div>

                            <div className="h-32 bg-gray-50 rounded-lg p-3 text-sm text-gray-600 overflow-y-auto custom-scrollbar border border-gray-100">
                                <p className="font-semibold text-gray-800 mb-1">{jd.title}</p>
                                <p className="leading-relaxed">
                                    {jd.description.overview} {jd.description.details.map(d => ` ${d.title}: ${d.bullets.join(', ')}`).join('. ')}
                                </p>
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
                                    {analysis.gapAnalysis.matchedSkills.map((skill, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                            <span className="flex items-center gap-2 text-sm font-medium text-gray-800"><CheckCircle2 size={16} className="text-green-500" /> {skill.name}</span>
                                            <span className="text-[10px] uppercase font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{skill.level}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">KỸ NĂNG CÒN THIẾU</h4>
                                <ul className="space-y-3">
                                    {analysis.gapAnalysis.missingSkills.map((skill, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                            <span className="flex items-center gap-2 text-sm font-medium text-gray-800"><AlertCircle size={16} className="text-red-500" /> {skill.name}</span>
                                            {addedSkills.includes(idx) ? (
                                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold bg-green-100 text-green-700 px-2 py-1 rounded border border-green-200">
                                                    <CheckCircle2 size={10} /> Đã thêm
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => openModal(idx)}
                                                    className="flex items-center gap-1 text-[10px] uppercase font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                                                >
                                                    <Plus size={10} /> Thêm
                                                </button>
                                            )}
                                        </li>
                                    ))}
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
                            {analysis.atsOptimization.map((phrase, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                                    {phrase}
                                </span>
                            ))}
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
                                <circle
                                    cx="50" cy="50" r="42" fill="transparent"
                                    stroke="#144296" strokeWidth="10"
                                    strokeDasharray="264"
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                <span className="text-3xl font-display font-bold text-gray-900 leading-none">{score}%</span>
                                <span className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-wider">Matching</span>
                            </div>
                        </div>

                        <div className={`inline-block px-3 py-1 font-semibold text-xs rounded-full mb-3 border ${
                            score >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                            score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            {analysis.statusLabel}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{analysis.status}</h3>
                        <p className="text-sm text-gray-600 mb-6">{analysis.overallFeedback}</p>
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
                                    {analysis.aiSuggestions.professionalSummary}
                                </p>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-gray-900 mb-1">Work Experience</h5>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {analysis.aiSuggestions.workExperience}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Optimization CTA */}
                    <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-sm text-center">
                        <button
                            onClick={() => navigate('/builder', { state: { loadBadCV: true } })}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Sparkles size={18} /> Tối ưu CV ngay
                        </button>
                    </div>

                    {/* Interview Prep Banner */}
                    <div className="bg-[#144296] rounded-xl p-5 text-white shadow-md">
                        <h3 className="font-semibold text-lg mb-2">Luyện tập Phỏng vấn</h3>
                        <p className="text-sm text-blue-100/90 leading-relaxed mb-4">
                            Dựa trên JD này, AI đã chuẩn bị 5 câu hỏi phỏng vấn kỹ thuật và hành vi dành riêng cho bạn.
                        </p>
                    </div>

                </div>
            </div>

            {/* Modal for adding skill */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Thêm kỹ năng</h3>
                            <button onClick={closeModal} className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nhập mô tả kỹ năng</label>
                                <textarea
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all min-h-[100px]"
                                    placeholder="Ví dụ: Có kinh nghiệm 2 năm làm việc với React và Tailwind CSS..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Hoặc tải lên chứng chỉ/tài liệu</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileText className="text-gray-400 mb-2" size={24} />
                                            <p className="text-xs text-gray-500">Nhấn để chọn file</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-5 bg-gray-50 border-t border-gray-100">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddSkill}
                                disabled={!inputValue}
                                className="px-4 py-2 text-sm font-bold text-white bg-[#0b3c8f] rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
