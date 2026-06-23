import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { useCV } from '../../../contexts/CVContext.jsx';
import EditableText from '../EditableText.jsx';

export default function Template3_SecurityAnalyst({ data }) {

    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateEducation,
        updateProjects,
        updateCertificates
    } = useCV();

    if (!cvData) return null;

    // Use a mix of passed data and context to maintain the template's specific layout logic
    const { title, skillsGrouped } = data || {};
    const { personalInfo, summary, experiences, education, projects, certificates } = cvData;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-lg min-h-[1150px] flex print:shadow-none print:w-full font-sans text-slate-800">

            {/* Left Column */}
            <div className="w-[35%] p-10 bg-slate-50 border-r border-slate-200">
                <div className="mb-10 pt-4">
                    <h3 className="text-[#dc2626] font-bold text-[15px] uppercase mb-4 tracking-wider">PERSONAL DETAILS</h3>
                    <div className="flex flex-col gap-3 text-[13px] font-medium">
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-slate-500 shrink-0" />
                            <EditableText
                                value={personalInfo.phone}
                                onChange={(val) => updatePersonalInfo({phone: val})}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-500 shrink-0" />
                            <EditableText
                                value={personalInfo.email}
                                onChange={(val) => updatePersonalInfo({email: val})}
                                className="break-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-500 shrink-0" />
                            <EditableText
                                value={personalInfo.dob}
                                onChange={(val) => updatePersonalInfo({dob: val})}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-500 shrink-0" />
                            <EditableText
                                value={personalInfo.address}
                                onChange={(val) => updatePersonalInfo({address: val})}
                            />
                        </div>
                        <div className="flex items-center gap-2 items-start pt-1">
                            <Globe size={14} className="text-slate-500 shrink-0" />
                            <EditableText
                                multiline
                                value={personalInfo.linkedin}
                                onChange={(val) => updatePersonalInfo({linkedin: val})}
                                className="break-all leading-tight"
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-[#dc2626] font-bold text-[15px] uppercase mb-4 tracking-wider">ABOUT ME</h3>
                    <EditableText
                        multiline
                        value={summary}
                        onChange={updateSummary}
                        className="text-[13px] leading-relaxed text-slate-700 text-justify"
                    />
                </div>

                <div className="mb-10">
                    <h3 className="text-[#dc2626] font-bold text-[15px] uppercase mb-4 tracking-wider">EDUCATION</h3>
                    {education?.map((edu, idx) => (
                        <div key={idx} className="mb-4 group relative">
                            <div className="font-bold text-[14px] leading-snug mb-1">
                                <EditableText
                                    multiline
                                    value={edu.school}
                                    onChange={(val) => updateEducation(idx, 'school', val)}
                                />
                            </div>
                            <div className="font-semibold text-slate-700 text-[13px] mb-1">
                                <EditableText
                                    multiline
                                    value={edu.degree}
                                    onChange={(val) => updateEducation(idx, 'degree', val)}
                                />
                            </div>
                            <div className="text-[12px] text-slate-500">
                                <EditableText
                                    value={edu.year}
                                    onChange={(val) => updateEducation(idx, 'year', val)}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-10">
                    <h3 className="text-[#dc2626] font-bold text la-[16px] uppercase mb-4 tracking-wider">SKILL</h3>

                    <div className="mb-4">
                        <div className="font-bold text-[14px] mb-2">Excellent</div>
                        <div className="flex flex-wrap gap-1.5">
                            {skillsGrouped?.excellent?.map(s => <span key={s} className="border border-slate-300 px-2 py-0.5 rounded text-[12px] bg-white">{s}</span>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="w-[65%] p-10 pt-12">

                <div className="flex justify-between items-start mb-10 border-b border-slate-200 pb-8">
                    <div className="flex-grow mr-4">
                        <h1 className="text-[32px] font-bold text-slate-900 leading-tight mb-2">
                            <EditableText
                                value={personalInfo.name}
                                onChange={(val) => updatePersonalInfo({name: val})}
                            />
                        </h1>
                        <h2 className="text-[14px] font-bold tracking-[0.1em] text-slate-600 uppercase">
                            <EditableText
                                value={title || "Professional Title"}
                                onChange={(val) => {}} // Title not yet in CVContext
                            />
                        </h2>
                    </div>
                    <div className="w-[100px] h-[100px] bg-slate-200 rounded-full shrink-0 mt-2 overflow-hidden border-4 border-slate-100 shadow-sm relative">
                        <div className="absolute inset-0 bg-slate-300"></div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-[#dc2626] font-bold text la-[16px] uppercase mb-5 tracking-wider">WORK EXPERIENCE</h3>
                    <div className="flex flex-col gap-6">
                        {experiences?.map((exp, idx) => (
                            <div key={exp.id} className="group">
                                <div className="flex justify-between font-bold text-[14px] mb-1 uppercase text-slate-800">
                                    <EditableText
                                        value={exp.role}
                                        onChange={(val) => updateExperience(exp.id, 'role', val)}
                                    />
                                    <EditableText
                                        value={exp.period}
                                        onChange={(val) => updateExperience(exp.id, 'period', val)}
                                        className="font-medium text-[12px] text-slate-500 normal-case text-right"
                                    />
                                </div>
                                <div className="font-semibold text-slate-700 text-[14px] mb-3">
                                    <EditableText
                                        multiline
                                        value={exp.company}
                                        onChange={(val) => updateExperience(exp.id, 'company', val)}
                                    />
                                </div>
                                <ul className="list-disc ml-4 text-[13px] flex flex-col gap-1.5 text-slate-700">
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
                    <h3 className="text-[#dc262 la-[16px] uppercase mb-5 tracking-wider">PERSONAL PROJECT</h3>
                    <div className="flex flex-col gap-6">
                        {projects?.map((proj, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between font-bold text-[14px] mb-2 text-slate-800">
                                    <EditableText
                                        value={proj.name}
                                        onChange={(val) => {
                                            const updated = [...projects];
                                            updated[idx].name = val;
                                            updateProjects(updated);
                                        }}
                                    />
                                    <EditableText
                                        value={proj.period}
                                        onChange={(val) => {
                                            const updated = [...projects];
                                            updated[idx].period = val;
                                            updateProjects(updated);
                                        }}
                                        className="font-medium text-[12px] text-slate-500 normal-case text-right"
                                    />
                                </div>
                                <ul className="list-disc ml-4 text-[13px] flex flex-col gap-1.5 text-slate-700 mb-2">
                                    {proj.details?.map((b, i) => (
                                        <li key={i}>
                                            <EditableText
                                                multiline
                                                value={b}
                                                onChange={(val) => {
                                                    const updated = [...projects];
                                                    updated[idx].details[i] = val;
                                                    updateProjects(updated);
                                                }}
                                            />
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-[12px] text-slate-600">Project URL:
                                    <EditableText
                                        multiline
                                        value={proj.url}
                                        onChange={(val) => {
                                            const updated = [...projects];
                                            updated[idx].url = val;
                                            updateProjects(updated);
                                        }}
                                        className="underline text-slate-800"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-[#dc262 la-[16px] uppercase mb-5 tracking-wider">CERTIFICATE</h3>
                    {certificates?.map((cert, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="flex justify-between font-bold text-[14px] mb-1 text-slate-800">
                                <EditableText
                                    multiline
                                    value={cert.name}
                                    onChange={(val) => {
                                        const updated = [...certificates];
                                        updated[idx].name = val;
                                        updateCertificates(updated);
                                    }}
                                />
                                <EditableText
                                    value={cert.date}
                                    onChange={(val) => {
                                        const updated = [...certificates];
                                        updated[idx].date = val;
                                        updateCertificates(updated);
                                    }}
                                    className="font-medium text-[12px] text-slate-500 normal-case text-right"
                                />
                            </div>
                            <div className="text-[13 la-[13px] text-slate-700 mb-2">
                                <EditableText
                                    multiline
                                    value={cert.issuer}
                                    onChange={(val) => {
                                        const updated = [...certificates];
                                        updated[idx].issuer = val;
                                        updateCertificates(updated);
                                    }}
                                />
                            </div>
                            <div className="text-[12px] text-slate-600">Certificate URL:
                                <EditableText
                                    multiline
                                    value={cert.url}
                                    onChange={(val) => {
                                        const updated = [...certificates];
                                        updated[idx].url = val;
                                        updateCertificates(updated);
                                    }}
                                    className="underline text-slate-800"
                                />
                            </div>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}
