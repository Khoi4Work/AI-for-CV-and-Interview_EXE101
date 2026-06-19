import React, { useState } from 'react';
import TopNagivationToolBar from "../../components/template/TopNagivationToolBar.jsx";
import {User, Star, Monitor, Sparkles, Download, ZoomIn, ZoomOut, RotateCcw, Layout, Plus, Trash2} from "lucide-react";
import { useApp } from '../../contexts/AppContext.jsx';
import { useCV } from '../../contexts/CVContext.jsx';
import TemplateRenderer from '../../components/template/TemplateRenderer';
import { mapCVDataToTemplate } from '../../mapper/cv-data-mapper.js';
import { TEMPLATES_DATA } from '../../constants/templates';

export default function CVEditor() {
    const { showToast } = useApp();
    const { cvData, updatePersonalInfo, updateSummary, updateExperience, updateExperienceDetail, updateSkills, setTemplate } = useCV();
    const [zoom, setZoom] = useState(100);
    const selectedTemplate = cvData.selectedTemplateId;

    const handleExport = () => {
        showToast('Đang tối ưu hóa định dạng PDF... Tệp của bạn sẽ được tải xuống trong giây lát.', 'success');
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleResetZoom = () => setZoom(100);

    const simulateAIRewrite = (section, currentText) => {
        showToast(`AI đang tối ưu hóa nội dung phần ${section}...`, 'info');
        setTimeout(() => {
            const optimizedText = `[AI Optimized] ${currentText} - Đã tối ưu hóa các từ khóa hành động và nhấn mạnh kết quả định lượng.`;
            if (section === 'summary') updateSummary(optimizedText);
            showToast(`Đã tối ưu hóa ${section} thành công!`, 'success');
        }, 1500);
    };

    const templateData = mapCVDataToTemplate(cvData);

    return (
        <div className="flex flex-col h-screen overflow-hidden editor-body bg-slate-200">
            <TopNagivationToolBar
                onExport={handleExport}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
            />
            <main className="flex-1 overflow-hidden flex relative bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200">
                {/* LEFT COLUMN: Editing Panel */}
                <div className="w-[400px] bg-white border-r border-slate-300 overflow-y-auto p-6 space-y-8 shadow-xl z-20">
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-blue-600"/> Chỉnh sửa nội dung
                        </h2>

                        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase">Thông tin cá nhân</span>
                                <User className="w-4 h-4 text-slate-400"/>
                            </div>
                            <div className="space-y-3">
                                <input
                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={cvData.personalInfo.name}
                                    onChange={(e) => updatePersonalInfo({name: e.target.value})}
                                    placeholder="Họ và tên"
                                />
                                <input
                                    className="w-full p-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={cvData.personalInfo.email}
                                    onChange={(e) => updatePersonalInfo({email: e.target.value})}
                                    placeholder="Email"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400 uppercase">Mục tiêu nghề nghiệp</span>
                                <button
                                    onClick={() => simulateAIRewrite('summary', cvData.summary)}
                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                                    title="AI Rewrite">
                                    <Sparkles className="w-4 h-4"/>
                                </button>
                            </div>
                            <textarea
                                className="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                value={cvData.summary}
                                onChange={(e) => updateSummary(e.target.value)}
                                placeholder="Nhập tóm tắt chuyên môn..."
                            />
                        </div>

                        <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase">Kinh nghiệm</span>
                                <button className="p-1 bg-blue-600 text-white rounded-md"><Plus className="w-3 h-3"/></button>
                            </div>
                            <div className="space-y-4">
                                {cvData.experiences.map((exp, idx) => (
                                    <div key={exp.id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                                        <input
                                            className="w-full p-1 text-sm font-bold border-b border-slate-100 outline-none focus:border-blue-500"
                                            value={exp.company}
                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                        />
                                        <input
                                            className="w-full p-1 text-sm border-b border-slate-100 outline-none focus:border-blue-500"
                                            value={exp.role}
                                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                        />
                                        <textarea
                                            className="w-full p-2 text-xs border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                            value={exp.details.join('\n')}
                                            onChange={(e) => updateExperience(exp.id, 'details', e.target.value.split('\n'))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto flex justify-center p-12 relative">
                    <div className="absolute inset-0 opacity-30 pointer-events-none"
                         style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                    </div>
                    <div
                        className="cv-page-container bg-white flex shrink-0 shadow-2xl transition-transform duration-200 ease-in-out relative z-10"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    >
                        <TemplateRenderer
                            templateId={selectedTemplate}
                            userData={templateData}
                        />
                    </div
                >
                </div>
            </main>
        </div>
    );
}
