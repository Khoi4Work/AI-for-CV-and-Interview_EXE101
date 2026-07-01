import React, {useEffect} from 'react';
import {Download, Sparkles, FileText, CheckCircle2, AlertCircle, Home} from 'lucide-react';
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

    const {overallScore, overallLabel, overallColor, hrPersona, criteria, transcript, summary} = feedback;
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
                    <div className="glass-panel rounded-2xl p-6 border border-outline-variant shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
                                {hrPersona.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="font-semibold text-on-surface truncate">{hrPersona.name}</h3>
                                <p className="text-xs text-on-surface-variant truncate">{hrPersona.role}</p>
                            </div>
                        </div>
                        <p className="text-xs text-on-surface-variant italic mb-3">"{hrPersona.tone}"</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{hrPersona.opener}</p>
                    </div>

                    {/* Total Score Card */}
                    <div className="glass-panel rounded-2xl p-6 border border-outline-variant shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-display font-semibold text-primary">Tổng điểm AI</h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                overallScore >= 80 ? 'bg-primary-container text-primary border-primary-container' :
                                overallScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-red-500/10 text-red-500 border-red-500/20'
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
                                    <span className="text-3xl font-display font-bold text-on-surface">{overallScore}<span className="text-sm font-sans text-on-surface-variant font-medium">/100</span></span>
                                </div>
                            </div>
                            <p className="text-sm text-on-surface-variant leading-relaxed">
                                <strong className="text-on-surface block mb-1">Tóm tắt:</strong>
                                {summary}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => alert('Chức năng lưu kết quả (mock)')}
                                className="flex-1 flex justify-center items-center gap-2 bg-primary text-on-primary py-2.5 rounded-lg font-medium text-sm hover:bg-primary-container transition-colors"
                            >
                                <Download size={16}/> Lưu kết quả
                            </button>
                            <button
                                onClick={() => navigate('/history')}
                                className="flex-1 flex justify-center items-center gap-2 bg-surface-container text-on-surface-variant border border-outline-variant py-2.5 rounded-lg font-medium text-sm hover:bg-surface-container-low transition-colors"
                            >
                                <Home size={16}/> Lịch sử
                            </button>
                        </div>
                    </div>

                    {/* Detail Scores */}
                    <div className="glass-panel rounded-2xl p-6 border border-outline-variant shadow-sm">
                        <h3 className="text-xs font-bold text-outline mb-5 tracking-wider uppercase">Chi Tiết Năng Lực</h3>

                        <div className="space-y-4">
                            {criteria.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-on-surface-variant">{item.label}</span>
                                        <span className="font-semibold text-on-surface">{item.score}/100</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} rounded-full transition-all`}
                                            style={{width: `${item.score}%`}}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column - Transcript */}
                <div className="glass-panel rounded-2xl border border-outline-variant shadow-sm flex flex-col overflow-hidden h-[calc(100vh-112px)] sticky top-24">
                    <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low shrink-0 flex-wrap gap-2">
                        <h2 className="text-lg font-display font-semibold text-on-surface">Bản ghi hội thoại & Đánh giá</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-primary-container text-primary border border-primary-container px-2 py-0.5 rounded text-xs font-medium">{passedCount} Đạt</span>
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-xs font-medium">{improveCount} Cần cải thiện</span>
                            {skippedCount > 0 && (
                                <span className="bg-surface-container text-outline border border-outline-variant px-2 py-0.5 rounded text-xs font-medium">{skippedCount} Bỏ qua</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {transcript.map((t) => (
                            <TranscriptBlock key={t.qid} entry={t} persona={hrPersona}/>
                        ))}

                        {/* Closer */}
                        <div className="pt-6 border-t border-outline-variant">
                            <p className="text-sm text-on-surface-variant italic">{hrPersona.closer}</p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end shrink-0">
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
        return <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Cần cải thiện</span>;
    };

    return (
        <div className="group">
            <div className="flex gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0 border border-primary-container">
                    <span className="font-bold text-xs italic">AI</span>
                </div>
                <div className="flex-1">
                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">{persona.name}</p>
                    <p className="text-on-surface text-sm leading-relaxed">{question}</p>
                </div>
            </div>

            <div className="ml-11 border-l-2 border-outline-variant pl-4 py-1 relative group-hover:border-primary/30 transition-colors">
                <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider opacity-70">Câu trả lời của bạn</p>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-3 italic">
                    {status === 'skipped' ? '"(Đã bỏ qua câu hỏi này)"' : `"${answer}"`}
                </p>

                <div className="flex items-center gap-2 mb-3">
                    {statusBadge()}
                </div>

                {suggestions && suggestions.length > 0 && suggestions.map((s, i) => {
                    const tagDef = TAG_DEFINITIONS[s.tag] || TAG_DEFINITIONS['nice-to-have'];
                    return (
                        <div key={i} className={`${tagDef.bgClass.replace('bg-', 'bg-primary-container/10')} border ${tagDef.bgClass.replace('bg-', 'border-')} rounded-lg p-4 mb-2`}>
                            <div className={`flex items-center gap-2 ${tagDef.textClass.replace('text-blue-600', 'text-primary')} mb-2`}>
                                <Sparkles size={14}/>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {s.tag === 'must-have' ? 'Phải cải thiện' : 'Gợi ý thêm'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tagDef.textClass.replace('text-blue-600', 'text-primary')} ${tagDef.bgClass.replace('bg-blue-600', 'bg-primary')}`}>
                                    {tagDef.label}
                                </span>
                            </div>
                            <p className="text-on-surface-variant text-sm">{s.text}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
