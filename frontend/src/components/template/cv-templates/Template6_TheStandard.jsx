import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { useCV } from '../../../contexts/CVContext.jsx';
import EditableText from '../EditableText.jsx';

export default function Template6_TheStandard({ data }) {

    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateEducation,
        updateProjects,
        updateLanguages,
        updateAwards,
        updateCertificates
    } = useCV();

    if (!cvData) return null;

    const { title, skills } = data || {};
    const { personalInfo, summary, experiences, education, certificates, languages, awards, projects } = cvData;

    return (
        <div className="max-w-[1000px] mx-auto bg-white shadow-lg min-h-[1800px] flex print:shadow-none print:w-full font-sans text-slate-800 overflow-hidden">

            {/* Left Column */}
            <div className="w-[60%] flex flex-col">
                {/* Top Header Block Dark Brown */}
                <div className="bg-[#564234] text-white p-10 pt-12 pb-8">
                    <h1 className="text-4xl font-bold leading-tight mb-2 uppercase">
                        <EditableText
                            value={personalInfo.name}
                            onChange={(val) => updatePersonalInfo({name: val})}
                            className="text-white uppercase"
                        />
                    </h1>
                    <h2 className="text-[14px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-6">
                        <EditableText
                            value={title || "Professional Title"}
                            onChange={() => {}}
                            className="text-white/80"
                        />
                    </h2>
                    <EditableText
                        multiline
                        value={summary}
                        onChange={updateSummary}
                        className="text-[13px] text-white/90 leading-relaxed max-w-[90%]"
                    />
                </div>

                {/* Content in Left Column */}
                <div className="p-10 pt-8 bg-white flex-1">
                    <div className="mb-8">
                        <h3 className="text-lg font-bold uppercase tracking-widest text-[#564234] border-b-2 border-slate-100 pb-2 mb-6">SKILL</h3>
                        <div className="grid grid-cols-[100px_1fr] gap-y-5 text-[13px]">
                            <div className="font-bold pt-1 text-slate-700">Back-end</div>
                            <div className="flex flex-wrap gap-1.5">
                                {skills?.backend?.map(s => <span key={s} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold">{s}</span>)}
                            </div>
                            <div className="font-bold pt-1 text-slate-700">Front-end</div>
                            <div className="flex flex-wrap gap-1.5">
                                {skills?.frontend?.map(s => <span key={s} className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold">{s}</span>)}
                            </div>
                            <div className="font-bold pt-1 text-slate-700">Soft Skills</div>
                            <ul className="list-disc ml-4 flex flex-col gap-1.5">
                                {skills?.soft?.map((s,i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold uppercase tracking-widest text-[#564234] border-b-2 border-slate-100 pb-2 mb-6">WORK EXPERIENCE</h3>
                        <div className="flex flex-col gap-6 relative border-l-2 border-[#564234] ml-2 pl-5">
                            {experiences?.map((exp, idx) => (
                                <div key={exp.id} className="relative">
                                    <div className="absolute w-3 h-3 bg-[#564234] rounded-full -left-[27px] top-1.5"></div>

                                    <div className="text-xs font-bold text-slate-500 mb-1">
                                        <EditableText value={exp.period} onChange={(val) => updateExperience(exp.id, 'period', val)} />
                                    </div>
                                    <div className="text-[15px] font-bold text-[#564234] mb-3">
                                        <EditableText value={exp.role} onChange={(val) => updateExperience(exp.id, 'role', val)} />
                                        <span className="font-normal text-slate-600 leading-normal block">at
                                            <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, 'company', val)} />
                                        </span>
                                    </div>

                                    <ul className="list-disc ml-4 text-[13px] flex flex-col gap-2 mb-4">
                                        {exp.details?.map((b, i) => (
                                            <li key={i}>
                                                <EditableText multiline value={b} onChange={(val) => updateExperienceDetail(exp.id, i, val)} />
                                            </li>
                                        ))}
                                    </ul>

                                    {projects && projects[idx] && (
                                        <div className="mb-4">
                                            <div className="uppercase font-bold text-[12px] tracking-wider mb-2">PROJECT:</div>
                                            <div className="font-bold text-[13px] mb-1">
                                                <EditableText
                                                    value={projects[idx].name}
                                                    onChange={(val) => {
                                                        const updated = [...projects];
                                                        updated[idx].name = val;
                                                        updateProjects(updated);
                                                    }}
                                                />
                                                {" | "}
                                                <span className="font-normal text-slate-500">
                                                    <EditableText
                                                        value={projects[idx].period}
                                                        onChange={(val) => {
                                                            const updated = [...projects];
                                                            updated[idx].period = val;
                                                            updateProjects(updated);
                                                        }}
                                                    />
                                                </span>
                                            </div>
                                            <ul className="list-disc ml-4 text-[12px] flex flex-col gap-1.5 text-slate-700">
                                                <li><strong className="font-semibold">Project description:</strong> <EditableText value={projects[idx].details?.[0] || ""} onChange={(val) => {
                                                    const updated = [...projects];
                                                    updated[idx].details = updated[idx].details || [];
                                                    updated[idx].details[0] = val;
                                                    updateProjects(updated);
                                                }} /></li>
                                                <li><strong className="font-semibold">Responsibilities:</strong> <EditableText value={projects[idx].details?.slice(1).join(', ') || ""} onChange={(val) => {
                                                    const updated = [...projects];
                                                    updated[idx].details = [updated[idx].details?.[0] || "", val];
                                                    updateProjects(updated);
                                                }} /></li>
                                                <li><strong className="font-semibold">Tech stack:</strong> <EditableText value="React, Node.js, AWS" onChange={() => {}} /></li>
                                                <li><strong className="font-semibold">Team size:</strong> <EditableText value="5 members" onChange={() => {}} /></li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Light Gray */}
            <div className="w-[40%] bg-[#f4f4f4] p-10 pt-16 flex flex-col gap-10 border-l border-slate-200">

                <div className="flex flex-col items-center mb-2">
                    <div className="w-[180px] h-[180px] bg-slate-300 rounded-full overflow-hidden shadow-sm relative">
                        <div className="absolute inset-0 bg-slate-200"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 text-[13px] font-medium text-slate-600">
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Phone size={14} className="text-slate-500" /></div> <EditableText value={personalInfo.phone} onChange={(val) => updatePersonalInfo({phone: val})} /></div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Mail size={14} className="text-slate-500" /></div> <span className="break-all"><EditableText value={personalInfo.email} onChange={(val) => updatePersonalInfo({email: val})} /></span></div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Calendar size={14} className="text-slate-500" /></div> <EditableText value={personalInfo.dob} onChange={(val) => updatePersonalInfo({dob: val})} /></div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><MapPin size={14} className="text-slate-500" /></div> <EditableText value={personalInfo.address} onChange={(val) => updatePersonalInfo({address: val})} /></div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Globe size={14} className="text-slate-500" /></div> <span className="break-all"><EditableText value={personalInfo.linkedin} onChange={(val) => updatePersonalInfo({linkedin: val})} /></span></div>
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">EDUCATION</h3>
                    {education?.map((edu, idx) => (
                        <div key={idx} className="mb-3">
                            <div className la="font-bold text-[14px] text-[#564234] mb-1 leading-snug">
                                <EditableText value={edu.school} onChange={(val) => updateEducation(idx, 'school', val)} />
                            </div>
                            <div className="text-[13px] font-medium text-slate-700 mb-1">
                                <EditableText value={edu.degree} onChange={(val) => updateEducation(idx, 'degree', val)} />
                            </div>
                            <div className="text-[12px] text-slate-500 mb-1">
                                <EditableText value={edu.year} onChange={(val) => updateEducation(idx, 'year', val)} />
                            </div>
                            <div className="text-[12px] font-medium">
                                <EditableText value={edu.gpa} onChange={(val) => updateEducation(idx, 'gpa', val)} />
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">CERTIFICATE</h3>
                    {certificates?.map((cert, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">
                                <EditableText
                                    value={cert.name}
                                    onChange={(val) => {
                                        const updated = [...certificates];
                                        updated[idx].name = val;
                                        updateCertificates(updated);
                                    }}
                                />
                            </div>
                            <div className="text-[13px] font-medium text-slate-700 mb-1">
                                <EditableText
                                    value={cert.issuer}
                                    onChange={(val) => {
                                        const updated = [...certificates];
                                        updated[idx].issuer = val;
                                        updateCertificates(updated);
                                    }}
                                />
                            </div>
                            <div className="text-[12px] text-slate-500 mb-2">
                                <EditableText
                                    value={cert.date}
                                    onChange={(val) => {
                                        const updated = [...certificates];
                                        updated[idx].date = val;
                                        updateCertificates(updated);
                                    }}
                                />
                            </div>
                            <a href="#" className="text-[12px] text-[#564234] underline font-semibold">View certificate</a>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">FOREIGN LANGUAGE</h3>
                    <div className="flex flex-col gap-2 text-[13px]">
                        {languages?.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="font-bold text-[#56423 la-00]">{l.name}</span>
                                <span className="text-slate-500">({l.level})</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">AWARD</h3>
                    {awards?.map((award, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">
                                <EditableText
                                    value={award.name}
                                    onChange={(val) => {
                                        const updated = [...awards];
                                        updated[idx].name = val;
                                        updateAwards(updated);
                                    }}
                                />
                            </div>
                            <div className="text-[13px] font-medium text-slate-700 mb-1">
                                <EditableText
                                    value={award.issuer}
                                    onChange={(val) => {
                                        const updated = [...awards];
                                        updated[idx].issuer = val;
                                        updateAwards(updated);
                                    }}
                                />
                            </div>
                            <div className="text-[12px] text-slate-500">
                                <EditableText
                                    value={award.date}
                                    onChange={(val) => {
                                        const updated = [...awards];
                                        updated[idx].date = val;
                                        updateAwards(updated);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}
