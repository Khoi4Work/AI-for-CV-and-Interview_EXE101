import { useEffect, useState } from 'react';
import { Clock, FileText, Video, ChevronDown } from 'lucide-react';
import Modal from '../../../components/ui/Modal.jsx';
import { Card, Badge, Button } from '../components/Layout.jsx';
import { getApiErrorMessage } from '../../../service/apiClient';
import { interviewService } from '../../interview/services/interviewService.js';
import { useGalleryData } from '../hooks/useGalleryData';
import { buildHistory } from '../utils/galleryData';

function InterviewDetail({ sessionId }) {
    const [state, setState] = useState({ loading: true, detail: null, error: null });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        interviewService.getSessionDetail(sessionId).then(detail => {
            if (active) setState({ loading: false, detail, error: null });
        }).catch(error => {
            if (active) setState({ loading: false, detail: null, error: getApiErrorMessage(error) });
        });
        return () => { active = false; };
    }, [sessionId, revision]);
    if (state.loading) return <p role="status" className="py-6 text-slate-500">Đang tải chi tiết phỏng vấn...</p>;
    if (state.error) return <div role="alert" className="text-red-600"><p>{state.error}</p><Button className="mt-3" onClick={() => {
        setState({ loading: true, detail: null, error: null });
        setRevision(previous => previous + 1);
    }}>Thử lại</Button></div>;
    const answers = Array.isArray(state.detail?.answers) ? state.detail.answers : [];
    const evaluation = state.detail?.evaluation;
    return <div className="space-y-4">
        {evaluation?.summary && <p className="p-4 bg-emerald-50 rounded-xl text-emerald-800">{evaluation.summary}</p>}
        <h3 className="font-semibold">Câu hỏi và câu trả lời</h3>
        {answers.length === 0 && <p className="text-sm text-slate-500">Chưa có câu trả lời trong phiên này.</p>}
        {answers.map((answer, index) => {
            const feedback = evaluation?.questionFeedback?.find(item => item.questionId === answer.questionId);
            return <div key={answer.id || answer.questionId} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-sm font-semibold text-slate-800">Câu {index + 1}: {answer.questionText || 'Nội dung câu hỏi không còn khả dụng'}</h4>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{answer.isSkipped ? 'Đã bỏ qua câu hỏi' : answer.answerText || 'Chưa có nội dung trả lời'}</p>
                {feedback?.score != null && <p className="text-sm text-emerald-700">Điểm: {feedback.score}</p>}
                {feedback?.assessment && <p className="text-sm text-emerald-700">{feedback.assessment}</p>}
                {feedback?.improvementSuggestion && <p className="text-sm text-slate-600">Gợi ý: {feedback.improvementSuggestion}</p>}
            </div>;
        })}
    </div>;
}

export default function HistoryPage() {
    const { cvs, sessions, loading, errors, reload } = useGalleryData(true);
    const [filter, setFilter] = useState('all');
    const [limit, setLimit] = useState(10);
    const [selected, setSelected] = useState(null);
    const logs = buildHistory(cvs, sessions);
    const filtered = logs.filter(log => filter === 'all' || log.type === filter);
    const visible = filtered.slice(0, limit);
    const groups = ['Hôm nay', 'Hôm qua', 'Trước đó', 'Chưa có ngày'];
    return <div className="max-w-4xl mx-auto pb-12">
        <h1 className="text-2xl font-bold text-[#10B981] mb-6">Lịch sử hoạt động</h1>
        <p className="text-sm text-slate-400 mb-6">Các CV đang lưu và phiên phỏng vấn trong tài khoản của bạn.</p>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2">
                {[['all', 'Tất cả'], ['tao_cv', 'Tạo CV'], ['phong_van', 'Phỏng vấn']].map(([id, label]) => <button key={id}
                    onClick={() => { setFilter(id); setLimit(10); }}
                    className={`px-4 py-2 rounded-full text-sm ${filter === id ? 'bg-emerald-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{label}</button>)}
            </div>
            <p className="bg-white text-slate-600 rounded-xl px-4 py-3 text-sm">Tổng hoạt động: {logs.length}</p>
        </div>
        {loading ? <p role="status" className="text-center py-16 text-slate-400">Đang tải lịch sử hoạt động...</p> : <>
            {errors.length > 0 && <div role="alert" className="bg-white rounded-2xl p-4 mb-4 text-red-600 space-y-3">
                <p>Một phần dữ liệu chưa tải được.</p>{errors.map(error => <p key={error} className="text-sm">{error}</p>)}<Button onClick={reload}>Thử lại</Button>
            </div>}
            <div className="bg-[#9BA9AF] rounded-2xl p-6 sm:p-8">
                {filtered.length === 0 && <p className="text-center py-10 bg-white rounded-2xl text-slate-600">
                    {errors.length ? 'Chưa có dữ liệu để hiển thị. Hãy thử tải lại.' : 'Không có hoạt động phù hợp với bộ lọc.'}
                </p>}
                {groups.map(group => {
                    const groupLogs = visible.filter(log => log.dateLabel === group);
                    if (!groupLogs.length) return null;
                    return <section key={group} className="mb-8">
                        <h2 className="text-center font-semibold text-sm text-slate-700 mb-4 uppercase">{group}</h2>
                        <div className="space-y-4">{groupLogs.map(log => <div key={log.id} className="flex items-start gap-3">
                            <div className="p-3 bg-white rounded-full text-emerald-600">{log.type === 'phong_van' ? <Video size={18} /> : <FileText size={18} />}</div>
                            <Card className="flex-1 p-4 bg-slate-100 rounded-2xl space-y-3">
                                <div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold text-emerald-600">{log.title}</h3><span className="text-xs text-slate-500">{log.time}</span></div>
                                {log.details && <p className="text-sm text-slate-600">{log.details}</p>}
                                {log.score != null && <p className="text-sm font-semibold text-emerald-700">Điểm phỏng vấn: {log.score}</p>}
                                <div className="flex flex-wrap items-center gap-3"><Badge variant="success">{log.typeLabel}</Badge><span className="text-xs text-slate-600">{log.statusLabel}</span>
                                    <button onClick={() => setSelected(log)} className="text-xs text-emerald-700 hover:underline">Xem chi tiết ›</button></div>
                            </Card>
                        </div>)}</div>
                    </section>;
                })}
                {visible.length < filtered.length && <div className="text-center"><Button onClick={() => setLimit(previous => previous + 10)} className="gap-2 rounded-full">Hiển thị thêm<ChevronDown size={16} /></Button></div>}
            </div>
        </>}
        <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || 'Chi tiết hoạt động'}>
            {selected && <div className="space-y-4 text-slate-700">
                <p className="flex gap-2 text-sm"><Clock size={16} />{selected.time}</p>
                <p className="text-sm">{selected.details}</p>
                {selected.score != null && <p className="font-semibold text-emerald-700">Điểm: {selected.score}</p>}
                {selected.sessionId ? <InterviewDetail key={selected.sessionId} sessionId={selected.sessionId} /> : <p className="text-sm">Trạng thái hiện tại: {selected.statusLabel}</p>}
            </div>}
        </Modal>
    </div>;
}
