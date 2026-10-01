import React, { useState } from 'react';
import TopNagivationToolBar from '../components/TopNagivationToolBar.jsx';
import { useCV } from '../contexts/CVContext.jsx';
import TemplateRenderer from '../components/TemplateRenderer.jsx';
import { mapCVDataToTemplate } from '../mapper/cv-data-mapper.js';
import { TEMPLATES_DATA } from '../constants/templates.js';

export default function CVEditor() {
    const { cvData, setTemplate } = useCV();
    const [zoom, setZoom] = useState(100);
    const selectedTemplate = cvData.selectedTemplateId;
    const templateName = TEMPLATES_DATA.find(template => template.id === selectedTemplate)?.title || 'CV';
    const templateData = mapCVDataToTemplate(cvData);

    return (
        <div className="cv-editor-shell flex flex-col h-screen overflow-hidden" style={{ background: 'radial-gradient(circle at center, var(--color-bg-radial-start) 0%, var(--color-bg-radial-end) 100%)' }}>
            <TopNagivationToolBar
                onExport={() => window.print()}
                templateName={templateName}
                zoom={zoom}
                onZoomIn={() => setZoom(prev => Math.min(prev + 10, 200))}
                onZoomOut={() => setZoom(prev => Math.max(prev - 10, 50))}
                templateOptions={TEMPLATES_DATA}
                onTemplateChange={setTemplate}
                selectedTemplateId={selectedTemplate}
            />
            <main className="cv-editor-preview flex-1 overflow-y-auto flex justify-center p-12 relative">
                <div
                    className="cv-page-container flex shrink-0 transition-transform duration-200 ease-in-out relative z-10"
                    style={{
                        width: selectedTemplate === 'the-standard' ? 1000 : 850,
                        maxWidth: '100%',
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                    }}
                >
                    <TemplateRenderer templateId={selectedTemplate} userData={templateData} />
                </div>
            </main>
        </div>
    );
}
