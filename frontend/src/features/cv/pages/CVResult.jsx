import {useEffect, useMemo, useState} from 'react';
import {CheckCircle2} from 'lucide-react';
import {MainLayout} from '../../interview/components/MainLayout.jsx';
import {useNavigate,useLocation} from 'react-router-dom';
import {useCV} from '../contexts/CVContext.jsx';
import {mapImportedCVData} from '../mapper/cv-data-mapper.js';
import CvPdfPreview from '../components/CvPdfPreview.jsx';
import galleryService from '../../../service/galleryService.js';
import {PDF_TEMPLATE_LOADERS} from '../pdf-renderer/templateRegistry.js';
import {formatOptimizationSectionName} from '../utils/optimizationSectionName.js';
import CVAnalysisResult from './CVAnalysisResult.jsx';

export function CVResult() {
    const location=useLocation();
    const analysisId=new URLSearchParams(location.search).get('analysisId');
    if(analysisId) return <MainLayout><CVAnalysisResult key={analysisId} analysisId={analysisId}/></MainLayout>;
    if(!location.state?.optimizationResult) return <main className="p-8 text-on-surface">Chưa có kết quả đánh giá. Hãy chọn CV và mô tả công việc để bắt đầu.</main>;
    return <OptimizationResult/>;
}

function OptimizationResult() {
    const location=useLocation();
    const navigate=useNavigate();
    const {cvData,setFullCVData,setCurrentCvId,setTemplate}=useCV();
    const optimizationResult=location.state?.optimizationResult;
    const [templateCatalog, setTemplateCatalog] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [templateError, setTemplateError] = useState('');
    const availableTemplates = useMemo(() => templateCatalog.filter(template =>
        template.locked === false && PDF_TEMPLATE_LOADERS[template.id]), [templateCatalog]);
    useEffect(()=>{
        const content=optimizationResult?.optimizedContent;
        if(content && typeof content==='object') {
            setFullCVData(mapImportedCVData(content));
            if(location.state?.cvId) setCurrentCvId(location.state.cvId);
        }
    },[optimizationResult,location.state?.cvId,setFullCVData,setCurrentCvId]);
    useEffect(() => {
        let active = true;
        galleryService.getTemplates()
            .then(templates => { if (active) setTemplateCatalog(Array.isArray(templates) ? templates : []); })
            .catch(() => { if (active) setTemplateError('Chưa tải được danh sách mẫu CV. Hãy thử tải lại trang.'); })
            .finally(() => { if (active) setTemplatesLoading(false); });
        return () => { active = false; };
    }, []);
    useEffect(() => {
        if (templatesLoading || !availableTemplates.length) return;
        if (!availableTemplates.some(template => template.id === cvData.selectedTemplateId)) {
            setTemplate(availableTemplates[0].id);
        }
    }, [availableTemplates, cvData.selectedTemplateId, setTemplate, templatesLoading]);
    const selectedTemplate = availableTemplates.find(template => template.id === cvData.selectedTemplateId);
    if (optimizationResult) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto px-6 py-12 text-on-surface">
                    <div className="flex items-center gap-3 mb-6">
                        <CheckCircle2 className="text-primary" size={32}/>
                        <div>
                            <h1 className="text-3xl font-bold">Đề xuất cải thiện CV</h1>
                            <p className="text-on-surface-variant">{location.state?.cvName || 'CV của bạn'}</p>
                        </div>
                    </div>
                    <div className="grid gap-5 md:grid-cols-[180px_1fr] mb-6">
                        <div className="rounded-2xl border border-outline-variant p-6 text-center">
                            <p className="text-sm text-on-surface-variant">Điểm sau khi cải thiện CV</p>
                            <p className="text-4xl font-bold text-primary">
                                {optimizationResult.postOptimizationScore ?? '—'}{optimizationResult.postOptimizationScore != null ? '/100' : ''}
                            </p>
                            <p className="mt-2 text-xs text-on-surface-variant">{typeof optimizationResult.scoreNote === 'string' ? optimizationResult.scoreNote.replace(/\bJD\b/gi, 'mô tả công việc').replace(/\brubric\b/gi, 'cách chấm điểm').replace(/minh chứng/gi, 'thông tin cụ thể').replace(/đối chiếu/gi, 'so sánh') : 'Điểm được tính lại dựa trên nội dung đã chỉnh sửa.'}</p>
                        </div>
                        <div className="rounded-2xl border border-outline-variant p-6">
                            <h2 className="font-bold mb-2">Tóm tắt cải thiện</h2>
                            <p>{optimizationResult.improvementSummary || 'Chưa có tóm tắt.'}</p>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-outline-variant p-6 mb-8">
                        <h2 className="font-bold mb-3">Các chỉnh sửa đã thực hiện</h2>
                        {optimizationResult.improvements?.length ? (
                            <div className="space-y-4">
                                {optimizationResult.improvements.map((item, index) => (
                                    <article key={`${index}-${item.sectionName}`} className="rounded-xl border border-outline-variant p-4">
                                        <h3 className="mb-3 font-bold">{formatOptimizationSectionName(item.sectionName, index)}</h3>
                                        <div className="grid gap-3 md:grid-cols-2">
                                            <div className="rounded-lg bg-surface-container p-3">
                                                <p className="mb-1 text-xs font-bold uppercase text-on-surface-variant">Trước</p>
                                                <p className="whitespace-pre-wrap break-words">{item.originalText || '—'}</p>
                                            </div>
                                            <div className="rounded-lg bg-primary-container/30 p-3">
                                                <p className="mb-1 text-xs font-bold uppercase text-on-surface-variant">Sau</p>
                                                <p className="whitespace-pre-wrap break-words">{item.suggestedText || '—'}</p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : <p className="text-on-surface-variant">Không có danh sách chỉnh sửa chi tiết từ phiên tối ưu này.</p>}
                    </div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                        <label className="flex items-center gap-3 font-semibold">
                            <span>Chọn template xem trước</span>
                            <select
                                aria-label="Chọn template xem trước"
                                value={selectedTemplate?.id || ''}
                                onChange={(event) => setTemplate(event.target.value)}
                                disabled={templatesLoading || availableTemplates.length === 0}
                                className="rounded-lg border border-outline-variant bg-surface px-3 py-2 disabled:opacity-60"
                            >
                                {availableTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                            </select>
                        </label>
                        <button onClick={() => navigate('/editor')} disabled={!selectedTemplate} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold disabled:cursor-not-allowed disabled:opacity-50">
                            Mở trình chỉnh sửa
                        </button>
                    </div>
                    {templateError && <p role="alert" className="mb-3 text-sm text-error">{templateError}</p>}
                    {!templatesLoading && !templateError && !availableTemplates.length && <p role="alert" className="mb-3 text-sm text-error">Gói hiện tại chưa mở khóa mẫu CV có thể xem trước.</p>}
                    {templatesLoading ? <p className="mb-3 text-sm text-on-surface-variant">Đang tải mẫu CV…</p> : null}
                    {optimizationResult.optimizedContent && typeof optimizationResult.optimizedContent === 'object' && selectedTemplate ? (
                        <div className="h-[72vh] overflow-hidden rounded-2xl border border-outline-variant bg-slate-200 p-3">
                            <CvPdfPreview cvData={cvData} templateId={selectedTemplate.id} className="h-full w-full bg-white" />
                        </div>
                    ) : optimizationResult.optimizedContent && typeof optimizationResult.optimizedContent === 'object' && !templatesLoading && availableTemplates.length > 0
                        ? <p role="alert" className="text-error">Không tìm thấy mẫu CV hợp lệ để xem trước.</p>
                        : !optimizationResult.optimizedContent || typeof optimizationResult.optimizedContent !== 'object'
                            ? <p role="alert" className="text-error">Kết quả tối ưu không đúng định dạng CV để xem trước.</p>
                            : null}
                </div>
            </MainLayout>
        );
    }


    return null;
}
