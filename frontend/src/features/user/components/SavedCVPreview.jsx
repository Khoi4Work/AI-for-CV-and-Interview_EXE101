import { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { CVPreviewProvider } from '../../cv/contexts/CVContext.jsx';
import TemplateRenderer from '../../cv/components/TemplateRenderer.jsx';
import { TEMPLATE_COMPONENTS } from '../../cv/mapper/TemplateMap.js';
import { mapCVDataToTemplate } from '../../cv/mapper/cv-data-mapper.js';
import { getSavedCVPreviewData } from '../utils/savedCVPreview.js';

export default function SavedCVPreview({ cv, compact = false }) {
    const viewportRef = useRef(null);
    const documentRef = useRef(null);
    const [size, setSize] = useState({ width: compact ? 240 : 640, height: 1500 });
    const data = getSavedCVPreviewData(cv);
    const templateId = data?.selectedTemplateId;
    const supported = Boolean(TEMPLATE_COMPONENTS[templateId]);
    const canvasWidth = templateId === 'the-standard' ? 1000 : 850;
    const scale = Math.min(1, size.width / canvasWidth);
    useEffect(() => {
        const viewport = viewportRef.current;
        const document = documentRef.current;
        if (!viewport || !document) return;
        const measure = () => {
            const width = viewport.clientWidth;
            const height = document.offsetHeight;
            if (width > 0 && height > 0) setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
        };
        const frame = requestAnimationFrame(measure);
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
        observer?.observe(viewport);
        observer?.observe(document);
        return () => { cancelAnimationFrame(frame); observer?.disconnect(); };
    }, [templateId, cv.content, supported]);

    if (!data || !supported) return <div className="min-h-60 flex flex-col items-center justify-center gap-3 text-slate-400 p-5 text-center bg-white">
        <FileText size={48} /><p className="text-xs">{!data ? 'CV chưa có nội dung để xem trước.' : !templateId ? 'CV chưa chọn mẫu.' : 'Mẫu CV này chưa hỗ trợ xem trước.'}</p>
    </div>;
    return <div ref={viewportRef} className="relative w-full overflow-hidden bg-white" style={{ height: compact ? 240 : Math.ceil(size.height * scale) }}>
        <div ref={documentRef} className="absolute top-0 left-0 pointer-events-none" style={{ width: canvasWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <CVPreviewProvider cvData={data}>
                <TemplateRenderer templateId={templateId} userData={mapCVDataToTemplate(data)} />
            </CVPreviewProvider>
        </div>
    </div>;
}
