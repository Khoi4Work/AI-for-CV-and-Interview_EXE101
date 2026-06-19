import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';

export default function Template3_SecurityAnalyst({ data }) {
    if (!data) return null;
    const { name, title, contact, summaryAlt, skillsGrouped, experience3, education, projectsListAlt, certificates } = data;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-lg min-h-[1350px] flex print:shadow-none print:w-full font-sans text-slate-800">

            {/* Left Column */}
            <div className="w-[35%] p-10 bg-slate-50 border-r border-slate-200">
                <div className="mb-10 pt-4">
                    <h3 className="text-[#dc2626] font-bold text-[15px] uppercase mb-4 tracking-wider">PERSONAL DETAILS</h3>
                    <div className="flex flex-col gap-3 text-[13px] font-medium">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-slate-500" /> {contact?.phone}</div>
                        <div className="flex items-center gap-2"><Mail size={14} className="text-slate-500" /> <span className="break-all">{contact?.email}</span></div>
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-slate-500" /> {contact?.dob}</div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /> {contact?.location}</div>
                        <div className="flex items-center gap-2 items-start pt-1"><Globe size={14} className="text-slate-500 shrink-0" /> <span className="break-all leading-tight">{contact?.linkedin}</span></div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-[#dc2626] font-bold text-[15px] uppercase mb-4 tracking-wider">ABOUT ME</h3>
                    <p className="text-[13px] leading-relaxed text-slate-700 text-justify">{summaryAlt}</p>
                </div>

                <div className="mb-10">
                    <h3 className="text-[#dc2626] font-bold text-[15px] uppercase mb-4 tracking-wider">EDUCATION</h3>
                    {education?.map((edu, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="font-bold text-[14px] leading-snug mb-1">{edu.school}</div>
                            <div className="font-semibold text-slate-700 text-[13px] mb-1">{edu.degree}</div>
                            <div className="text-[12px] text-slate-500">{edu.dates}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-[#dc2626] font-bold text-[15px] uppercase mb-4 tracking-wider">SKILL</h3>

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
                    <div>
                        <h1 className="text-[32px] font-bold text-slate-900 leading-tight mb-2">{name}</h1>
                        <h2 className="text-[14px] font-bold tracking-[0.1em] text-slate-600 uppercase">{title}</h2>
                    </div>
                    <div className="w-[100px] h-[100px] bg-slate-200 rounded-full shrink-0 mt-2 overflow-hidden border-4 border-slate-100 shadow-sm relative">
                        {/* Photo placeholder */}
                        <div className="absolute inset-0 bg-slate-300"></div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-[#dc2626] font-bold text-[16px] uppercase mb-5 tracking-wider">WORK EXPERIENCE</h3>
                    <div className="flex flex-col gap-6">
                        {experience3?.map((exp, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between font-bold text-[14px] mb-1 uppercase text-slate-800">
                                    {exp.title}
                                    <span className="font-medium text-[12px] text-slate-500 normal-case">{exp.dates}</span>
                                </div>
                                <div className="font-semibold text-slate-700 text-[14px] mb-3">{exp.company}</div>
                                <ul className="list-disc ml-4 text-[13px] flex flex-col gap-1.5 text-slate-700">
                                    {exp.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-[#dc2626] font-bold text-[16px] uppercase mb-5 tracking-wider">PERSONAL PROJECT</h3>
                    <div className="flex flex-col gap-6">
                        {projectsListAlt?.map((proj, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between font-bold text-[14px] mb-2 text-slate-800">
                                    {proj.name}
                                    <span className="font-medium text-[12px] text-slate-500 normal-case">{proj.dates}</span>
                                </div>
                                <ul className="list-disc ml-4 text-[13px] flex flex-col gap-1.5 text-slate-700 mb-2">
                                    {proj.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                                <div className="text-[12px] text-slate-600">Project URL: <a href="#" className="underline text-slate-800">{proj.url}</a></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[#dc2626] font-bold text-[16px] uppercase mb-5 tracking-wider">CERTIFICATE</h3>
                    {certificates?.map((cert, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="flex justify-between font-bold text-[14px] mb-1 text-slate-800">
                                {cert.name}
                                <span className="font-medium text-[12px] text-slate-500 normal-case">{cert.date}</span>
                            </div>
                            <div className="text-[13px] text-slate-700 mb-2">{cert.issuer}</div>
                            <div className="text-[12px] text-slate-600">Certificate URL: <a href="#" className="underline text-slate-800">{cert.url}</a></div>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}
