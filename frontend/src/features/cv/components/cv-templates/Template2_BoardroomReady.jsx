import { Briefcase, Globe, Mail, MapPin, Phone, Wrench, Calendar } from 'lucide-react';
import { useCV } from '../../contexts/CVContext.jsx';
import EditableText from '../EditableText.jsx';

export default function Template2_BoardroomReady({ data }) {

    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateProjects
    } = useCV();

    if (!cvData) return null;

    const { title, skills } = data || {};
    const { personalInfo, summary, experiences, projects } = cvData;

    return (
        <div className="overflow-x-auto w-full">
            <div className="max-w-full md:max-w-[850px] mx-auto bg-white shadow-lg min-h-[1600px] p-10 print:shadow-none print:w-full font-sans text-slate-800">

                <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-8">
                    <div className="flex-grow">
                        <h1 className="text-4xl font-bold text-slate-600 mb-2">
                            <EditableText
                                value={personalInfo.name}
                                onChange={(val) => updatePersonalInfo({name: val})}
                            />
                        </h1>
                        <h2 className="text-[15px] font-semibold tracking-widest uppercase text-slate-500">
                            <EditableText
                                value={title || "Professional Title"}
                                onChange={() => {}}
                            />
                        </h2>
                    </div>
                    <div className="flex flex-col gap-1.5 text-[13px] text-slate-600 font-medium whitespace-nowrap pt-2">
                        <div className="flex items-center gap-2"><Phone size={14} /> <EditableText value={personalInfo.phone} onChange={(val) => updatePersonalInfo({phone: val})} /></div>
                        <div className="flex items-center gap-2"><Mail size={14} /> <EditableText value={personalInfo.email} onChange={(val) => updatePersonalInfo({email: val})} /></div>
                        <div className="flex items-center gap-2"><Calendar size={14} /> <EditableText value={personalInfo.dob} onChange={(val) => updatePersonalInfo({dob: val})} /></div>
                        <div className="flex items-center gap-2"><MapPin size={14} /> <EditableText value={personalInfo.address} onChange={(val) => updatePersonalInfo({address: val})} /></div>
                        <div className="flex items-center gap-2"><Globe size={14} /> <EditableText value={personalInfo.linkedin} onChange={(val) => updatePersonalInfo({linkedin: val})} /></div>
                    </div>
                </div>

                <div className="mb-8 pl-1">
                    <EditableText
                        multiline
                        value={summary}
                        onChange={updateSummary}
                        className="text-[14px] leading-relaxed text-slate-700"
                    />
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-3 bg-slate-100 p-2 rounded mb-6">
                        <div className="bg-slate-700 text-white p-1 rounded"><Wrench size={18} /></div>
                        <h3 className="text-lg font-bold text-slate-800">SKILL</h3>
                    </div>

                    <div className="grid grid-cols-[140px_1fr] gap-y-4 text-[14px] px-2">
                        <div className="font-bold pt-1">Back-end</div>
                        <div className="flex flex-wrap gap-2">
                            {skills?.backend?.map(s => <span key={s} className="bg-slate-200 px-3 py-1 rounded-sm text-[13px] font-medium text-slate-800">{s}</span>)}
                        </div>
                        <div className="font-bold pt-1">Front-end</div>
                        <div className="flex flex-wrap gap-2">
                            {skills?.frontend?.map(s => <span key={s} className="bg-slate-200 px-3 py-1 rounded-sm text-[13px] font-medium text-slate-800">{s}</span>)}
                        </div>
                        <div className="font-bold pt-1">Soft Skills</div>
                        <ul className="list-disc ml-5 flex flex-col gap-1.5">
                            {skills?.soft?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex items-center gap-3 bg-slate-100 p-2 rounded mb-6">
                        <div className="bg-slate-700 text-white p-1 rounded"><Briefcase size={18} /></div>
                        <h3 className="text-lg font-bold text-slate-800">WORK EXPERIENCE</h3>
                    </div>

                    <div className="px-2">
                        {experiences?.map((exp, idx) => (
                            <div key={exp.id} className="mb-8">
                                <div className="flex justify-between font-bold border-b border-slate-200 pb-2 mb-4 bg-slate-50 p-2 text-[15px]">
                                    <div className="text-slate-700">
                                        <EditableText value={exp.role} onChange={(val) => updateExperience(exp.id, 'role', val)} />
                                    </div>
                                    <div className="text-slate-900">
                                        <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, 'company', val)} />
                                    </div>
                                    <div className="text-slate-700">
                                        <EditableText value={exp.period} onChange={(val) => updateExperience(exp.id, 'period', val)} />
                                    </div>
                                </div>

                                <ul className="list-disc ml-8 text-[14px] flex flex-col gap-2 mb-6">
                                    {exp.details?.map((b, i) => (
                                    <li key={i}>
                                        <EditableText
                                            multiline
                                            value={b}
                                            onChange={(val) => updateExperienceDetail(exp.id, i, val)}
                                        />
                                    </li>
                                ))}
                                </ul>

                                {projects && projects[idx] && (
                                    <div className="mb-6">
                                        <div className="uppercase font-bold text-[13px] mb-3 tracking-wider">PROJECT:</div>
                                        <div className="mb-4">
                                            <div className="font-bold text-[14px] mb-2">
                                                <EditableText
                                                    value={projects[idx].name}
                                                    onChange={(val) => {
                                                        const updated = [...projects];
                                                        updated[idx].name = val;
                                                        updateProjects(updated);
                                                    }}
                                                />
                                                {" | "}
                                                <span className="font-normal text-slate-600">
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
                                            <ul className="list-disc ml-8 text-[13px] flex flex-col gap-1.5">
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
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
