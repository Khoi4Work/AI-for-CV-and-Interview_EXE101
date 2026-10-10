import {useEffect} from 'react';
import {CheckCircle2} from 'lucide-react';
import {MainLayout} from '../../interview/components/MainLayout.jsx';
import {useNavigate,useLocation} from 'react-router-dom';
import {useCV} from '../contexts/CVContext.jsx';
import {mapCVDataToTemplate,mapImportedCVData} from '../mapper/cv-data-mapper.js';
import TemplateRenderer from '../components/TemplateRenderer.jsx';
import {TEMPLATES_DATA} from '../constants/templates.js';
import CVAnalysisResult from './CVAnalysisResult.jsx';

export function CVResult() {
    const location=useLocation();
    const analysisId=new URLSearchParams(location.search).get('analysisId');
    if(analysisId) return <MainLayout><CVAnalysisResult key={analysisId} analysisId={analysisId}/></MainLayout>;
    if(!location.state?.optimizationResult) return <main className="p-8 text-on-surface">Chưa có kết quả đánh giá. Hãy chọn CV và JD để bắt đầu.</main>;
    return <OptimizationResult/>;
}

function OptimizationResult() {
    const location=useLocation();
    const navigate=useNavigate();
    const {cvData,setFullCVData,setCurrentCvId,setTemplate}=useCV();
    const optimizationResult=location.state?.optimizationResult;
    useEffect(()=>{
        const content=optimizationResult?.optimizedContent;
        if(content && typeof content==='object') {
            setFullCVData(mapImportedCVData(content));
            if(location.state?.cvId) setCurrentCvId(location.state.cvId);
        }
    },[optimizationResult,location.state?.cvId,setFullCVData,setCurrentCvId]);
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
                            <p className="text-sm text-on-surface-variant">Điểm dự kiến</p>
                            <p className="text-4xl font-bold text-primary">{optimizationResult.predictedScore ?? '—'}</p>
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
                                        <h3 className="mb-3 font-bold">{item.sectionName || `Chỉnh sửa ${index + 1}`}</h3>
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
                                value={cvData.selectedTemplateId || 'boardroom-ready'}
                                onChange={(event) => setTemplate(event.target.value)}
                                className="rounded-lg border border-outline-variant bg-surface px-3 py-2"
                            >
                                {TEMPLATES_DATA.map((template) => <option key={template.id} value={template.id}>{template.title}</option>)}
                            </select>
                        </label>
                        <button onClick={() => navigate('/editor')} className="px-6 py-3 rounded-xl bg-primary text-on-primary font-bold">
                            Mở trình chỉnh sửa
                        </button>
                    </div>
                    {optimizationResult.optimizedContent && typeof optimizationResult.optimizedContent === 'object' ? (
                        <div className="overflow-auto rounded-2xl border border-outline-variant bg-white p-3">
                            <div className="mx-auto min-w-[700px] max-w-[1000px]">
                                <TemplateRenderer
                                    templateId={cvData.selectedTemplateId || 'boardroom-ready'}
                                    userData={mapCVDataToTemplate(cvData)}
                                />
                            </div>
                        </div>
                    ) : <p role="alert" className="text-error">Kết quả tối ưu không đúng định dạng CV để xem trước.</p>}
                </div>
            </MainLayout>
        );
    }


    return null;
}
