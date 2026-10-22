import { FileText } from 'lucide-react';
import CvPdfPreview from '../../cv/components/CvPdfPreview.jsx';
import { PDF_TEMPLATE_LOADERS } from '../../cv/pdf-renderer/templateRegistry.js';
import { getSavedCVPreviewData } from '../utils/savedCVPreview.js';
import ImportedCVPreview from './ImportedCVPreview.jsx';

export default function SavedCVPreview({ cv, compact = false }) {
    const data = getSavedCVPreviewData(cv);
    const templateId = data?.selectedTemplateId;
    const supported = Boolean(PDF_TEMPLATE_LOADERS[templateId]);

    if (data && !templateId) return <ImportedCVPreview data={data} compact={compact}/>;

    if (!data || !supported) return <div className="min-h-60 flex flex-col items-center justify-center gap-3 text-slate-400 p-5 text-center bg-white">
        <FileText size={48} /><p className="text-xs">{!data ? 'CV chưa có nội dung để xem trước.' : 'Mẫu CV này chưa hỗ trợ xem trước.'}</p>
    </div>;
    return <div className="relative w-full overflow-hidden bg-slate-100" style={{ height: compact ? 240 : 520 }}>
        <CvPdfPreview cvData={data} templateId={templateId} className="h-full w-full bg-white" />
    </div>;
}
