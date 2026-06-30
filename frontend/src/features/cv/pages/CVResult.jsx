import React, { useState } from 'react';
import { Download, Sparkles, FileText, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { MainLayout } from '../../interview/components/MainLayout.jsx';
import { useNavigate, useLocation } from "react-router-dom";
import { cvEvaluations } from '../constants/cv-evaluation.js';

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
                    <AlertCircle size={48} className="text-error mb-4" />
                    <h2 className="text-xl font-semibold text-on-surface">Không tìm thấy dữ liệu phân tích</h2>
                    <p className="text-on-surface-variant mb-6">Vui lòng quay lại trang đánh giá và thử lại.</p>
                    <button
                        onClick={() => navigate('/cv-evaluation')}
                        className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium"
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
        <MainLayout bgClass="bg-background">
            <div className="w-full flex justify-between items-end mb-8 pt-2">
                <div>
                    <h1 className="text-[28px] font-display font-semibold text-on-surface mb-1">Phân tích CV theo JD</h1>
                    <p className="text-on-surface-variant text-sm">Tối ưu hóa hồ sơ của bạn với sức mạnh AI dựa trên mô tả công việc cụ thể.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left & Middle Flow (Col 1 Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Top Row: Documents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass-panel rounded-xl border border-primary-container shadow-sm p-5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-on-surface font-semibold mb-1">
                                    <UserIcon /> CV của bạn
                                </div>
                                <button
                                    onClick={() => navigate('/cv-evaluation')}
                                    className="text-primary text-xs font-semibold hover:underline"
                                >
                                    Thay đổi
                                </button>
                            </div>

                            <div className="h-32 border-2 border-dashed border-outline-variant rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-container transition-colors">
                                <FileText size={28} className="text-outline mb-2" />
                                <p className="text-sm font-medium text-on-surface truncate px-4 w-full">
                                    {cvNameFromState}
                                </p>
                                <p className="text-xs text-on-surface-variant">Đã phân tích bởi AI</p>
                            </div>
                        </div>

                        <div className="glass-panel rounded-xl border border-outline-variant shadow-sm p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-on-surface font-semibold mb-1">
                                    <BriefcaseIcon /> Mô tả công việc (JD)
                                </div>
                                <button
                                    onClick={() => navigate('/cv-evaluation')}
                                    className="text-primary text-xs font-semibold hover:underline"
                                >
                                    Dán JD mới
                                </button>
                            </div>

                            <div className="h-32 bg-surface-container-low rounded-lg p-3 text-sm text-on-surface-variant overflow-y-auto custom-scrollbar border border-outline-variant">
                                <p className="font-semibold text-on-surface mb-1">{jd.title}</p>
                                <p className="leading-relaxed">
                                    {jd.description.overview} {jd.description.details.map(d => ` ${d.title}: ${d.bullets.join(', ')}`).join('. ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gap Analysis */}
                    <div className="glass-panel rounded-xl border border-outline-variant shadow-sm p-6">
                        <div className="flex items-center gap-2 text-on-surface font-semibold mb-5 text-lg">
                            <ChartIcon /> Phân tích khoảng cách kỹ năng
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">KỸ NĂNG HIỆN CÓ</h4>
                                <ul className="space-y-3">
                                    {analysis.gapAnalysis.matchedSkills.map((skill, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2">
                                            <span className="flex items-center gap-2 text-sm font-medium text-on-surface"><CheckCircle2 size={16} className="text-primary" /> {skill.name}</span>
                                            <span className="text-[10px] uppercase font-bold bg-primary-container text-primary px-1.5 py-0.5 rounded">{skill.level}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">KỸ NĂNG CÒN THIẾU</h4>
                                <ul className="space-y-3">
                                    {analysis.gapAnalysis.missingSkills.map((skill, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                            <span className="flex items-center gap-2 text-sm font-medium text-on-surface"><AlertCircle size={16} className="text-red-500" /> {skill.name}</span>
                                            {addedSkills.includes(idx) ? (
                                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold bg-primary-container text-primary px-2 py-1 rounded border border-primary-container">
                                                    <CheckCircle2 size={10} /> Đã thêm
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => openModal(idx)}
                                                    className="flex items-center gap-1 text-[10px] uppercase font-bold bg-primary hover:bg-primary-container text-on-primary px-2 py-1 rounded transition-colors"
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
                    <div className="glass-panel rounded-xl border border-outline-variant shadow-sm p-6">
                        <div className="flex items-center gap-2 text-on-surface font-semibold mb-2 text-lg">
                            <SettingsIcon /> Tối ưu hóa ATS
                        </div>
                        <p className="text-sm text-on-surface-variant mb-4">Thêm các "Power Words" sau vào phần mô tả kinh nghiệm để tăng thứ hạng lọc hồ sơ:</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.atsOptimization.map((phrase, idx) => (
                                <span key={idx} className="px-3 py-1.5 bg-primary-container border border-primary-container text-primary rounded-full text-sm font-medium">
                                    {phrase}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column (Widget) */}
                <div className="space-y-6">

                    {/* Score Card */}
                    <div className="glass-panel rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col items-center text-center">
                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--color-outline)" strokeWidth="10" />
                                <circle
                                    cx="50" cy="50" r="42" fill="transparent"
                                    stroke="var(--color-primary)" strokeWidth="10"
                                    strokeDasharray="264"
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                                <span className="text-3xl font-display font-bold text-on-surface leading-none">{score}%</span>
                                <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-wider">Matching</span>
                            </div>
                        </div>

                        <div className={`inline-block px-3 py-1 font-semibold text-xs rounded-full mb-3 border ${
                            score >= 80 ? 'bg-primary-container text-primary border-primary-container' :
                            score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                            {analysis.statusLabel}
                        </div>
                        <h3 className="text-lg font-bold text-on-surface mb-2">{analysis.status}</h3>
                        <p className="text-sm text-on-surface-variant mb-6">{analysis.overallFeedback}</p>
                    </div>

                    {/* AI Callout */}
                    <div className="bg-primary-container/50 rounded-xl border border-primary-container p-5 relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 text-primary/20" size={32} />
                        <div className="flex items-center gap-2 text-primary font-bold mb-4">
                            <Sparkles size={18} /> Gợi ý từ AI
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <h5 className="text-sm font-semibold text-on-surface mb-1">Professional Summary</h5>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {analysis.aiSuggestions.professionalSummary}
                                </p>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-on-surface mb-1">Work Experience</h5>
                                <p className="text-sm text-on-surface-variant leading-relaxed">
                                    {analysis.aiSuggestions.workExperience}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Optimization CTA */}
                    <div className="glass-panel rounded-xl border border-primary-container p-5 shadow-sm text-center">
                        <button
                            onClick={() => navigate('/builder', { state: { loadBadCV: true } })}
                            className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <Sparkles size={18} /> Tối ưu CV ngay
                        </button>
                    </div>

                    {/* Interview Prep Banner */}
                    <div className="bg-primary rounded-xl p-5 text-on-primary shadow-md">
                        <h3 className="font-semibold text-lg mb-2">Luyện tập Phỏng vấn</h3>
                        <p className="text-sm text-on-primary-container leading-relaxed mb-4">
                            Dựa trên JD này, AI đã chuẩn bị 5 câu hỏi phỏng vấn kỹ thuật và hành vi dành riêng cho bạn.
                        </p>
                    </div>

                </div>
            </div>

            {/* Modal for adding skill */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/50 backdrop-blur-sm">
                    <div className="glass-panel rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-outline-variant animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-outline-variant">
                            <h3 className="text-lg font-bold text-on-surface">Thêm kỹ năng</h3>
                            <button onClick={closeModal} className="p-1 rounded-full hover:bg-surface-container-low text-outline hover:text-on-surface transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Nhập mô tả kỹ năng</label>
                                <textarea
                                    className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[100px] bg-surface-container-low text-on-surface"
                                    placeholder="Ví dụ: Có kinh nghiệm 2 năm làm việc với React và Tailwind CSS..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-semibold text-on-surface-variant mb-2">Hoặc tải lên chứng chỉ/tài liệu</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-outline-variant border-dashed rounded-lg cursor-pointer bg-surface-container-low hover:bg-surface-container transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileText className="text-outline mb-2" size={24} />
                                            <p className="text-xs text-on-surface-variant">Nhấn để chọn file</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-5 bg-surface-container-low border-t border-outline-variant">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddSkill}
                                disabled={!inputValue}
                                className="px-4 py-2 text-sm font-bold text-on-primary bg-primary rounded-lg hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-outline); border-radius: 4px; }
      `}} />
        </MainLayout>
    );
}

// Icons
function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function BriefcaseIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>; }
function ChartIcon() { return <svg xmlns="http://www.w3.org/ la 0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>; }
function SettingsIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>; }
