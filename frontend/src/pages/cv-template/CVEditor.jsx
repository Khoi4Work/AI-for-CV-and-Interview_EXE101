import React, { useState } from 'react';
import TopNagivationToolBar from "../../components/template/TopNagivationToolBar.jsx";
import {User, Star, Monitor, Sparkles, Download, ZoomIn, ZoomOut, RotateCcw} from "lucide-react";
import { useApp } from '../../contexts/AppContext.jsx';
import { useCV } from '../../contexts/CVContext.jsx';

export default function CVEditor() {
    const { showToast } = useApp();
    const { cvData, updatePersonalInfo, updateSummary, updateExperience, updateExperienceDetail, updateSkills } = useCV();
    const [zoom, setZoom] = useState(100);

    const handleExport = () => {
        showToast('Đang tối ưu hóa định dạng PDF... Tệp của bạn sẽ được tải xuống trong giây lát.', 'success');
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleResetZoom = () => setZoom(100);

    const simulateAIRewrite = (section) => {
        showToast(`AI đang tối ưu hóa nội dung phần ${section}...`, 'info');
        // In a real app, this would call a backend. Here we just mock the change.
        setTimeout(() => {
            showToast(`Đã tối ưu hóa ${section} thành công!`, 'success');
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden editor-body bg-slate-200">
            <TopNagivationToolBar
                onExport={handleExport}
                zoom={zoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
            />
            <main className="flex-1 overflow-auto flex justify-center p-12 relative bg-gradient-to-br from-slate-200 via-slate-300 to-slate-200">

                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-30 pointer-events-none"
                     style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>

                {/* CV Document */}
                <div
                    className="cv-page-container bg-white flex overflow-hidden shrink-0 shadow-2xl transition-transform duration-200 ease-in-out relative z-10"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >

                    {/* Left Sidebar */}
                    <aside className="w-1/3 flex flex-col shadow-inner">
                        {/* Profile Photo Placeholder */}
                        <div
                            className="h-[280px] bg-cv-grey flex items-center justify-center relative overflow-hidden group border-b border-gray-300">
                            <User className="h-20 w-20 text-gray-400 opacity-50"/>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-xs font-bold text-white bg-black/50 px-3 py-1 rounded-full transition-opacity">Thay ảnh</span>
                            </div>
                        </div>

                        {/* Contact and Skills Section */}
                        <div className="flex-1 bg-cv-sidebar-blue p-8 text-white relative">

                            {/* Contact Info */}
                            <section className="mb-10 group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a3c2f0]">
                                        <UserSvg/> Liên lạc
                                    </h3>
                                    <button onClick={() => simulateAIRewrite('Liên lạc')} className="opacity-0 group-hover:opacity-100 p-1 bg-white/10 rounded-full transition-all hover:bg-white/20">
                                        <Sparkles className="w-3 h-3 text-blue-300"/>
                                    </button>
                                </div>
                                <div className="space-y-4 text-xs">
                                    <div className="group/item">
                                        <p className="font-bold mb-1 opacity-90 text-[13px]">Điện thoại</p>
                                        <p contentEditable={true}
                                           onBlur={(e) => updatePersonalInfo({ phone: e.target.innerText })}
                                           className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">
                                            {cvData.personalInfo.phone || '--'}
                                        </p>
                                    </div>
                                    <div className="group/item">
                                        <p className="font-bold mb-1 opacity-90 text-[13px]">Email</p>
                                        <p contentEditable={true}
                                           onBlur={(e) => updatePersonalInfo({ email: e.target.innerText })}
                                           className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">
                                            {cvData.personalInfo.email || '--'}
                                        </p>
                                    </div>
                                    <div className="group/item">
                                        <p className="font-bold mb-1 uppercase opacity-90 text-[13px]">Ngày sinh</p>
                                        <p contentEditable={true}
                                           onBlur={(e) => updatePersonalInfo({ dob: e.target.innerText })}
                                           className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">
                                            {cvData.personalInfo.dob}
                                        </p>
                                    </div>
                                    <div className="group/item">
                                        <p className="font-bold mb-1 opacity-90 text-[13px]">Địa chỉ</p>
                                        <p contentEditable={true}
                                           onBlur={(e) => updatePersonalInfo({ address: e.target.innerText })}
                                           className="text-blue-200 outline-none focus:bg-white/10 rounded px-1 transition-colors">
                                            {cvData.personalInfo.address || '--'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Skills List */}
                            <section className="mb-10 group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a3c2f0]">
                                        <StarSvg/> Kỹ năng
                                    </h3>
                                    <button onClick={() => simulateAIRewrite('Kỹ năng')} className="opacity-0 group-hover:opacity-100 p-1 bg-white/10 rounded-full transition-all hover:bg-white/20">
                                        <Sparkles className="w-3 h-3 text-blue-300"/>
                                    </button>
                                </div>
                                <ul className="text-xs space-y-2.5 list-disc ml-5 marker:text-blue-400 marker:text-[10px]">
                                    {cvData.skills.map((skill, idx) => (
                                        <li key={idx} contentEditable={true}
                                            onBlur={(e) => {
                                                const newSkills = [...cvData.skills];
                                                newSkills[idx] = { ...newSkills[idx], name: e.target.innerText };
                                                updateSkills(newSkills);
                                            }}
                                            className="pl-1 outline-none focus:bg-white/10 rounded px-1 transition-colors">
                                            {skill.name}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* Software Skills */}
                            <section className="group">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#a3c2f0]">
                                        <MonitorSvg/> Kỹ năng phần mềm
                                    </h3>
                                    <button onClick={() => simulateAIRewrite('Phần mềm')} className="opacity-0 group-hover:opacity-100 p-1 bg-white/10 rounded-full transition-all hover:bg-white/20">
                                        <Sparkles className="w-3 h-3 text-blue-300"/>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {cvData.skills.filter(s => s.level).map((skill, idx) => (
                                        <div key={idx} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span contentEditable={true} className="outline-none focus:bg-white/10 rounded px-1 transition-colors">
                                                    {skill.name}
                                                </span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`${i < Math.round(skill.level/20) ? 'text-orange-400' : 'text-gray-400'} text-[10px]`}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="w-full bg-blue-900/50 h-1 mt-0.5 rounded-full overflow-hidden">
                                                <div className="bg-orange-400 h-full rounded-full transition-all duration-500"
                                                     style={{width: `${skill.level}%`}}>( la l)</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </aside>

                    {/* Main Content Body */}
                    <article className="flex-1 p-[4.5rem] bg-[#f8f9fa] relative">

                        {/* Header / Name */}
                        <header className="mb-12 group relative">
                            <h1 contentEditable={true}
                                onBlur={(e) => updatePersonalInfo({ name: e.target.innerText })}
                                className="text-[3.25rem] font-black text-cv-text-dark tracking-tighter mb-2 leading-none uppercase outline-none focus:bg-gray-100 rounded px-2 transition-colors">
                                {cvData.personalInfo.name}
                            </h1>
                            <h2 contentEditable={true}
                                className="text-[1.1rem] text-[#6b7280] uppercase tracking-[0.2em] font-bold outline-none focus:bg-gray-100 rounded px-2 transition-colors">
                                Nhân viên MKT
                            </h2>
                            <button onClick={() => simulateAIRewrite('Header')} className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-sm border border-gray-200 transition-all hover:text-blue-600">
                                <Sparkles className="w-4 h-4"/>
                            </button>
                        </header>

                        {/* Summary Section */}
                        <section className="mb-14 group relative">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[1.1rem] font-bold text-[#1e3a5f] uppercase tracking-wider relative z-10 bg-[#f8f9fa] pr-4">Mục
                                    tiêu nghề nghiệp</h3>
                                <div className="h-[1px] bg-gray-300 w-full absolute left-0 z-0"></div>
                            </div>
                            <p contentEditable={true}
                               onBlur={(e) => updateSummary(e.target.innerText)}
                               className="text-[13px] leading-[1.8] text-[#334155] text-justify outline-none focus:bg-gray-100 rounded px-2 transition-colors">
                                {cvData.summary}
                            </p>
                            <button onClick={() => simulateAIRewrite('Mục tiêu')} className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-sm border border-gray-200 transition-all hover:text-blue-600">
                                <Sparkles className="w-4 h-4"/>
                            </button>
                        </section>

                        {/* Work Experience Section */}
                        <section className="group relative">
                            <div className="bg-[#003171] text-white px-6 py-2.5 mb-8 inline-block shadow-sm rounded-r-lg">
                                <h3 className="text-base font-bold uppercase tracking-widest">Kinh nghiệm làm việc</h3>
                            </div>
                            <button onClick={() => simulateAIRewrite('Kinh nghiệm')} className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 p-2 bg-white rounded-full shadow-sm border border-gray-200 transition-all hover:text-blue-600">
                                <Sparkles className="w-4 h-4"/>
                            </button>

                            {/* Experience Items */}
                            <div className="space-y-10">
                                {cvData.experiences.map((exp, idx) => (
                                    <div key={exp.id} className="relative pl-9 group/exp">
                                        <div className="timeline-line"></div>
                                        <div className="timeline-dot shadow-sm"></div>

                                        <div className="flex justify-between items-start mb-1.5">
                                            <h4 contentEditable={true}
                                                onBlur={(e) => updateExperience(exp.id, 'company', e.target.innerText)}
                                                className="font-bold text-[#1e3a5f] text-lg outline-none focus:bg-gray-100 rounded px-1 transition-colors">
                                                {exp.company}
                                            </h4>
                                            <span contentEditable={true}
                                                  onBlur={(e) => updateExperience(exp.id, 'period', e.target.innerText)}
                                                  className="text-[11px] font-bold text-gray-500 tracking-wider outline-none focus:bg-gray-100 rounded px-1 transition-colors">
                                                {exp.period}
                                            </span>
                                        </div>
                                        <p contentEditable={true}
                                           onBlur={(e) => updateExperience(exp.id, 'role', e.target.innerText)}
                                           className="text-[13px] italic text-[#64748b] mb-4 font-medium outline-none focus:bg-gray-100 rounded px-1 transition-colors">
                                            {exp.role}
                                        </p>

                                        <ul className="text-[13px] text-[#475569] space-y-3 list-disc ml-5 leading-relaxed marker:text-gray-400">
                                            {exp.details.map((detail, dIdx) => (
                                                <li key={dIdx} contentEditable={true}
                                                    onBlur={(e) => updateExperienceDetail(exp.id, dIdx, e.target.innerText)}
                                                    className="outline-none focus:bg-gray-100 rounded px-1 transition-colors">
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </article>
                </div>
            </main>
        </div>
    )

    function UserSvg() {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
        );
    }

    function StarSvg() {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00 the- la 0.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
            </svg>
        );
    }

    function MonitorSvg() {
        return (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2 2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
        );
    }
}
