import {useEffect} from 'react';
import {Sparkles, FileText, RotateCcw} from 'lucide-react';
import {Header} from '../../../components/layout/PublicHeader.jsx';
import {Footer} from '../../../components/layout/Footer.jsx';
import {useNavigate} from 'react-router-dom';
import {useInterviewSession} from '../hooks/useInterviewSession.js';
import {TAG_DEFINITIONS} from '../constants/feedbackInterviewRubric.js';

export function InterviewResults() {
    const navigate = useNavigate();
    const {data, update} = useInterviewSession();

    useEffect(() => {
        update({step: 10});
    }, [update]);

    const feedback = data.feedback;

    if (!feedback) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
                <div className="text-on-surface-variant">Đang tải kết quả...</div>
            </div>
        );
    }

    const {overallScore, overallLabel, hrPersona, criteria, transcript, summary,
        strengths = [], improvementAreas = [], recommendations = []} = feedback;
    const passedCount = transcript.filter((t) => t.status === 'pass').length;
    const improveCount = transcript.filter((t) => t.status === 'improve').length;
    const skippedCount = transcript.filter((t) => t.status === 'skipped').length;

    return (
        <div className="min-h-screen flex flex-col bg-interview-radial text-on-surface font-sans selection:bg-primary-container/20">
            <Header/>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* HR Persona Card */}
                    <div className="bg-interview-card-bg rounded-2xl p-6 border border-outline-variant shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-black font-bold">
                                {hrPersona.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-semibold text-black truncate">{hrPersona.name}</h3>
                                <p className="text-xs text-black/60 truncate">{hrPersona.role}</p>
                            </div>
                        </div>
                        <p className="text-xs text-black/60 italic mb-3">"{hrPersona.tone}"</p>
                        <p className="text-sm text-black/80 leading-relaxed mb-3">{hrPersona.opener}</p>
                    </div>

                    {/* Total Score Card */}
                    <div className="bg-interview-card-bg rounded-2xl p-6 border border-outline-variant shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-display font-semibold text-primary">Tổng điểm AI</h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                overallScore >= 80 ? 'bg-primary text-on-primary border-primary' :
                                overallScore >= 50 ? 'bg-amber-500 text-white border-amber-600' :
                                'bg-rose-500 text-white border-rose-600'
                            }`}>
                                {overallLabel}
                            </span>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--color-outline)" strokeWidth="8"/>
                                    <circle
                                        cx="50" cy="50" r="40" fill="transparent"
                                        stroke="var(--color-primary)" strokeWidth="8"
                                        strokeDasharray="251"
                                        strokeDashoffset={251 - (251 * overallScore / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-3xl font-display font-bold text-black">{overallScore}<span className="text-sm font-sans text-black/60 font-medium">/100</span></span>
                                </div>
                            </div>
                            <p className="text-sm text-black/80 leading-relaxed">
                                <strong className="text-black block mb-1">Tóm tắt:</strong>
                                {summary}
                            </p>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                            <p className="text-xs text-black/60">Kết quả đã được lưu vào tài khoản.</p>
                            <button
                                onClick={() => navigate('/interview/job-selection')}
                                className="flex justify-center items-center gap-2 bg-interview-card-bg text-black border-2 border-selection-border selection-card-hover px-4 py-2 rounded-lg font-medium text-sm transition-all"
                            >
                                <RotateCcw size={16}/> Luyện tập lại
                            </button>
                        </div>
                    </div>

                    {/* Detail Scores */}
                    <div className="bg-interview-card-bg rounded-2xl p-6 border border-outline-variant shadow-sm">
                        <h3 className="text-xs font-bold text-outline mb-5 tracking-wider uppercase">Chi Tiết Năng Lực</h3>

                        {criteria.length > 0 ? <div className="space-y-4">
                            {criteria.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-black/60">{item.label}</span>
                                        <span className="font-semibold text-black">{item.score}/100</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all`}
                                            style={{width: `${item.score}%`}}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div> : <p className="text-sm text-black/60">Gói hiện tại cung cấp đánh giá tổng quan cho buổi phỏng vấn.</p>}
                    </div>

                    <div className="bg-interview-card-bg rounded-2xl p-6 border border-outline-variant shadow-sm space-y-5">
                        <section>
                            <h3 className="text-sm font-bold text-black mb-2">Điểm mạnh</h3>
                            {strengths.length ? <ul className="list-disc pl-5 space-y-1 text-sm text-black/75">{strengths.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="text-sm text-black/60">Chưa có nhận xét.</p>}
                        </section>
                        <section>
                            <h3 className="text-sm font-bold text-black mb-2">Điểm cần cải thiện</h3>
                            {improvementAreas.length ? <ul className="list-disc pl-5 space-y-1 text-sm text-black/75">{improvementAreas.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p className="text-sm text-black/60">Chưa có nhận xét.</p>}
                        </section>
                        {recommendations.length > 0 && <section>
                            <h3 className="text-sm font-bold text-black mb-2">Đề xuất luyện tập</h3>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-black/75">{recommendations.map((item, i) => <li key={i}>{item}</li>)}</ul>
                        </section>}
                    </div>
                </div>

                {/* Right Column - Transcript */}
                <div className="bg-interview-card-bg rounded-2xl border border-outline-variant shadow-sm flex flex-col overflow-hidden h-[calc(100vh-112px)] sticky top-24">
                    <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-interview-card-bg/50 shrink-0 flex-wrap gap-2">
                        <h2 className="text-lg font-display font-semibold text-black">Bản ghi hội thoại & Đánh giá</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-primary text-on-primary border border-primary px-2 py-0.5 rounded text-xs font-bold">{passedCount} Đạt</span>
                            <span className="bg-amber-500 text-white border border-amber-600 px-2 py-0.5 rounded text-xs font-bold">{improveCount} Cần cải thiện</span>
                            {skippedCount > 0 && (
                                <span className="bg-gray-400 text-black border border-gray-500 px-2 py-0.5 rounded text-xs font-bold">{skippedCount} Bỏ qua</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {transcript.map((t) => (
                            <TranscriptBlock key={t.qid} entry={t} persona={hrPersona}/>
                        ))}

                        {/* Closer */}
                        <div className="pt-6 border-t border-outline-variant">
                            <p className="text-sm text-black/60 italic">{hrPersona.closer}</p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-outline-variant bg-interview-card-bg/50 flex justify-end shrink-0">
                        <button
                            onClick={() => alert('Chức năng xuất PDF (mock)')}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                        >
                            <FileText size={16}/> Xuất báo cáo PDF
                        </button>
                    </div>
                </div>
            </main>

            <Footer/>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: var(--color-surface-container); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-outline); border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-on-surface-variant); }
            `.replace(/var\(--color-outline\)/g, '#cbd5e1')}}/>
        </div>
    );
}

function TranscriptBlock({entry, persona}) {
    const {question, answer, status, suggestions} = entry;

    const statusBadge = () => {
        if (status === 'skipped') {
            return <span className="bg-outline text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Bỏ qua</span>;
        }
        if (status === 'pass') {
            return <span className="bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Đạt</span>;
        }
        if (status === 'reviewed') {
            return <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Đã trả lời</span>;
        }
        return <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Cần cải thiện</span>;
    };

    return (
        <div className="group">
            <div className="flex gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 border border-primary">
                    <span className="font-bold text-xs italic">AI</span>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{persona.name}</p>
                    <p className="text-black text-sm leading-relaxed">{question}</p>
                </div>
            </div>

            <div className="ml-11 border-l-2 border-outline-variant pl-4 py-1 relative group-hover:border-primary/30 transition-colors">
                <p className="text-xs font-bold text-black/60 mb-1 uppercase tracking-wider opacity-70">Câu trả lời của bạn</p>
                <p className="text-black/80 text-sm leading-relaxed mb-3 italic">
                    {status === 'skipped' ? '"(Đã bỏ qua câu hỏi này)"' : `"${answer}"`}
                </p>
                {entry.assessment && <p className="text-sm text-black/75 mb-3"><strong>Đánh giá:</strong> {entry.assessment}</p>}

                <div className="flex items-center gap-2 mb-3">
                    {statusBadge()}
                </div>

                {suggestions && suggestions.length > 0 && suggestions.map((s, i) => {
                    const isMustHave = s.tag === 'must-have';
                    const tagDef = TAG_DEFINITIONS[s.tag] || TAG_DEFINITIONS['nice-to-have'];
                    return (
                        <div key={i} className={`bg-interview-card-bg border-2 ${isMustHave ? 'border-rose-500' : 'border-selection-border'} rounded-lg p-4 mb-2 shadow-sm`}>
                            <div className={`flex items-center gap-2 ${isMustHave ? 'text-rose-600' : 'text-primary'} mb-2`}>
                                <Sparkles size={14}/>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {isMustHave ? 'Phải cải thiện' : 'Gợi ý thêm'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isMustHave ? 'bg-rose-600 text-white' : 'bg-primary text-on-primary'}`}>
                                    {tagDef.label}
                                </span>
                            </div>
                            <p className="text-black/80 text-sm">{s.text}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
