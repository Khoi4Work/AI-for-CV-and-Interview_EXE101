import { Mail, MapPin, Phone, Globe, Calendar } from 'lucide-react';

export default function Template4({ data }) {
    if (!data) return null;
    const { name, title, contact, summary, education, skillsGrouped, experience, certificates } = data;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-2xl min-h-[1100px] flex print:shadow-none print:w-full font-sans text-slate-800">

            {/* Left Sidebar - Dark Blue */}
            <div className="w-[35%] bg-[#0B2039] text-white flex flex-col pt-10">

                <div className="px-8 mb-8 pb-8 border-b border-white/20">
                    <h1 className="text-3xl font-bold leading-tight mb-2">{name}</h1>
                    <h2 className="text-xs tracking-widest text-[#A2CAEA] uppercase">{title}</h2>
                </div>

                <div className="px-8 flex flex-col gap-6 text-[13px]">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-[#A2CAEA]" /> <span>{contact?.phone}</span></div>
                        <div className="flex items-center gap-2"><Mail size={14} className="text-[#A2CAEA]" /> <span className="break-all">{contact?.email}</span></div>
                        <div className="flex items-center gap-2"><Calendar size={14} className="text-[#A2CAEA]" /> <span>{contact?.dob}</span></div>
                        <div className="flex items-center gap-2"><MapPin size={14} className="text-[#A2CAEA]" /> <span>{contact?.location}</span></div>
                        <div className="flex items-center gap-2"><Globe size={14} className="text-[#A2CAEA]" /> <span className="break-all">{contact?.linkedin?.replace('linkedin.com/in/', '')}</span></div>
                    </div>

                    <div className="pt-4">
                        <h3 className="font-bold text-sm tracking-wider uppercase mb-4 text-[#A2CAEA]">Education</h3>
                        {education?.map((edu, idx) => (
                            <div key={idx} className="mb-3">
                                <div className="font-bold mb-1 leading-snug">{edu.school}</div>
                                <div className="text-white/80 font-medium mb-1">{edu.degree}</div>
                                <div className="text-white/60 text-[11px] mb-1">{edu.dates}</div>
                                <div className="text-white/60 text-[11px]">GPA {edu.gpa}</div>
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
                                <div className="font-bold mb-1">{cert.name}</div>
                                <div className="text-white/80 mb-1">{cert.issuer}</div>
                                <div className="text-white/60 text-[11px]">{cert.date}</div>
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
                        <p className="text-[13px] text-slate-600 leading-relaxed text-justify">{summary}</p>
                    </div>
                    <div className="w-24 h-24 rounded-full bg-slate-200 shrink-0"></div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-slate-800 uppercase text-sm mb-4 border-b border-slate-200 pb-1">Work Experience</h3>
                    <div className="flex flex-col gap-6 border-l-2 border-slate-200 ml-1 pl-4">
                        {experience?.slice(0,2).map((exp, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute w-2 h-2 rounded-full bg-blue-600 -left-[21px] top-1"></div>
                                <div className="text-[13px] font-bold text-blue-600 mb-1">{exp.title}</div>
                                <div className="text-[12px] font-bold text-slate-600 mb-2">{exp.company} <span className="font-normal text-slate-400">| {exp.dates}</span></div>
                                <ul className="list-disc ml-4 text-[13px] flex flex-col gap-1.5 text-slate-600">
                                    {exp.bullets?.map((b,i)=><li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-slate-800 uppercase text-sm mb-4 border-b border-slate-200 pb-1">Personal Project</h3>
                    <div className="flex flex-col gap-5 border-l-2 border-slate-200 ml-1 pl-4">
                        {data.projectsList?.map((proj, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute w-2 h-2 rounded-full bg-[#0B2039] -left-[21px] top-1"></div>
                                <div className="text-[13px] font-bold text-slate-800 mb-1">{proj.name} <span className="font-normal text-slate-500">| {proj.dates}</span></div>
                                <div className="text-[13px] text-slate-600 mb-2"><span className="font-bold">Project description:</span> {proj.bullets?.[0]}</div>
                                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-[12px] text-blue-600 underline font-medium">View project</a>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
