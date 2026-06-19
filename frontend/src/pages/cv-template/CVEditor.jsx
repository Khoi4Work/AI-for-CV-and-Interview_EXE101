import React, { useState } from 'react';
import TopNagivationToolBar from "../../components/template/TopNagivationToolBar.jsx";
import {User, Star, Monitor, Sparkles, Download, ZoomIn, ZoomOut, RotateCcw, Layout} from "lucide-react";
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

    const simulateAIRewrite = (section) => {
        showToast(`AI đang tối ưu hóa nội dung phần ${section}...`, 'info');
        setTimeout(() => {
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


                <div className="flex-1 overflow-auto flex justify-center p-12 relative">
                    {/* Decorative Background Pattern */}
                    <div className="absolute inset-0 opacity-30 pointer-events-none"
                         style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                    </div>

                    {/* CV Document Rendering */}
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
