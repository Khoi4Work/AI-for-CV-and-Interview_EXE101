import { Mail, MapPin, Phone, Globe, Calendar } from 'lucide-react';
import { useCV } from '../../../contexts/CVContext.jsx';
import EditableText from '../EditableText.jsx';

export default function Template4({ data }) {

    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateEducation,
        updateCertificates,
        updateProjects
    } = useCV();

    if (!cvData) return null;
    const { title, skillsGrouped } = data || {};
    const { personalInfo, summary, education, experiences, certificates, projects } = cvData;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-2xl min-h-[1300px] flex print:shadow-none print:w-full font-sans text-slate-800">

            {/* Left Sidebar - Dark Blue */}
            <div className="w-[35%] bg-[#0B2039] text-white flex flex-col pt-10">

                <div className="px-8 mb-8 pb-8 border-b border-white/20">
                    <h1 className="text-3xl font-bold leading-tight mb-2">
                        <EditableText
                            value={personalInfo.name}
                            onChange={(val) => updatePersonalInfo({name: val})}
                            className="text-white"
                        />
                    </h1>
                    <h2 className="text-xs tracking-widest text-[#A2CAEA] uppercase">
                        <EditableText
                            value={title || "Professional Title"}
                            onChange={() => {}}
                            className="text-[#A2CAEA]"
                        />
                    </h2>
                </div>

                <div className="px-8 flex flex-col gap-6 text-[13px]">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-[#A2CAEA]" /> <EditableText value={personalInfo.phone} onChange={(val) => updatePersonalInfo({phone: val})} /></div>
                        <div className="flex items-center gap-2"><Mail size={14} className="text-[#A2CAEA]" /> <span className="break-all"><EditableText value={personalInfo.email} onChange={(val) => updatePersonalInfo({email: val})} /></span></div>
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-[#A2CAEA]" /> <EditableText value={personalInfo.dob} onChange={(val) => updatePersonalInfo({dob: val})} /></div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-[#A2CAEA]" /> <EditableText value={personalInfo.address} onChange={(val) => updatePersonalInfo({address: val})} /></div>
                        <div className="flex items-center gap-2"><Globe size={14} className="text-[#A2CAEA]" /> <span className="break-all"><EditableText value={personalInfo.linkedin} onChange={(val) => updatePersonalInfo({linkedin: val})} /></span></div>
                    </div>

                    <div className="pt-4">
                        <h3 className="font-bold text-sm tracking-wider uppercase mb-4 text-[#A2CAEA]">Education</h3>
                        {education?.map((edu, idx) => (
                            <div key={idx} className="mb-3">
                                <div className="font-bold mb-1 leading-snug">
                                    <EditableText value={edu.school} onChange={(val) => updateEducation(idx, 'school', val)} />
                                </div>
                                <div className="text-white/80 font-medium mb-1">
                                    <EditableText value={edu.degree} onChange={(val) => updateEducation(idx, 'degree', val)} />
                                </div>
                                <div className="text-white/60 text-[11px] mb-1">
                                    <EditableText value={edu.year} onChange={(val) => updateEducation(idx, 'year', val)} />
                                </div>
                                <div className="text-white/60 text-[11px]">GPA <EditableText value={edu.gpa} onChange={(val) => updateEducation(idx, 'gpa', val)} /></div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <h3 className="font-bold text-sm tracking-wider uppercase mb-4 text-[#A2CAEA]">Skill</h3>
                        <div className="flex flex-col gap-3 text-[12px]">
                            <div className="flex flex-wrap gap-1.5">
                                {skillsGrouped?.excellent?.map(s => <span key={s} className="border border-white/30 px-2 py-0.5 rounded-full">{s}</span>)}
                                {skillsGrouped?.intermediate?.map(s => <span key={s} className="border border-white/30 px-2 py-0.5 rounded-full">{s}</span>)}
                                {skillsGrouped?.beginner?.map(s => <span key={s} className="border border-white/30 px-2 py-0.5 rounded-full">{s}</span>)}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <h3 className="font-bold text-sm tracking-wider uppercase mb-4 text-[#A2CAEA]">Certificate</h3>
                        {certificates?.map((cert, idx) => (
                            <div key={idx} className="mb-3">
                                <div className="font-bold mb-1">
                                    <EditableText
                                        value={cert.name}
                                        onChange={(val) => {
                                            const updated = [...certificates];
                                            updated[idx].name = val;
                                            updateCertificates(updated);
                                        }}
                                    />
                                </div>
                                <div className="text-white/80 mb-1">
                                    <EditableText
                                        value={cert.issuer}
                                        onChange={(val) => {
                                            const updated = [...certificates];
                                            updated[idx].issuer = val;
                                            updateCertificates(updated);
                                        }}
                                    />
                                </div>
                                <div className="text-white/60 text-[11px]">
                                    <EditableText
                                        value={cert.date}
                                        onChange={(val) => {
                                            const updated = [...certificates];
                                            updated[idx].date = val;
                                            updateCertificates(updated);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="w-[65%] p-10 bg-white">

                <div className="flex gap-6 mb-8 items-start">
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 uppercase text-sm mb-2 border-b border-slate-200 pb-1">About Me</h3>
                        <EditableText
                            multiline
                            value={summary}
                            onChange={updateSummary}
                            className="text-[13px] text-slate-600 leading-relaxed text-justify"
                        />
                    </div>
                    <div className="w-24 h-24 rounded-full bg-slate-200 shrink-0"></div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-slate-800 uppercase text-sm mb-4 border-b border-slate-200 pb-1">Work Experience</h3>
                    <div className="flex flex-col gap-6 border-l-2 border-slate-200 ml-1 pl-4">
                        {experiences?.slice(0,2).map((exp, idx) => (
                            <div key={exp.id} className="relative">
                                <div className="absolute w-2 h-2 rounded-full bg-blue-600 -left-[21px] top-1"></div>
                                <div className="text-[13px] font-bold text-blue-600 mb-1">
                                    <EditableText value={exp.role} onChange={(val) => updateExperience(exp.id, 'role', val)} />
                                </div>
                                <div className="text-[12px] font-bold text-slate-600 mb-2">
                                    <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, 'company', val)} />
                                    <span className="font-normal text-slate-400">| <EditableText value={exp.period} onChange={(val) => updateExperience(exp.id, 'period', val)} /></span>
                                </div>
                                <ul className="list-disc ml-4 text-[13px] flex flex-col gap-1.5 text-slate-600">
                                    {exp.details?.map((b,i)=><li key={i}><EditableText multiline value={b} onChange={(val) => updateExperienceDetail(exp.id, i, val)} /></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 uppercase text-sm mb-4 border-b border-slate-200 pb-1">Personal Project</h3>
                    <div className="flex flex-col gap-5 border-l-2 border-slate-200 ml-1 pl-4">
                        {projects?.map((proj, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute w-2 h-2 rounded-full bg-[#0B2039] -left-[21px] top-1"></div>
                                <div className="text-[13px] font-bold text-slate-800 mb-1">
                                    <EditableText
                                        value={proj.name}
                                        onChange={(val) => {
                                            const updated = [...projects];
                                            updated[idx].name = val;
                                            updateProjects(updated);
                                        }}
                                    />
                                    <span className="font-normal text-slate-500">| <EditableText value={proj.period} onChange={(val) => {
                                        const updated = [...projects];
                                        updated[idx].period = val;
                                        updateProjects(updated);
                                    }} /></span>
                                </div>
                                <div className="text-[13px] text-slate-600 mb-2">
                                    <span className="font-bold">Project description:</span> <EditableText value={proj.details?.[0] || ""} onChange={(val) => {
                                        const updated = [...projects];
                                        updated[idx].details = updated[idx].details || [];
                                        updated[idx].details[0] = val;
                                        updateProjects(updated);
                                    }} />
                                </div>
                                <div className="text-[12px] text-blue-600 underline font-medium">
                                    <EditableText
                                        value={proj.url}
                                        onChange={(val) => {
                                            const updated = [...projects];
                                            updated[idx].url = val;
                                            updateProjects(updated);
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
