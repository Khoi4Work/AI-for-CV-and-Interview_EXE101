import {useEffect, useState} from 'react';
import {ArrowLeft, Check, FileText, LoaderCircle, Sparkles} from 'lucide-react';
import {MainLayout} from '../components/MainLayout.jsx';
import {useNavigate} from 'react-router-dom';
import {useInterviewSession} from '../hooks/useInterviewSession.js';
import {getApiErrorMessage} from '../../../service/apiClient.js';
import {interviewService} from '../services/interviewService.js';
import {downloadInterviewTranscript} from '../services/interviewExports.js';

export function VideoReview() {
    const navigate = useNavigate();
    const {data, update, generateFeedback} = useInterviewSession();
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [error, setError] = useState('');
    const answers = new Map((data.answers || []).map((answer) => [answer.qid, answer]));

    useEffect(() => {
        update({step: 9});
    }, [update]);

    useEffect(() => {
        if (!data.backendSessionId) return undefined;
        let active = true;
        interviewService.getSessionDetail(data.backendSessionId)
            .then((detail) => {
                if (!active) return;
                const answers = (detail.answers || []).map((answer) => ({
                    qid: answer.questionId,
                    text: answer.answerText || '',
                    skipped: Boolean(answer.isSkipped),
                }));
                update({answers});
            })
            .catch((requestError) => {
                if (active) setError(getApiErrorMessage(requestError, 'Không thể tải câu trả lời đã lưu.'));
            });
        return () => { active = false; };
    }, [data.backendSessionId, update]);

    const handleSendFeedback = async () => {
        if (isEvaluating) return;
        setIsEvaluating(true);
        setError('');
        try {
            await generateFeedback();
            navigate('/interview/result');
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, 'Không thể tạo phản hồi phỏng vấn.'));
        } finally {
            setIsEvaluating(false);
        }
    };

    return (
        <MainLayout>
            <div className="w-full max-w-5xl mx-auto flex flex-col pt-4">
                <p className="text-center text-sm text-gray-500 font-medium mb-6">Bước 9 trên 10 • 90% hoàn tất</p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
                    <button className="hover:text-gray-900" onClick={() => navigate('/interview/room')}>Phỏng vấn thử</button>
                    <span>›</span>
                    <span className="text-gray-900">Xem lại câu trả lời</span>
                </div>

                <h1 className="text-3xl font-display font-semibold mb-2">Hoàn tất phỏng vấn</h1>
                <p className="text-gray-600 mb-6">
                    Kiểm tra câu trả lời đã được lưu và phiên âm bởi BE trước khi yêu cầu đánh giá AI.
                </p>

                <div className="rounded-xl border border-outline-variant bg-interview-card-bg p-4 mb-5 flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-sm text-black/70">Transcript câu hỏi và trả lời được lưu trên hệ thống. Nếu bật ghi âm cục bộ, âm thanh micro và giọng đọc câu hỏi TTS sẽ được ghép và lưu trong trình duyệt để tải về; file không gửi lên máy chủ. Trường hợp trình duyệt phải dùng giọng đọc dự phòng thì giọng đó không thể đưa vào file.</p>
                </div>

                <div className="space-y-4 mb-8">
                    {(data.questions || []).map((question, index) => {
                        const answer = answers.get(question.id);
                        const skipped = !answer || answer.skipped;
                        return (
                            <article key={question.id} className="rounded-xl border border-outline-variant bg-interview-card-bg p-5">
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Câu {index + 1}{question.category ? ` · ${question.category}` : ''}</p>
                                <h2 className="font-semibold text-black mb-3">{question.text}</h2>
                                <p className="text-sm text-black/70 whitespace-pre-wrap">
                                    {skipped ? 'Bạn đã bỏ qua câu hỏi này.' : answer.text}
                                </p>
                            </article>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => navigate('/interview/job-selection')}
                        className="flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 font-medium text-gray-700 hover:bg-surface-container"
                    >
                        <ArrowLeft size={17} /> Thoát
                    </button>
                    <div className="flex flex-wrap justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => downloadInterviewTranscript({...data, answers: [...answers.values()]})}
                            className="flex items-center gap-2 rounded-xl border border-outline-variant px-5 py-2.5 font-semibold text-on-surface hover:bg-surface-container"
                        >
                            <FileText size={17} /> Tải hội thoại (.txt)
                        </button>
                        <button
                            onClick={handleSendFeedback}
                            disabled={isEvaluating}
                            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-bold text-on-primary shadow-md transition-colors hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isEvaluating ? <LoaderCircle size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            {isEvaluating ? 'Đang đánh giá...' : 'Nhận kết quả phản hồi'}
                        </button>
                    </div>
                </div>
                {error && <p role="alert" className="error-alert mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            </div>
        </MainLayout>
    );
}
