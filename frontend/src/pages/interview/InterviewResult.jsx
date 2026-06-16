// /src/pages/interview/InterviewResult.jsx
import React, {useEffect} from 'react';
import {Download, Sparkles, FileText, CheckCircle2, AlertCircle, Home} from 'lucide-react';
import {Header} from '../../components/layout/PublicHeader.jsx';
import {Footer} from '../../components/layout/Footer.jsx';
import {useNavigate} from 'react-router-dom';
import {useInterviewSession} from '../../hooks/useInterviewSession';
import {TAG_DEFINITIONS} from '../../constant/feedbackRubric';

export function InterviewResults() {
    const navigate = useNavigate();
    const {data, update} = useInterviewSession();

    useEffect(() => {
        update({step: 10});
    }, [update]);

    const feedback = data.feedback;

    if (!feedback) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-gray-500">Đang tải kết quả...</div>
            </div>
        );
    }

    const {overallScore, overallLabel, overallColor, hrPersona, criteria, transcript, summary} = feedback;
    const passedCount = transcript.filter((t) => t.status === 'pass').length;
    const improveCount = transcript.filter((t) => t.status === 'improve').length;
    const skippedCount = transcript.filter((t) => t.status === 'skipped').length;

    return (
        <div className="min-h-screen flex flex-col bg-[#111827] text-gray-100 font-sans selection:bg-[#1e3a8a]">
            <Header/>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* HR Persona Card */}
                    <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-700 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1a56db] to-[#0b3c8f] flex items-center justify-center text-white font-bold">
                                {hrPersona.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">{hrPersona.name}</h3>
                                <p className="text-xs text-gray-400">{hrPersona.role}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 italic mb-3">"{hrPersona.tone}"</p>
                        <p className="text-sm text-gray-300 leading-relaxed mb-3">{hrPersona.opener}</p>
                    </div>

                    {/* Total Score Card */}
                    <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-700 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-display font-semibold">Tổng điểm AI</h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-400 border-emerald-500/30`}>
                                {overallLabel}
                            </span>
                        </div>

                        <div className="flex items-center gap-6 mb-6">
                            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#374151" strokeWidth="8"/>
                                    <circle
                                        cx="50" cy="50" r="40" fill="transparent"
                                        stroke="#3b82f6" strokeWidth="8"
                                        strokeDasharray="251"
                                        strokeDashoffset={251 - (251 * overallScore / 100)}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    <span className="text-3xl font-display font-bold">{overallScore}<span className="text-sm font-sans text-gray-400 font-medium">/100</span></span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                <strong className="text-white block mb-1">Tóm tắt:</strong>
                                {summary}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => alert('Chức năng lưu kết quả (mock)')}
                                className="flex-1 flex justify-center items-center gap-2 bg-white text-gray-900 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                            >
                                <Download size={16}/> Lưu kết quả
                            </button>
                            <button
                                onClick={() => navigate('/history')}
                                className="flex-1 flex justify-center items-center gap-2 bg-transparent text-gray-300 border border-gray-600 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
                            >
                                <Home size={16}/> Lịch sử
                            </button>
                        </div>
                    </div>

                    {/* Detail Scores */}
                    <div className="bg-[#1f2937] rounded-xl p-6 border border-gray-700 shadow-lg">
                        <h3 className="text-xs font-bold text-gray-400 mb-5 tracking-wider uppercase">Chi Tiết Năng Lực</h3>

                        <div className="space-y-4">
                            {criteria.map((item, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="text-gray-300">{item.label}</span>
                                        <span className="font-semibold">{item.score}/100</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
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
                <div className="bg-[#1f2937] rounded-xl border border-gray-700 shadow-lg flex flex-col overflow-hidden h-[calc(100vh-112px)] sticky top-24">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1f2937] shrink-0 flex-wrap gap-2">
                        <h2 className="text-lg font-display font-semibold">Bản ghi hội thoại & Đánh giá</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-medium">{passedCount} Đạt</span>
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-medium">{improveCount} Cần cải thiện</span>
                            {skippedCount > 0 && (
                                <span className="bg-gray-500/20 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded text-xs font-medium">{skippedCount} Bỏ qua</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {transcript.map((t) => (
                            <TranscriptBlock key={t.qid} entry={t} persona={hrPersona}/>
                        ))}

                        {/* Closer */}
                        <div className="pt-6 border-t border-gray-700">
                            <p className="text-sm text-gray-300 italic">{hrPersona.closer}</p>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-700 bg-[#1f2937] flex justify-end shrink-0">
                        <button
                            onClick={() => alert('Chức năng xuất PDF (mock)')}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                        >
                            <FileText size={16}/> Xuất báo cáo PDF
                        </button>
                    </div>
                </div>
            </main>

            <Footer/>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
            `}}/>
        </div>
    );
}

function TranscriptBlock({entry, persona}) {
    const {question, answer, status, suggestions} = entry;

    const statusBadge = () => {
        if (status === 'skipped') {
            return <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Bỏ qua</span>;
        }
        if (status === 'pass') {
            return <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Đạt</span>;
        }
        return <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">Cần cải thiện</span>;
    };

    return (
        <div>
            <div className="flex gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                    <span className="font-bold text-xs italic">AI</span>
                </div>
                <div>
                    <p className="text-xs font-bold text-purple-400 mb-1 uppercase tracking-wider">{persona.name}</p>
                    <p className="text-gray-200 text-sm leading-relaxed">{question}</p>
                </div>
            </div>

            <div className="ml-11 border-l-2 border-gray-700 pl-4 py-1 relative">
                <p className="text-xs font-bold text-blue-400 mb-1 uppercase tracking-wider">Câu trả lời của bạn</p>
                <p className="text-gray-300 text-sm leading-relaxed mb-3 italic">
                    {status === 'skipped' ? '"(Đã bỏ qua câu hỏi này)"' : `"${answer}"`}
                </p>

                <div className="flex items-center gap-2 mb-3">
                    {statusBadge()}
                </div>

                {suggestions && suggestions.length > 0 && suggestions.map((s, i) => {
                    const tagDef = TAG_DEFINITIONS[s.tag] || TAG_DEFINITIONS['nice-to-have'];
                    return (
                        <div key={i} className={`${tagDef.bgClass}/10 border ${tagDef.bgClass.replace('bg-', 'border-')} rounded-lg p-4 mb-2`}>
                            <div className={`flex items-center gap-2 ${tagDef.textClass} mb-2`}>
                                <Sparkles size={14}/>
                                <span className="text-xs font-bold uppercase tracking-wider">
                                    {s.tag === 'must-have' ? 'Phải cải thiện' : 'Gợi ý thêm'}
                                </span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tagDef.textClass} ${tagDef.bgClass}`}>
                                    {tagDef.label}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300">{s.text}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
