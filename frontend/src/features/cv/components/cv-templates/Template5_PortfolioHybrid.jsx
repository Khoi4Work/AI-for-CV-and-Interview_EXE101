import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { useCV } from '../../contexts/CVContext.jsx';
import EditableText from '../EditableText.jsx';
import ProfilePhotoPicker from '../ProfilePhotoPicker.jsx';
import SkillCategoryList from '../SkillCategoryList.jsx';
import { hasAnyField, hasSkills, hasText } from './templateDataUtils.js';

export default function Template5_PortfolioHybrid({ data }) {
    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateEducation,
        updateProjects
    } = useCV();

    if (!cvData) return null;

    const { title, skills, profilePhoto } = data || {};
    const { personalInfo, summary, experiences, education, projects } = cvData;
    const visibleExperiences = experiences?.slice(0, 2).filter((item) => hasAnyField(item, ['role', 'company', 'period', 'details'])) || [];
    const visibleEducation = education?.filter((item) => hasAnyField(item, ['school', 'degree', 'year'])) || [];
    const visibleProjects = projects?.filter((item) => hasAnyField(item, ['name', 'period', 'details'])) || [];

    return (
        <div className="overflow-x-auto w-full">
            <div className="max-w-full md:max-w-[850px] mx-auto bg-white shadow-lg min-h-[1350px] flex print:shadow-none print:w-full font-sans text-slate-800">

                {/* Left Sidebar - Teal */}
                <div className="w-[35%] bg-[#1b5e60] text-white p-10 flex flex-col gap-10">

                    <div className="flex flex-col items-center">
                        <ProfilePhotoPicker variant="frame" photo={profilePhoto} className="w-32 h-32 rounded-sm overflow-hidden shadow-xl border-[3px] border-white/20" />
                    </div>

                    <div className="flex flex-col gap-4 text-[12px] font-medium text-teal-50">
                        {hasText(personalInfo.phone) && <div className="flex items-center gap-3"><Phone size={14} className="text-white" /> <EditableText value={personalInfo.phone} onChange={(val) => updatePersonalInfo({phone: val})} /></div>}
                        {hasText(personalInfo.email) && <div className="flex min-w-0 items-center gap-3"><Mail size={14} className="shrink-0 text-white" /> <span className="min-w-0 flex-1"><EditableText value={personalInfo.email} onChange={(val) => updatePersonalInfo({email: val})} className="min-w-0 break-words" /></span></div>}
                        {hasText(personalInfo.dob) && <div className="flex items-center gap-3"><Calendar size={14} className="text-white" /> <EditableText value={personalInfo.dob} onChange={(val) => updatePersonalInfo({dob: val})} /></div>}
                        {hasText(personalInfo.address) && <div className="flex items-center gap-3"><MapPin size={14} className="text-white" /> <EditableText value={personalInfo.address} onChange={(val) => updatePersonalInfo({address: val})} /></div>}
                        {hasText(personalInfo.linkedin) && <div className="flex items-center gap-3"><Globe size={14} className="text-white" /> <span className="break-all"><EditableText value={personalInfo.linkedin} onChange={(val) => updatePersonalInfo({linkedin: val})} /></span></div>}
                    </div>

                    {hasSkills(skills) && <div className="border-t border-teal-700 pt-8">
                        <h3 className="font-bold text-[16px] tracking-widest uppercase mb-6 text-white border-l-4 border-white pl-3 leading-none">SKILL</h3>

                        <SkillCategoryList skills={skills} layout="stacked" variant="teal" className="text-[12px]" />
                    </div>}

                    {visibleEducation.length > 0 && <div className="border-t border-teal-700 pt-8 mt-auto">
                        <h3 className="font-bold text-[16px] tracking-widest uppercase mb-4 text-white border-l-4 border-white pl-3 leading-none">EDUCATION</h3>
                        {visibleEducation.map((edu) => {
                            const idx = education.indexOf(edu);
                            return (
                            <div key={idx} className="mb-4">
                                <div className="font-bold text-[13px] mb-1">
                                    <EditableText value={edu.school} onChange={(val) => updateEducation(idx, 'school', val)} />
                                </div>
                                <div className="text-[11px] text-teal-200 mb-1">
                                    <EditableText value={edu.year} onChange={(val) => updateEducation(idx, 'year', val)} />
                                </div>
                                <div className="text-[12px]">
                                    <EditableText value={edu.degree} onChange={(val) => updateEducation(idx, 'degree', val)} />
                                </div>
                            </div>
                        )})}
                    </div>}

                </div>

                {/* Right Content */}
                <div className="w-[65%] p-10 pt-12 relative font-sans">

                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-slate-800 mb-2 leading-none">
                            <EditableText value={personalInfo.name} onChange={(val) => updatePersonalInfo({name: val})} />
                        </h1>
                        {hasText(title) && <h2 className="text-[17px] text-slate-500 mb-6">
                            <EditableText value={title || "Professional Title"} onChange={() => {}} />
                        </h2>}
                        {hasText(summary) && <EditableText
                            multiline
                            value={summary}
                            onChange={updateSummary}
                            className="text-[13px] leading-relaxed text-slate-700"
                        />}
                    </div>

                    {visibleExperiences.length > 0 && <div className="mb-10">
                        <h3 className="text-lg font-bold uppercase mb-6 pb-2 text-[#1b5e60] tracking-widest border-b-[3px] border-slate-100">WORK EXPERIENCE</h3>
                        <div className="flex flex-col gap-8">
                            {visibleExperiences.map(exp => (
                                <div key={exp.id} className="relative">
                                    <div className="flex justify-between font-bold text-[14px] text-slate-800 mb-1 bg-slate-50 p-2 rounded">
                                        <div className="flex items-center gap-1">
                                            <EditableText value={exp.role} onChange={(val) => updateExperience(exp.id, 'role', val)} />
                                            <span className="text-slate-400">|</span>
                                            <span className="font-normal text-[#1b5e60] uppercase text-xs">
                                                <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, 'company', val)} />
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                            <EditableText value={exp.period} onChange={(val) => updateExperience(exp.id, 'period', val)} />
                                        </span>
                                    </div>
                                    <ul className="list-disc ml-5 mt-3 text-[13px] text-slate-700 flex flex-col gap-1.5">
                                        {exp.details?.map((b, i) => (
                                            <li key={i}>
                                                <EditableText multiline value={b} onChange={(val) => updateExperienceDetail(exp.id, i, val)} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>}

                    {visibleProjects.length > 0 && <div>
                        <h3 className="text-lg font-bold uppercase mb-6 pb-2 text-[#1b5e60] tracking-widest border-b-[3px] border-slate-100">HIGHLIGHT PROJECT</h3>
                        <div className="flex flex-col gap-6">
                            {visibleProjects.map((proj) => {
                                const idx = projects.indexOf(proj);
                                return (
                                <div key={idx}>
                                    <div className="flex gap-2 items-center mb-1">
                                        <h4 className="font-bold text-[14px] text-slate-800">
                                            <EditableText
                                                value={proj.name}
                                                onChange={(val) => {
                                                    const updated = [...projects];
                                                    updated[idx].name = val;
                                                    updateProjects(updated);
                                                }}
                                            />
                                        </h4>
                                        <span className="text-xs text-slate-500 ml-auto">
                                            <EditableText
                                                value={proj.period}
                                                onChange={(val) => {
                                                    const updated = [...projects];
                                                    updated[idx].period = val;
                                                    updateProjects(updated);
                                                }}
                                            />
                                        </span>
                                    </div>
                                    <ul className="list-disc ml-5 text-[13px] text-slate-700 flex flex-col gap-1.5 mb-2 mt-2">
                                        {proj.details?.map((b, i) => (
                                            <li key={i}>
                                                <EditableText
                                                    multiline
                                                    value={b}
                                                    onChange={(val) => {
                                                        const updated = [...projects];
                                                        updated[idx].details = updated[idx].details || [];
                                                        updated[idx].details[i] = val;
                                                        updateProjects(updated);
                                                    }}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )})}
                        </div>
                    </div>}

                </div>

            </div>
        </div>
    );
}
