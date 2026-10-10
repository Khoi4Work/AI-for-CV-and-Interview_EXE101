import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {cvPipelineService} from '../services/cvPipelineService.js';
import {useCV} from '../contexts/CVContext.jsx';
import {mapImportedCVData} from '../mapper/cv-data-mapper.js';
import {pollAnalysis} from '../services/analysisFlow.js';
import Modal from '../../../components/ui/Modal.jsx';
import {formatJD, jdSourceLabel} from '../../../utils/jdContent.js';
import {getApiErrorMessage} from '../../../service/apiClient.js';
import {useInterviewSession} from '../../interview/hooks/useInterviewSession.js';
import {ArrowRight, ChevronDown, LoaderCircle, Sparkles} from 'lucide-react';

const assessments = {MET:'Có minh chứng', PARTIAL:'Minh chứng một phần', NOT_EVIDENCED:'Chưa có minh chứng trong CV', NOT_APPLICABLE:'Không áp dụng', UNCERTAIN:'Chưa đủ cơ sở'};
const assessmentStyles = {
    MET:'border-emerald-200 bg-emerald-50 text-emerald-800',
    PARTIAL:'border-amber-200 bg-amber-50 text-amber-900',
    NOT_EVIDENCED:'border-rose-200 bg-rose-50 text-rose-800',
    NOT_APPLICABLE:'border-slate-200 bg-slate-100 text-slate-700',
    UNCERTAIN:'border-sky-200 bg-sky-50 text-sky-800',
};
const breakdownStyles = {
    SKILLS:'border-l-emerald-500',
    EXPERIENCE:'border-l-blue-500',
    EDUCATION:'border-l-violet-500',
    CLARITY:'border-l-amber-500',
};
const groups = {SKILLS:'Kỹ năng theo JD', EXPERIENCE:'Kinh nghiệm và dự án', EDUCATION:'Học vấn/chứng chỉ', CLARITY:'Độ rõ ràng của CV'};
const formatCVText = value => String(value || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
export default function CVAnalysisResult({analysisId}) {
    const navigate = useNavigate();
    const {setFullCVData, setCurrentCvId} = useCV();
    const [analysis,setAnalysis] = useState(null);
    const [error,setError] = useState('');
    const [viewer,setViewer] = useState(null);
    const [alternatives,setAlternatives] = useState(null);
    const [alternativesError,setAlternativesError] = useState('');
    const [editing,setEditing] = useState(false);
    const [suggestedJD,setSuggestedJD] = useState(null);
    const [loadingJD,setLoadingJD] = useState(false);
    const [optimizing,setOptimizing] = useState(false);
    const [optimizationError,setOptimizationError] = useState('');
    const {update: updateInterviewSession} = useInterviewSession();
    useEffect(() => {
        const controller = new AbortController();
        pollAnalysis(cvPipelineService.getAnalysis, analysisId, {signal:controller.signal,onUpdate:setAnalysis})
            .catch(e => {if (!controller.signal.aborted) setError(getApiErrorMessage(e,'Không tải được kết quả.'));});
        return () => controller.abort();
    },[analysisId]);
    useEffect(() => {
        if (analysis?.status !== 'COMPLETED') return undefined;
        let active = true, timer;
        const update = async job => {
            if (!active) return;
            setAlternatives(job);
            if (job.status === 'PENDING') timer = setTimeout(async () => {
                try {await update(await cvPipelineService.getAlternatives(analysisId));}
                catch (e) {if (active) setAlternativesError(getApiErrorMessage(e,'Không tải được gợi ý.'));}
            },3000);
        };
        cvPipelineService.startAlternatives(analysisId).then(update)
            .catch(e => {if (active) setAlternativesError(getApiErrorMessage(e,'Không tải được gợi ý.'));});
        return () => {active=false;clearTimeout(timer);};
    },[analysis?.status,analysisId]);
    const editEvidence = async () => {
        setEditing(true);
        try {
            const current = await cvPipelineService.getCV(analysis.cvId);
            setFullCVData(mapImportedCVData(current.content)); setCurrentCvId(analysis.cvId);
            navigate('/editor',{state:{returnToCVEvaluation:true}});
        } catch(e) {setError(getApiErrorMessage(e,'Không tải được CV để bổ sung.'));}
        finally {setEditing(false);}
    };
    const optimizeCV = async () => {
        setOptimizing(true);
        setOptimizationError('');
        try {
            const job = await cvPipelineService.startOptimization(analysis.cvId, {jdId:analysis.snapshot.jdId});
            if (!job?.jobId) throw new Error('Không nhận được mã yêu cầu tối ưu CV.');
            navigate('/cv-analyzing', {state:{
                jobId:job.jobId,
                target:'/optimizer',
                cvId:analysis.cvId,
                cvName:analysis.snapshot.cvName,
            }});
        } catch (e) {
            setOptimizationError(getApiErrorMessage(e,'Không thể bắt đầu tối ưu CV.'));
        } finally {
            setOptimizing(false);
        }
    };
    const startInterview = () => {
        updateInterviewSession({
            cvId:analysis.cvId,
            interviewConfig:{
                type:'HR',
                language:'vi',
                duration:5,
                jd:analysis.snapshot.jdText,
                jdId:analysis.snapshot.jdId,
            },
        });
        navigate('/interview/experience-level');
    };
    const viewSuggestedJD = async id => {
        setLoadingJD(true);
        try {
            const candidate = await cvPipelineService.getAnalysis(id);
            setSuggestedJD(candidate.snapshot);
            setViewer('suggested-jd');
        } catch(e) {setAlternativesError(getApiErrorMessage(e,'Không tải được nội dung JD.'));}
        finally {setLoadingJD(false);}
    };
    if (!analysis) return <section className="p-8 text-on-surface" role="status">{error || 'Đang tải kết quả đánh giá...'}</section>;
    if (analysis.status !== 'COMPLETED') return <section className="mx-auto max-w-3xl p-8 text-on-surface">
        <h1 className="text-2xl font-bold">{['FAILED','INSUFFICIENT_EVIDENCE'].includes(analysis.status)?'Chưa có kết quả đánh giá':'Đang đối chiếu CV với JD'}</h1>
        <p className="mt-4">{analysis.error || 'Đang kiểm tra dữ liệu và minh chứng. Bạn có thể mở lại trang này.'}</p>
        <button className="mt-6 rounded-xl bg-primary px-5 py-3 text-on-primary" onClick={()=>navigate('/cv-evaluation',{state:{continueEvaluation:{cv:{cvId:analysis.cvId,cvName:analysis.snapshot.cvName,extractedData:analysis.snapshot.cv},jdText:analysis.snapshot.jdText}}})}>Quay lại CV và JD</button>
    </section>;
    const {snapshot,result} = analysis;
    const color = result.score >= 80 ? '#059669' : result.score >= 60 ? '#b45309' : '#dc2626';
    const feedbackGroups = Object.entries(groups).map(([key,title])=>({
        key,
        title,
        items:result.contributions.filter(({evidence})=>evidence.group===key&&evidence.assessment!=='MET'),
    })).filter(group=>group.items.length);
    return <section className="mx-auto max-w-6xl space-y-8 px-4 py-8 text-on-surface">
        <header><h1 className="text-3xl font-bold">Kết quả đánh giá CV–JD</h1>
            <p className="mt-2">{snapshot.cvName} · {snapshot.jdTitle} {snapshot.companyName && `· ${snapshot.companyName}`}</p>
            <p className="text-sm text-on-surface-variant">{jdSourceLabel(snapshot.source)} · {new Date(analysis.createdAt).toLocaleString('vi-VN')}</p>
            {snapshot.sourceUrl && <a className="text-primary underline" href={snapshot.sourceUrl} target="_blank" rel="noreferrer">Nguồn JD</a>}
            {snapshot.referenceDate && <p className="text-sm">Ngày tham khảo: {snapshot.referenceDate}</p>}
        </header>
        {error && <p role="alert">{error}</p>}
        <section className="rounded-2xl border border-outline-variant bg-surface-container p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:flex-wrap sm:gap-8">
                <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-2 border-outline-variant p-3" style={{background:`conic-gradient(${color} ${result.score*3.6}deg, #e2e8f0 0deg)`}}>
                    <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-surface px-1 text-center text-on-surface"><strong className="whitespace-nowrap text-[26px] leading-none tracking-tight">{result.score}/100</strong><span className="mt-1 max-w-full text-[11px] leading-tight">Điểm đánh giá CV–JD</span></div>
                </div>
                <div className="w-full flex-1 sm:w-auto"><p>{result.summary}</p>
                    <button onClick={()=>setViewer('evidence')} className="mt-4 rounded-xl bg-primary px-4 py-2 font-semibold text-on-primary">Xem cách tính và minh chứng</button>
                    <div className="mt-3 flex flex-wrap gap-3"><button className="rounded-lg border border-outline-variant px-4 py-2" onClick={()=>setViewer('cv')}>Xem CV đã đánh giá</button><button className="rounded-lg border border-outline-variant px-4 py-2" onClick={()=>setViewer('jd')}>Xem JD đã chọn</button></div>
                </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-outline-variant pt-5">
                <button onClick={optimizeCV} disabled={optimizing} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-on-primary disabled:cursor-wait disabled:opacity-60">
                    {optimizing?<LoaderCircle className="h-4 w-4 animate-spin"/>:<Sparkles className="h-4 w-4"/>}
                    {optimizing?'Đang gửi yêu cầu…':'Tối ưu CV với JD này'}
                </button>
                <button onClick={startInterview} className="inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 font-semibold text-on-surface hover:bg-surface-container-high">
                    Luyện phỏng vấn với JD này <ArrowRight className="h-4 w-4"/>
                </button>
                <p className="basis-full text-sm text-on-surface-variant">Tối ưu CV cần gói Enhance và sử dụng lượt tối ưu theo quota hiện tại.</p>
                {optimizationError&&<p className="basis-full text-sm text-error" role="alert">{optimizationError}</p>}
            </div>
        </section>
        <section className="grid gap-6 md:grid-cols-2">
            {[['Kỹ năng có minh chứng',result.evidencedSkills],['Kỹ năng cần bổ sung minh chứng',result.notEvidencedSkills]].map(([title,skills])=><div key={title}>
                <h2 className="mb-3 text-lg font-bold">{title}</h2>
                <ul className="max-h-80 space-y-3 overflow-y-auto rounded-xl border border-outline-variant bg-surface-container p-3 custom-scrollbar">
                    {skills.length?skills.map(skill=><li key={skill} className="rounded-lg border border-outline-variant bg-surface p-3">{skill}</li>):<li>Không có mục trong nhóm này.</li>}
                </ul></div>)}
        </section>
        <section className="space-y-4 rounded-2xl border border-outline-variant bg-surface-container p-5 sm:p-6">
            <div>
                <h2 className="text-lg font-bold">Nhận xét và gợi ý theo minh chứng</h2>
                <p className="mt-1 text-sm text-on-surface-variant">Các mục dưới đây cần bổ sung thông tin hoặc làm rõ trong CV để thể hiện năng lực sát với JD hơn.</p>
            </div>
            {feedbackGroups.length ? <div className="space-y-3">
                {feedbackGroups.map((group,index)=><details key={group.key} open={index===0} className="group overflow-hidden rounded-xl border border-outline-variant bg-surface">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                        <span>{group.title}</span>
                        <span className="flex shrink-0 items-center gap-2"><span className="inline-flex items-center rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-on-surface-variant">{group.items.length} {group.items.length===1?'mục':'mục'} cần xem</span><ChevronDown className="h-4 w-4 text-on-surface-variant transition-transform group-open:rotate-180" aria-hidden="true"/></span>
                    </summary>
                    <ul className="space-y-3 border-t border-outline-variant p-3 sm:p-4">
                        {group.items.map(({evidence:e})=><li key={e.requirementId} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                            <p className="leading-6">{e.reason}</p>
                            {e.suggestion&&<div className="mt-3 rounded-lg border-l-4 border-primary bg-primary-container/40 px-3 py-2.5 text-sm leading-6 text-on-surface">
                                <span className="font-semibold">Gợi ý cải thiện</span>
                                <p className="mt-1">{e.suggestion}</p>
                            </div>}
                        </li>)}
                    </ul>
                </details>)}
            </div> : <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">CV đã có minh chứng cho các tiêu chí được đối chiếu.</p>}
        </section>
        <section className="rounded-xl border border-outline-variant bg-surface-container p-5">
            <h2 className="text-lg font-bold">Bổ sung minh chứng thực tế</h2><p className="mt-2">Sửa kinh nghiệm, dự án hoặc kỹ năng bạn thực sự có. Kết quả này vẫn thuộc bản CV đã đánh giá; chỉ lần đánh giá bản CV mới mới cập nhật điểm và sử dụng lượt nếu chưa có kết quả lưu.</p>
            <button disabled={editing} onClick={editEvidence} className="mt-4 rounded-xl bg-primary px-4 py-2 font-semibold text-on-primary">{editing?'Đang mở CV...':'Bổ sung minh chứng'}</button>
        </section>
        <section><h2 className="text-xl font-bold">JD vị trí khác có điểm đánh giá cao hơn</h2>
            {alternativesError ? <p role="alert" className="mt-3">{alternativesError}</p> : !alternatives || alternatives.status==='PENDING'?<p className="mt-3">Đang đánh giá các JD vị trí khác...</p>:alternatives.status==='FAILED'?<p role="alert" className="mt-3">Không thể hoàn tất đánh giá JD vị trí khác.</p>:alternatives.status==='INSUFFICIENT_EVIDENCE'?<p className="mt-3">Chưa đủ cơ sở để so sánh vị trí khác từ kết quả này.</p>:!alternatives.items.length?<p className="mt-3">Không tìm thấy JD vị trí khác có điểm cao hơn trong những JD đã đánh giá.</p>:<div className="mt-4 grid gap-4 md:grid-cols-2">{alternatives.items.map(item=><article key={item.analysisId} className="rounded-xl border border-outline-variant bg-surface-container p-5"><h3 className="font-bold">{item.title}</h3><p>{item.companyName}</p><p className="text-sm">{jdSourceLabel(item.source)}</p><p className="mt-3">{item.reason}</p><button disabled={loadingJD} onClick={()=>viewSuggestedJD(item.analysisId)} className="mt-4 mr-3 rounded-xl border border-outline-variant px-4 py-2">Xem JD</button><button onClick={()=>navigate(`/optimizer?analysisId=${item.analysisId}`)} className="mt-4 rounded-xl bg-primary px-4 py-2 font-semibold text-on-primary">Xem đánh giá với JD này</button></article>)}</div>}
            {alternatives?.failedCount > 0 && <p className="mt-3 text-sm" role="status">Có {alternatives.failedCount} JD chưa đánh giá được. Kết quả gợi ý hiện chỉ dựa trên các JD đã đánh giá thành công.</p>}
        </section>
        <Modal solid isOpen={Boolean(viewer)} onClose={()=>setViewer(null)} title={viewer==='evidence'?'Cách tính và minh chứng':viewer==='cv'?'CV đã đánh giá':viewer==='suggested-jd'?suggestedJD?.jdTitle:'JD đã chọn'} size={viewer==='evidence'||viewer==='cv'||viewer==='jd'||viewer==='suggested-jd'?'wide':'default'} resizable={viewer==='evidence'}>
            {viewer==='suggested-jd'&&<div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{formatJD(suggestedJD?.jdText)}</div>}
            {viewer==='jd'&&<div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{formatJD(snapshot.jdText)}</div>}
            {viewer==='cv'&&<div className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-800">{formatCVText(snapshot.cvText)}</div>}
            {viewer==='evidence'&&<div className="space-y-5 text-slate-800">
                <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="font-bold text-slate-900">Điểm đánh giá đang đo điều gì?</h4>
                    <p className="mt-2 text-sm leading-6">Điểm {result.score}/100 thể hiện mức độ CV có minh chứng đáp ứng các yêu cầu trong JD bạn đã chọn. Hệ thống xét từng yêu cầu, tìm nội dung liên quan trong CV rồi đánh giá mức minh chứng. Yêu cầu không có trong JD sẽ không được tính vào điểm.</p>
                    <p className="mt-2 text-sm leading-6"><strong>Có minh chứng</strong>: CV nêu thông tin hỗ trợ yêu cầu. <strong>Minh chứng một phần</strong>: có liên quan nhưng còn thiếu chi tiết. <strong>Chưa có minh chứng</strong>: chưa tìm thấy thông tin trong CV; điều này không khẳng định bạn không có kỹ năng đó.</p>
                </section>
                <section>
                    <h4 className="mb-2 font-bold text-slate-900">Các nhóm đóng góp vào điểm tổng</h4>
                    <p className="mb-3 text-sm leading-6">“Điểm đóng góp” là số điểm nhóm đó cộng vào tổng điểm trên 100. “Tỷ trọng” cho biết phần điểm nhóm được áp dụng trong lần đánh giá này; nhóm không có tiêu chí phù hợp sẽ bị loại khỏi phép tính.</p>
                    <div className="grid gap-3 sm:grid-cols-2">{result.breakdown.map(group=><div key={group.group} className={`rounded-lg border border-slate-200 border-l-4 ${breakdownStyles[group.group]||'border-l-slate-400'} bg-white p-3 text-sm`}><strong>{groups[group.group]}</strong><p className="mt-1 text-slate-600">Đóng góp <span className="font-semibold tabular-nums text-slate-900">{Number(group.points).toFixed(2)} điểm</span><span aria-hidden="true"> · </span>Tỷ trọng {Number(group.weight).toFixed(2)}%</p></div>)}</div>
                </section>
                <section>
                    <h4 className="mb-2 font-bold text-slate-900">Đối chiếu theo từng yêu cầu</h4>
                    <div className="max-h-[55vh] overflow-auto rounded-lg border border-slate-200">
                        <table className="w-full min-w-[1200px] table-fixed text-left text-sm leading-5">
                            <colgroup><col className="w-[18%]"/><col className="w-[18%]"/><col className="w-[20%]"/><col className="w-[34%]"/><col className="w-[10%]"/></colgroup>
                            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-900"><tr>{['Yêu cầu / tiêu chí','Trích đoạn JD','Minh chứng CV','Đối chiếu và gợi ý','Điểm đóng góp'].map(h=><th key={h} className="border-b border-slate-200 p-3 align-top">{h}</th>)}</tr></thead>
                            <tbody>{result.contributions.map(({evidence:e,points})=><tr key={e.requirementId} className="odd:bg-white even:bg-slate-50 hover:bg-sky-50/60">
                                <td className="border-b border-slate-200 p-3 align-top [overflow-wrap:anywhere]">{e.description}{e.mandatory&&<span className="mt-2 inline-flex max-w-full items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold leading-4 text-rose-800">Bắt buộc</span>}</td>
                                <td className="border-b border-slate-200 p-3 align-top [overflow-wrap:anywhere]"><div className="max-h-36 overflow-auto whitespace-pre-wrap">{e.jdEvidence?.text||'Checklist nội dung CV'}</div></td>
                                <td className="border-b border-slate-200 p-3 align-top [overflow-wrap:anywhere]"><div className="max-h-36 overflow-auto whitespace-pre-wrap">{e.cvEvidence?.map(q=>q.text).join('\n\n')||'Chưa có minh chứng trong CV'}</div></td>
                                <td className="border-b border-slate-200 p-3 align-top [overflow-wrap:anywhere]"><span className={`inline-flex max-w-full rounded-full border px-2.5 py-1 text-xs font-bold leading-4 ${assessmentStyles[e.assessment]||assessmentStyles.UNCERTAIN}`}>{assessments[e.assessment]||assessments.UNCERTAIN}</span><p className="mt-2">{e.reason}</p>{e.suggestion&&<p className="mt-2 text-slate-600">Gợi ý: {e.suggestion}</p>}</td>
                                <td className="border-b border-slate-200 p-3 align-top"><span className="inline-flex max-w-full whitespace-nowrap rounded-lg border border-slate-200 bg-slate-100 px-2 py-1 font-semibold tabular-nums text-slate-800">{Number(points).toFixed(2)} điểm</span></td>
                            </tr>)}</tbody>
                        </table>
                    </div>
                </section>
                <p className="text-xs text-slate-500">Bản tính: {analysis.rubricVersion}. Kết quả dựa trên nội dung CV và JD được lưu tại thời điểm đánh giá.</p>
            </div>}
        </Modal>
    </section>;
}
