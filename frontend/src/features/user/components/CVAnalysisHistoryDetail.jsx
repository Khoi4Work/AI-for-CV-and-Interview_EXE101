import { useEffect, useState } from 'react';
import { cvPipelineService } from '../../cv/services/cvPipelineService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { Button } from './Layout.jsx';
import SavedCVPreview from './SavedCVPreview.jsx';

const groups = { SKILLS: 'Kỹ năng', EXPERIENCE: 'Kinh nghiệm và dự án', EDUCATION: 'Học vấn/chứng chỉ', CLARITY: 'Độ rõ ràng' };
const assessments = { MET: 'Đã đáp ứng', PARTIAL: 'Đáp ứng một phần', NOT_EVIDENCED: 'Chưa có thông tin trong CV',
    NOT_APPLICABLE: 'Không áp dụng', UNCERTAIN: 'Chưa đủ thông tin' };

export default function CVAnalysisHistoryDetail({ analysisId }) {
    const [state, setState] = useState({ loading: true, detail: null, error: '' });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        cvPipelineService.getAnalysis(analysisId, controller.signal).then(detail => {
            if (active) setState({ loading: false, detail, error: '' });
        }).catch(error => {
            if (active) setState({ loading: false, detail: null, error: getApiErrorMessage(error) });
        });
        return () => { active = false; controller.abort(); };
    }, [analysisId, revision]);
    if (state.loading) return <p role="status" className="py-6 text-slate-500">Đang tải kết quả đánh giá AI...</p>;
    if (state.error) return <div role="alert" className="space-y-3 text-red-600"><p>{state.error}</p><Button onClick={() => {
        setState({ loading: true, detail: null, error: '' }); setRevision(previous => previous + 1);
    }}>Thử lại</Button></div>;
    const { snapshot, result, status } = state.detail || {};
    return <div className="space-y-5 text-sm">
        <p className="rounded-xl bg-slate-100 p-3 text-slate-600">Kết quả đã lưu tại thời điểm đánh giá. Xem lại không trừ lượt phân tích AI.</p>
        {snapshot && <div><h3 className="font-semibold text-slate-900">{snapshot.cvName || 'CV chưa đặt tên'}</h3>
            <p>{[snapshot.jdTitle, snapshot.companyName].filter(Boolean).join(' · ')}</p></div>}
        {(snapshot?.cv || snapshot?.cvText) && <section className="space-y-3">
            <h3 className="font-semibold text-slate-900">CV tại thời điểm đánh giá</h3>
            <SavedCVPreview cv={{ content: { ...snapshot.cv, sourceText: snapshot.cv?.sourceText || snapshot.cvText || '' } }} />
        </section>}
        {status === 'INSUFFICIENT_EVIDENCE' && <p className="rounded-xl bg-amber-50 p-3 text-amber-900">CV/JD chưa có đủ thông tin để đánh giá đầy đủ.</p>}
        {!result ? <p>Chưa có kết quả chi tiết được lưu cho lần đánh giá này.</p> : <>
            {result.score != null && <p className="text-2xl font-bold text-emerald-700">{result.score}/100 điểm</p>}
            {result.summary && <p className="whitespace-pre-wrap rounded-xl bg-emerald-50 p-4 text-emerald-900">{result.summary}</p>}
            {!!result.breakdown?.length && <section><h3 className="mb-2 font-semibold">Điểm theo tiêu chí</h3>
                <div className="grid gap-2 sm:grid-cols-2">{result.breakdown.map(item => <div key={item.group} className="rounded-xl border border-slate-200 p-3">
                    <p>{groups[item.group] || item.group}</p><p className="font-semibold text-emerald-700">{item.points} điểm</p>
                </div>)}</div></section>}
            <div className="grid gap-4 sm:grid-cols-2">{[['Kỹ năng đã nêu trong CV', result.evidencedSkills], ['Kỹ năng chưa thấy trong CV', result.notEvidencedSkills]].map(([title, skills]) =>
                <section key={title}><h3 className="mb-2 font-semibold">{title}</h3>{skills?.length ? <ul className="list-disc space-y-1 pl-5">{skills.map((skill, index) => <li key={`${index}-${skill}`}>{skill}</li>)}</ul>
                    : <p className="text-slate-500">Không có mục trong nhóm này.</p>}</section>)}</div>
            {!!result.contributions?.length && <section><h3 className="mb-2 font-semibold">Nhận xét và gợi ý theo yêu cầu công việc</h3>
                <div className="space-y-3">{result.contributions.map(({ evidence, points }, index) => evidence && <div key={evidence.requirementId || index} className="space-y-2 rounded-xl border border-slate-200 p-4">
                    <h4 className="font-semibold">{evidence.description}</h4>
                    <p className="text-emerald-700">{assessments[evidence.assessment] || evidence.assessment} · {points} điểm</p>
                    {evidence.reason && <p>{evidence.reason}</p>}
                    {evidence.suggestion && <p className="text-slate-600">Gợi ý: {evidence.suggestion}</p>}
                    {!!evidence.cvEvidence?.length && <div className="border-l-2 border-emerald-300 pl-3 text-slate-500">{evidence.cvEvidence.map((quote, i) => <p key={i}>{quote.text}</p>)}</div>}
                </div>)}</div></section>}
        </>}
        {snapshot?.cvText && <details className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer font-semibold">CV tại thời điểm đánh giá</summary>
            <p className="mt-3 whitespace-pre-wrap break-words">{snapshot.cvText}</p></details>}
        {snapshot?.jdText && <details className="rounded-xl border border-slate-200 p-3"><summary className="cursor-pointer font-semibold">Mô tả công việc tại thời điểm đánh giá</summary>
            <p className="mt-3 whitespace-pre-wrap break-words">{snapshot.jdText}</p></details>}
    </div>;
}
