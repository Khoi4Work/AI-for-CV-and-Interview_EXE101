import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';

export default function Template6_TheStandard({ data }) {
    if (!data) return null;
    const { name, title, contact, summaryAlt, skills, experience2, education, certificates, languages, awards } = data;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-lg min-h-[1400px] flex print:shadow-none print:w-full font-sans text-slate-800 overflow-hidden">

            {/* Left Column */}
            <div className="w-[60%] flex flex-col">
                {/* Top Header Block Dark Brown */}
                <div className="bg-[#564234] text-white p-10 pt-12 pb-8">
                    <h1 className="text-4xl font-bold leading-tight mb-2 uppercase">{name}</h1>
                    <h2 className="text-[14px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-6">{title}</h2>
                    <p className="text-[13px] text-white/90 leading-relaxed max-w-[90%]">{summaryAlt}</p>
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
                            {experience2?.map((exp, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute w-3 h-3 bg-[#564234] rounded-full -left-[27px] top-1.5"></div>

                                    <div className="text-xs font-bold text-slate-500 mb-1">{exp.dates}</div>
                                    <div className="text-[15px] font-bold text-[#564234] mb-3">{exp.title} <span className="font-normal text-slate-600 leading-normal block">at {exp.company}</span></div>

                                    <ul className="list-disc ml-4 text-[13px] flex flex-col gap-2 mb-4">
                                        {exp.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                                    </ul>

                                    {exp.project1 && (
                                        <div className="mb-4">
                                            <div className="uppercase font-bold text-[12px] tracking-wider mb-2">PROJECT:</div>
                                            <div className="font-bold text-[13px] mb-1">{exp.project1.name} | <span className="font-normal text-slate-500">{exp.project1.dates}</span></div>
                                            <ul className="list-disc ml-4 text-[12px] flex flex-col gap-1.5 text-slate-700">
                                                <li><strong className="font-semibold">Project description:</strong> {exp.project1.description}</li>
                                                <li><strong className="font-semibold">Responsibilities:</strong> {exp.project1.responsibilities}</li>
                                                <li><strong className="font-semibold">Tech stack:</strong> {exp.project1.techStack}</li>
                                                <li><strong className="font-semibold">Team size:</strong> {exp.project1.teamSize}</li>
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
                        {/* Photo Placeholder */}
                        <div className="absolute inset-0 bg-slate-200"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 text-[13px] font-medium text-slate-600">
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Phone size={14} className="text-slate-500" /></div> {contact?.phone}</div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Mail size={14} className="text-slate-500" /></div> <span className="break-all">{contact?.email}</span></div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Calendar size={14} className="text-slate-500" /></div> {contact?.dob}</div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><MapPin size={14} className="text-slate-500" /></div> {contact?.location}</div>
                    <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Globe size={14} className="text-slate-500" /></div> <span className="break-all">{contact?.linkedin?.replace("linkedin.com/in/", "")}</span></div>
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">EDUCATION</h3>
                    {education?.map((edu, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">{edu.school}</div>
                            <div className="text-[13px] font-medium text-slate-700 mb-1">{edu.degree}</div>
                            <div className="text-[12px] text-slate-500 mb-1">{edu.dates}</div>
                            <div className="text-[12px] font-medium">{edu.gpa}</div>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">CERTIFICATE</h3>
                    {certificates?.map((cert, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">{cert.name}</div>
                            <div className="text-[13px] font-medium text-slate-700 mb-1">{cert.issuer}</div>
                            <div className="text-[12px] text-slate-500 mb-2">{cert.date}</div>
                            <a href="#" className="text-[12px] text-[#564234] underline font-semibold">View certificate</a>
                        </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">FOREIGN LANGUAGE</h3>
                    <div className="flex flex-col gap-2 text-[13px]">
                        {languages?.map((l, i) => (
                            <div key={i} className="flex gap-2">
                                <span className="font-bold text-[#564234]">{l.name}</span>
                                <span className="text-slate-500">({l.level})</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">AWARD</h3>
                    {awards?.map((award, idx) => (
                        <div key={idx} className="mb-3">
                            <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">{award.name}</div>
                            <div className="text-[13px] font-medium text-slate-700 mb-1">{award.issuer}</div>
                            <div className="text-[12px] text-slate-500">{award.date}</div>
                        </div>
                    ))}
                </div>

            </div>

        </div>
    );
}
