import { useEffect, useState } from 'react';
import { Sparkles, FileText, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { MainLayout } from '../../interview/components/MainLayout.jsx';
import { useNavigate, useLocation } from "react-router-dom";
import { cvEvaluations } from '../constants/cv-evaluation.js';
import { cvPipelineService } from '../services/cvPipelineService.js';
import { useCV } from '../contexts/CVContext.jsx';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { mapCVDataToTemplate, mapImportedCVData } from '../mapper/cv-data-mapper.js';
import TemplateRenderer from '../components/TemplateRenderer.jsx';
import { TEMPLATES_DATA } from '../constants/templates.js';
import { paymentService } from '../../../services/paymentService.js';

export function CVResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cvData, setFullCVData, setCurrentCvId, setTemplate } = useCV();
    const { showToast } = useApp();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeSkillIndex, setActiveSkillIndex] = useState(null);
    const [addedSkills, setAddedSkills] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const optimizationResult = location.state?.optimizationResult;
    const evaluationResult = location.state?.evaluationResult;
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [cvPlan, setCvPlan] = useState(null);

    useEffect(() => {
        let active = true;
        paymentService.getCurrentQuota()
            .then((quota) => { if (active) setCvPlan(quota?.cvPlan || null); })
            .catch(() => {});
        return () => { active = false; };
    }, []);

    useEffect(() => {
        const content = optimizationResult?.optimizedContent;
        if (content && typeof content === 'object') {
            setFullCVData(mapImportedCVData(content));
            if (location.state?.cvId) setCurrentCvId(location.state.cvId);
        }
    }, [optimizationResult, location.state?.cvId, setFullCVData, setCurrentCvId]);

    const handleOptimizeEvaluatedCV = async () => {
        const { cvId, jdText, cvName } = location.state || {};
        if (!cvId || !jdText) {
            showToast('Không tìm thấy CV hoặc JD của phiên đánh giá. Hãy đánh giá lại CV để tối ưu.', 'error');
            return;
        }
        setIsOptimizing(true);
        try {
            const job = await cvPipelineService.startOptimization(cvId, { jdText });
            if (!job?.jobId) throw new Error('API không trả về mã tác vụ tối ưu.');
            navigate('/cv-analyzing', {
                state: { target: '/optimizer', jobId: job.jobId, cvId, cvName, jdText },
            });
        } catch (error) {
            showToast(getApiErrorMessage(error, 'Không thể tối ưu CV.'), 'error');
        } finally {
            setIsOptimizing(false);
        }
    };

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

    const scenario = location.state?.scenario || 'default';
    const cvNameFromState = location.state?.cvName || 'My_CV.pdf';
    const apiAnalysis = evaluationResult?.analysis || {};
    const apiSkillGap = location.state?.skillGap || {};
    const apiFeedback = location.state?.feedback?.feedback || {};
    const apiSections = Array.isArray(apiFeedback.sectionAnalysis) ? apiFeedback.sectionAnalysis : [];
    const sectionNameVi = (name) => {
        const normalized = String(name || '').trim().toLowerCase();
        if (normalized.includes('professional summary') || normalized.includes('summary')) return 'Tóm tắt chuyên môn';
        if (normalized.includes('work experience') || normalized.includes('experience')) return 'Kinh nghiệm làm việc';
        if (normalized.includes('skill')) return 'Kỹ năng';
        if (normalized.includes('education')) return 'Học vấn';
        if (normalized.includes('project')) return 'Dự án';
        if (normalized.includes('certificate')) return 'Chứng chỉ';
        return name || 'Gợi ý khác';
    };
    const apiData = evaluationResult ? {
        jd: {
            title: 'Mô tả công việc',
            description: {overview: location.state?.jdText || '', details: []},
        },
        analysis: {
            matchingScore: evaluationResult.score ?? 0,
            status: (evaluationResult.score ?? 0) >= 80 ? 'CV phù hợp với vị trí' : (evaluationResult.score ?? 0) >= 50 ? 'Có một số điểm cần cải thiện' : 'Cần cải thiện',
            statusLabel: (evaluationResult.score ?? 0) >= 80 ? 'Phù hợp' : (evaluationResult.score ?? 0) >= 50 ? 'Khá phù hợp' : 'Chưa phù hợp',
            overallFeedback: [
                ...(apiAnalysis.strengths || []).slice(0, 2),
                ...(apiAnalysis.weaknesses || []).slice(0, 2),
            ].join(' '),
            gapAnalysis: {
                matchedSkills: (apiSkillGap.matchingSkills || []).map(name => ({name, level: 'Khớp'})),
                missingSkills: (apiSkillGap.missingSkills || []).map(name => ({name, level: 'Thiếu'})),
            },
            atsOptimization: apiAnalysis.suggestions || [],
            aiSuggestions: {
                professionalSummary: (apiFeedback.swot?.opportunities || []).join(' ') || (apiAnalysis.strengths || []).join(' '),
                workExperience: apiSections.map(section => `${sectionNameVi(section.sectionName)}: ${(section.suggestions || []).join(' ')}`).join('\n'),
            },
        },
    } : null;
    const evalData = apiData || cvEvaluations[scenario];

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

            {evaluationResult && cvPlan && (
                <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-bold">Kết quả đánh giá dùng cùng tiêu chí ở mọi gói.</p>
                        <p className="mt-1 text-sm">
                            Các gói khác nhau về mức độ chi tiết của phần giải thích. Tối ưu nội dung CV tự động cần gói ENHANCE.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate('/pricing')}
                        className="shrink-0 rounded-lg bg-amber-900 px-4 py-2 text-sm font-bold text-white hover:bg-amber-800"
                    >
                        Xem các gói CV
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left & Middle Flow (Col 1 Span 2) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Top Row: Documents */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-cv-result-card-bg rounded-xl border border-primary-container shadow-sm p-5 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-cv-result-card-text font-semibold mb-1">
                                    <UserIcon /> CV của bạn
                                </div>
                                <button
                                    onClick={() => navigate('/cv-evaluation')}
                                    className="text-primary text-xs font-semibold hover:underline"
                                >
                                    Thay đổi
                                </button>
                            </div>

                            <div className="h-32 border-2 border-dashed border-outline-variant rounded-lg bg-cv-result-inner-bg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-primary-container transition-colors">
                                <FileText size={28} className="text-outline mb-2" />
                                <p className="text-sm font-medium text-cv-result-inner-text truncate px-4 w-full">
                                    {cvNameFromState}
                                </p>
                                <p className="text-xs text-cv-result-inner-text">Đã phân tích bởi AI</p>
                            </div>
                        </div>

                        <div className="bg-cv-result-card-bg rounded-xl border border-outline-variant shadow-sm p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2 text-cv-result-card-text font-semibold mb-1">
                                    <BriefcaseIcon /> Mô tả công việc (JD)
                                </div>
                                <button
                                    onClick={() => navigate('/cv-evaluation')}
                                    className="text-primary text-xs font-semibold hover:underline"
                                >
                                    Dán JD mới
                                </button>
                            </div>

                            <div className="h-32 bg-cv-result-inner-bg rounded-lg p-3 text-sm text-cv-result-inner-text overflow-y-auto custom-scrollbar border border-outline-variant">
                                <p className="font-semibold text-cv-result-inner-text mb-1">{jd.title}</p>
                                <p className="leading-relaxed">
                                    {jd.description.overview} {jd.description.details.map(d => ` ${d.title}: ${d.bullets.join(', ')}`).join('. ')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Gap Analysis */}
                    <div className="bg-cv-result-card-bg rounded-xl border border-outline-variant shadow-sm p-6">
                        <div className="flex items-center justify-start gap-2 text-cv-result-card-text font-semibold mb-5 text-lg">
                            <div className="shrink-0"><ChartIcon /></div><span className="leading-none">Phân tích khoảng cách kỹ năng</span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-black">
                            <div>
                                <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">KỸ NĂNG HIỆN CÓ</h4>
                                <ul className="space-y-3">
                                    {analysis.gapAnalysis.matchedSkills.map((skill, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-cv-result-matched-bg border border-outline-variant rounded-lg px-3 py-2">
                                            <span className="flex items-center gap-2 text-sm font-medium text-cv-result-skill-name"><CheckCircle2 size={16} className="text-cv-result-matched-text" /> {skill.name}</span>
                                            <span className="text-[10px] uppercase font-bold bg-cv-result-matched-badge-bg text-cv-result-matched-text px-1.5 py-0.5 rounded">{skill.level}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-4">KỸ NĂNG CÒN THIẾU</h4>
                                <ul className="space-y-3">
                                    {analysis.gapAnalysis.missingSkills.map((skill, idx) => (
                                        <li key={idx} className="flex justify-between items-center bg-cv-result-missing-bg border border-outline-variant rounded-lg px-3 py-2">
                                            <span className={`flex items-center gap-2 text-sm font-medium ${addedSkills.includes(idx) ? 'text-cv-result-added-skill' : 'text-black'}`}>
                                                <AlertCircle size={16} className={addedSkills.includes(idx) ? 'text-cv-result-added-icon' : 'text-cv-result-missing-text'} />
                                                {skill.name}
                                            </span>
                                            {addedSkills.includes(idx) ? (
                                                <span className="flex items-center gap-1 text-[10px] uppercase font-bold bg-primary-container text-cv-result-added-text px-2 py-1 rounded border border-primary-container">
                                                    <CheckCircle2 size={10} className="text-cv-result-added-icon" /> Đã thêm
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => openModal(idx)}
                                                    className="flex items-center gap-1 text-[10px] uppercase font-bold bg-cv-result-add-bg hover:opacity-90 text-cv-result-add-text px-2 py-1 rounded transition-colors"
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
                    <div className="bg-cv-result-card-bg rounded-xl border border-outline-variant shadow-sm p-6">
                        <div className="flex items-center justify-start gap-2 text-cv-result-card-text font-semibold mb-2 text-lg">
                            <div className="shrink-0"><SettingsIcon /></div><span className="leading-none">{evaluationResult ? 'Đề xuất cải thiện CV' : 'Tối ưu hóa ATS'}</span>
                        </div>
                        <p className="text-sm text-black italic mb-4">{evaluationResult ? 'Các đề xuất được tạo từ kết quả phân tích CV và JD:' : 'Thêm các "Power Words" sau vào phần mô tả kinh nghiệm để tăng thứ hạng lọc hồ sơ:'}</p>
                        <div className="flex flex-wrap gap-2">
                            {analysis.atsOptimization.map((phrase, idx) => (
                                <span key={idx} className="px-3 py-1.5 border-[1px] border-cv-result-ats-tag-border bg-cv-result-ats-tag-bg text-cv-result-ats-tag-text rounded-full text-sm font-semibold">
                                    {phrase}
                                </span>
                            ))}
                            {evaluationResult && analysis.atsOptimization.length === 0 && (
                                <p className="text-sm text-black/60">Chưa có đề xuất cho CV và JD này.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Column (Widget) */}
                <div className="space-y-6">

                    {/* Score Card */}
                    <div className="rounded-xl border border-outline-variant shadow-sm p-6 flex flex-col items-center text-center"
                         style={{ background: `linear-gradient(to bottom, var(--color-cv-result-score-gradient-start), var(--color-cv-result-score-gradient-end))` }}>
                        <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="transparent" stroke="#B91C1C" strokeWidth="10" />
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
                                <span className="text-3xl font-display font-bold text-black leading-none">{score}%</span>
                                <span className="text-[10px] font-bold text-primary mt-1 uppercase tracking-wider">Matching</span>
                            </div>
                        </div>

                        <div className={`inline-block px-3 py-1 font-semibold text-xs rounded-full mb-3 border ${
                            score >= 80 ? 'bg-primary-container text-primary border-primary-container' :
                            score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                            <span className="text-red-500">{analysis.statusLabel}</span>
                        </div>
                        <h3 className="text-lg font-bold text-black mb-2">{analysis.status}</h3>
                        <p className="text-sm text-black/70 mb-6">{analysis.overallFeedback}</p>
                        {evaluationResult && Number.isInteger(evaluationResult.cvAiAnalysisLimit) && (
                            <p className="w-full mb-4 rounded-lg bg-white/60 px-3 py-2 text-xs text-slate-700">
                                CV này còn {evaluationResult.cvAiAnalysisRemaining ?? 0}/{evaluationResult.cvAiAnalysisLimit} lượt phân tích AI.
                                {evaluationResult.cvAiAnalysisRemaining === 0 && ' Bạn vẫn có thể xem kết quả cũ và tải CV.'}
                            </p>
                        )}

                        <div className="w-full space-y-3">
                            {evaluationResult && cvPlan !== 'ENHANCE' ? (
                                <button
                                    type="button"
                                    onClick={() => navigate('/pricing')}
                                    className="w-full rounded-lg bg-cv-result-score-btn-ai-bg py-2 text-sm font-bold text-white transition-all hover:opacity-90"
                                >
                                    Mở gói ENHANCE để tối ưu CV
                                </button>
                            ) : (
                                <button
                                    onClick={handleOptimizeEvaluatedCV}
                                    disabled={isOptimizing}
                                    className="w-full py-2 bg-cv-result-score-btn-ai-bg text-white rounded-lg font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                                >
                                    {isOptimizing ? 'Đang bắt đầu tối ưu...' : 'Tối ưu CV với AI'}
                                </button>
                            )}
                            <button
                                onClick={() => navigate('/interview/job-selection')}
                                className="w-full py-2 bg-cv-result-score-btn-int-bg text-white rounded-lg font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                            >
                                Bắt đầu phỏng vấn thử
                            </button>
                        </div>
                    </div>

                    {/* AI Callout */}
                    <div className="bg-cv-result-card-bg rounded-xl border border-outline-variant p-5 relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 text-primary/20" size={32} />
                        <div className="flex items-center gap-2 text-cv-result-card-text font-bold mb-4">
                            <Sparkles size={18} /><span>Gợi ý từ AI</span>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <div>
                                <h5 className="text-sm font-semibold text-cv-result-card-text mb-1">Tóm tắt chuyên môn</h5>
                                <p className="text-sm text-cv-result-ai-desc leading-relaxed">
                                    {analysis.aiSuggestions.professionalSummary}
                                </p>
                            </div>
                            <div>
                                <h5 className="text-sm font-semibold text-cv-result-card-text mb-1">Kinh nghiệm làm việc</h5>
                                <p className="text-sm text-cv-result-ai-desc leading-relaxed">
                                    {analysis.aiSuggestions.workExperience}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for adding skill */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-cv-result-card-bg rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-outline-variant animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-outline-variant">
                            <h3 className="text-lg font-bold text-cv-result-card-text">Thêm kỹ năng</h3>
                            <button onClick={closeModal} className="p-1 rounded-full hover:bg-surface-container-low text-outline hover:text-on-surface transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-cv-result-card-text mb-2">Nhập mô tả kỹ năng</label>
                                <textarea
                                    className="w-full px-3 py-2 text-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all min-h-[100px] bg-cv-result-inner-bg text-black"
                                    placeholder="Ví dụ: Có kinh nghiệm 2 năm làm việc với React và Tailwind CSS..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-semibold text-cv-result-card-text mb-2">Hoặc tải lên chứng chỉ/tài liệu</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-outline-variant border-dashed rounded-lg cursor-pointer bg-cv-result-inner-bg hover:bg-primary-container/20 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <FileText className="text-outline mb-2" size={24} />
                                            <p className="text-xs text-black/60">Nhấn để chọn file</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleFileUpload} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-5 bg-cv-result-inner-bg border-t border-outline-variant">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleAddSkill}
                                disabled={!inputValue}
                                className="px-4 py-2 text-sm font-bold text-white bg-cv-result-score-btn-int-bg rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
function ChartIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/></svg>; }
function SettingsIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>; }
