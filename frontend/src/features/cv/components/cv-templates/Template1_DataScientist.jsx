import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { useCV } from '../../contexts/CVContext.jsx';
import EditableText from '../EditableText.jsx';

export default function Template1_DataScientist({ data }) {

    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateEducation
    } = useCV();

    if (!cvData) return null;

    const { title, skills } = data || {};
    const { personalInfo, summary, experiences, education } = cvData;

    return (
        <div className="overflow-x-auto w-full">
            <div className="max-w-full md:max-w-[850px] mx-auto bg-white shadow-lg min-h-[1450px] p-8 md:p-12 print:shadow-none print:w-full font-sans text-slate-800">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold mb-2">
                        <EditableText
                            value={personalInfo.name}
                            onChange={(val) => updatePersonalInfo({name: val})}
                            className="text-center"
                        />
                    </h1>
                    <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-600 mb-6">
                        <EditableText
                            value={title || "Professional Title"}
                            onChange={() => {}}
                            className="text-center"
                        />
                    </h2>
                    <div className="flex flex-wrap justify-center items-center gap-4 text-[13px] text-slate-600">
                        <div className="flex items-center gap-1.5"><Phone size={14} /> <EditableText value={personalInfo.phone} onChange={(val) => updatePersonalInfo({phone: val})} /></div>
                        <div className="flex items-center gap-1.5"><Mail size={14} /> <EditableText value={personalInfo.email} onChange={(val) => updatePersonalInfo({email: val})} /></div>
                        <div className="flex items-center gap-1.5"><Calendar size={14} /> <EditableText value={personalInfo.dob} onChange={(val) => updatePersonalInfo({dob: val})} /></div>
                        <div className="flex items-center gap-1.5"><MapPin size={14} /> <EditableText value={personalInfo.address} onChange={(val) => updatePersonalInfo({address: val})} /></div>
                        <div className="flex items-center gap-1.5"><Globe size={14} /> <EditableText value={personalInfo.linkedin} onChange={(val) => updatePersonalInfo({linkedin: val})} /></div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold uppercase border-b-[3px] border-slate-900 mb-4 pb-1">About Me</h3>
                    <EditableText
                        multiline
                        value={summary}
                        onChange={updateSummary}
                        className="text-[14px] leading-relaxed text-justify"
                    />
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold uppercase border-b-[3px] border-slate-900 mb-4 pb-1">Work Experience</h3>
                    <div className="flex flex-col gap-6">
                        {experiences?.map((exp, idx) => (
                            <div key={exp.id}>
                                <div className="flex justify-between font-bold mb-2 text-sm">
                                    <div className="flex flex-col">
                                        <EditableText value={exp.role} onChange={(val) => updateExperience(exp.id, 'role', val)} />
                                        <span className="text-slate-800 text-[15px]">
                                            <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, 'company', val)} />
                                        </span>
                                    </div>
                                    <div className="text-slate-900">
                                        <EditableText value={exp.period} onChange={(val) => updateExperience(exp.id, 'period', val)} />
                                    </div>
                                </div>
                                <ul className="list-disc ml-5 text-[14px] flex flex-col gap-1.5">
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
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold uppercase border-b-[3px] border-slate-900 mb-4 pb-1">Education</h3>
                    <div className="flex flex-col gap-6">
                        {education?.map((edu, idx) => (
                            <div key={idx} className="flex justify-between text-[14px]">
                                <div className="flex flex-col">
                                    <div className="font-bold text-[15px] mb-1">
                                        <EditableText value={edu.school} onChange={(val) => updateEducation(idx, 'school', val)} />
                                    </div>
                                    <div className="font-semibold text-slate-800">
                                        <EditableText value={edu.degree} onChange={(val) => updateEducation(idx, 'degree', val)} />
                                    </div>
                                    <div className="text-slate-600">
                                        <EditableText value={edu.gpa} onChange={(val) => updateEducation(idx, 'gpa', val)} />
                                    </div>
                                </div>
                                <div className="font-bold text-sm whitespace-nowrap">
                                    <EditableText value={edu.year} onChange={(val) => updateEducation(idx, 'year', val)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-lg font-bold uppercase border-b-[3px] border-slate-900 mb-4 pb-1">Skill</h3>
                    <div className="grid grid-cols-[140px_1fr] gap-y-6 text-[14px]">
                        <div className="font-bold pt-1">Back-end</div>
                        <div className="flex flex-wrap gap-2">
                            {skills?.backend?.map(s => <span key={s} className="bg-slate-100 px-3 py-1.5 text-xs font-semibold rounded">{s}</span>)}
                        </div>
                        <div className="font-bold pt-1">Front-end</div>
                        <div className="flex flex-wrap gap-2">
                            {skills?.frontend?.map(s => <span key={s} className="bg-slate-200 px-3 py-1 rounded-sm text-[13px] font-medium text-slate-800">{s}</span>)}
                        </div>
                        <div className="font-bold pt-1">Soft skills</div>
                        <ul className="list-disc ml-5 flex flex-col gap-1.5">
                            {skills?.soft?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                        {skills?.other?.length > 0 && <>
                            <div className="font-bold pt-1">Other skills</div>
                            <div className="flex flex-wrap gap-2">
                                {skills.other.map((s, i) => <span key={i} className="bg-slate-100 px-3 py-1.5 text-xs font-semibold rounded">{s}</span>)}
                            </div>
                        </>}
                    </div>
                </div>
            </div>
        </div>
    );
}
