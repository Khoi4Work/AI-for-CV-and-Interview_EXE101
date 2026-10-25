import { FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import EditableCvHtmlTemplate from '../../cv/pdf-renderer/templates/EditableCvHtmlTemplate.jsx';
import { PDF_TEMPLATE_LOADERS } from '../../cv/pdf-renderer/templateRegistry.js';
import { getSavedCVPreviewData } from '../utils/savedCVPreview.js';
import ImportedCVPreview from './ImportedCVPreview.jsx';

const A4_WIDTH = 210 * 96 / 25.4;
const A4_HEIGHT = 297 * 96 / 25.4;

function TemplatePreview({ data, templateId, compact }) {
    const viewport = useRef(null);
    const document = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: A4_HEIGHT });
    useEffect(() => {
        const update = () => {
            const width = viewport.current?.clientWidth || 0;
            const height = Math.max(A4_HEIGHT, document.current?.scrollHeight || 0);
            setDimensions(previous => previous.width === width && previous.height === height
                ? previous : { width, height });
        };
        const observer = new ResizeObserver(update);
        observer.observe(viewport.current);
        observer.observe(document.current);
        update();
        return () => observer.disconnect();
    }, []);
    const scale = dimensions.width ? Math.min(1, dimensions.width / A4_WIDTH) : compact ? 0.3 : 1;
    return <div ref={viewport} aria-label={compact ? 'Ảnh xem trước CV' : 'Bản xem trước CV'}
        className={`relative w-full min-w-0 bg-slate-100 ${compact ? 'overflow-hidden pointer-events-none' : 'overflow-y-auto overflow-x-hidden'}`}
        style={{ height: compact ? 240 : 'min(74vh, 960px)' }}>
        <div className="relative mx-auto" style={{ width: A4_WIDTH * scale, height: dimensions.height * scale }}>
            <div ref={document} style={{ width: '210mm', transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', inset: '0 auto auto 0' }}>
                <EditableCvHtmlTemplate data={data} templateId={templateId} />
            </div>
        </div>
    </div>;
}

export default function SavedCVPreview({ cv, compact = false }) {
    const data = getSavedCVPreviewData(cv);
    const templateId = data?.selectedTemplateId;
    const supported = Boolean(PDF_TEMPLATE_LOADERS[templateId]);

    if (data && !templateId) return <ImportedCVPreview data={data} compact={compact}/>;

    if (!data || !supported) return <div className="min-h-60 flex flex-col items-center justify-center gap-3 text-slate-400 p-5 text-center bg-white">
        <FileText size={48} /><p className="text-xs">{!data ? 'CV chưa có nội dung để xem trước.' : 'Mẫu CV này chưa hỗ trợ xem trước.'}</p>
    </div>;
    return <TemplatePreview data={data} templateId={templateId} compact={compact} />;
}
