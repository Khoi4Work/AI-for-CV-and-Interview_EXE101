import React, { useState, useEffect } from 'react';
import TopNagivationToolBar from "../components/TopNagivationToolBar.jsx";
import {User, Star, Monitor, Sparkles, Download, ZoomIn, ZoomOut, RotateCcw, Layout, Plus, Trash2} from "lucide-react";
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { useCV } from '../contexts/CVContext.jsx';
import { goodResumeData } from '../constants/cv-mock-data.js';
import { mapMockDataToCVContext } from '../mapper/cv-data-mapper.js';
import TemplateRenderer from '../components/TemplateRenderer.jsx';
import { mapCVDataToTemplate } from '../mapper/cv-data-mapper.js';
import { TEMPLATES_DATA } from '../constants/templates.js';

export default function CVEditor() {
    const { showToast } = useApp();
    const {
        cvData,
        setHasCV,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateSkills,
        setTemplate,
        setFullCVData
    } = useCV();
    const [zoom, setZoom] = useState(100);
    const selectedTemplate = cvData.selectedTemplateId;

    useEffect(() => {
        const mappedData = mapMockDataToCVContext(goodResumeData);
        setFullCVData(mappedData);
    }, [setFullCVData]);


    const handleSave = () => {
        setHasCV(true);
        showToast('CV của bạn đã được lưu thành công!', 'success');
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
        <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'radial-gradient(circle at center, var(--color-bg-radial-start) 0%, var(--color-bg-radial-end) 100%)' }}>
            <TopNagivationToolBar
                onExport={handleSave}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
            />
            <main className="flex-1 overflow-y-auto flex justify-center p-12 relative">
                <div
                    className="cv-page-container flex shrink-0 transition-transform duration-200 ease-in-out relative z-10"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >
                    <TemplateRenderer
                        templateId={selectedTemplate}
                        userData={templateData}
                    />
                </div>
            </main>
        </div>
    );
}
