import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';

export default function Template5_PortfolioHybrid({ data }) {
    if (!data) return null;
    const { name, title, contact, summaryAlt, skills, experience3, education, projectsListAlt, certificates } = data;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-lg min-h-[1100px] flex print:shadow-none print:w-full font-sans text-slate-800">

            {/* Left Sidebar - Teal */}
            <div className="w-[35%] bg-[#1b5e60] text-white p-10 flex flex-col gap-10">

                <div className="flex flex-col items-center">
                    <div className="w-32 h-32 bg-teal-800 rounded-sm overflow-hidden shadow-xl relative border-[3px] border-white/20">
                        {/* Photo Placeholder */}
                        <div className="absolute inset-0 bg-slate-300"></div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 text-[12px] font-medium text-teal-50">
                    <div className="flex items-center gap-3"><Phone size={14} className="text-white" /> {contact?.phone}</div>
                    <div className="flex items-center gap-3"><Mail size={14} className="text-white" /> <span className="break-all">{contact?.email}</span></div>
                    <div className="flex items-center gap-3"><Calendar size={14} className="text-white" /> {contact?.dob}</div>
                    <div className="flex items-center gap-3"><MapPin size={14} className="text-white" /> {contact?.location}</div>
                    <div className="flex items-center gap-3"><Globe size={14} className="text-white" /> <span className="break-all">{contact?.linkedin?.replace("linkedin.com/in/", "")}</span></div>
                </div>

                <div className="border-t border-teal-700 pt-8">
                    <h3 className="font-bold text-[16px] tracking-widest uppercase mb-6 text-white border-l-4 border-white pl-3 leading-none">SKILL</h3>

                    <div className="mb-6">
                        <div className="font-bold text-teal-100 mb-2 text-[13px]">Back-end</div>
                        <div className="flex flex-wrap gap-1.5">
                            {skills?.backend?.map(s => <span key={s} className="border border-teal-600 px-2 py-1 rounded text-[11px] font-medium bg-teal-800/50">{s}</span>)}
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="font-bold text-teal-100 mb-2 text-[13px]">Front-end</div>
                        <div className="flex flex-wrap gap-1.5">
                            {skills?.frontend?.map(s => <span key={s} className="border border-teal-600 px-2 py-1 rounded text-[11px] font-medium bg-teal-800/50">{s}</span>)}
                        </div>
                    </div>

                    <div>
                        <div className="font-bold text-teal-100 mb-2 text-[13px]">Soft Skills</div>
                        <ul className="list-disc ml-4 text-[12px] flex flex-col gap-1 text-teal-50">
                            {skills?.soft?.map((s,i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-teal-700 pt-8 mt-auto">
                    <h3 className="font-bold text-[16px] tracking-widest uppercase mb-4 text-white border-l-4 border-white pl-3 leading-none">EDUCATION</h3>
                    {education?.map((edu, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="font-bold text-[13px] mb-1">{edu.school}</div>
                            <div className="text-[11px] text-teal-200 mb-1">{edu.dates}</div>
                            <div className="text-[12px]">{edu.degree}</div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Right Content */}
            <div className="w-[65%] p-10 pt-12 relative font-sans">

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-slate-800 mb-2 leading-none">{name}</h1>
                    <h2 className="text-[17px] text-slate-500 mb-6">{title}</h2>
                    <p className="text-[13px] leading-relaxed text-slate-700">{summaryAlt}</p>
                </div>

                <div className="mb-10">
                    <h3 className="text-lg font-bold uppercase mb-6 pb-2 text-[#1b5e60] tracking-widest border-b-[3px] border-slate-100">WORK EXPERIENCE</h3>
                    <div className="flex flex-col gap-8">
                        {experience3?.slice(0,2).map((exp, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute w-[3px] h-full bg-slate-100 -left-6 top-0 hidden"></div>
                                <div className="flex justify-between font-bold text-[14px] text-slate-800 mb-1 bg-slate-50 p-2 rounded">
                                    <div>{exp.title} | <span className="font-normal text-[#1b5e60] uppercase text-xs">{exp.company}</span></div>
                                    <span className="text-xs text-slate-500 font-medium whitespace-nowrap">{exp.dates}</span>
                                </div>
                                <ul className="list-disc ml-5 mt-3 text-[13px] text-slate-700 flex flex-col gap-1.5">
                                    {exp.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-bold uppercase mb-6 pb-2 text-[#1b5e60] tracking-widest border-b-[3px] border-slate-100">HIGHLIGHT PROJECT</h3>
                    <div className="flex flex-col gap-6">
                        {projectsListAlt?.map((proj, idx) => (
                            <div key={idx}>
                                <div className="flex gap-2 items-center mb-1">
                                    <h4 className="font-bold text-[14px] text-slate-800">{proj.name}</h4>
                                    <span className="text-xs text-slate-500 ml-auto">{proj.dates}</span>
                                </div>
                                <ul className="list-disc ml-5 text-[13px] text-slate-700 flex flex-col gap-1.5 mb-2 mt-2">
                                    {proj.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
