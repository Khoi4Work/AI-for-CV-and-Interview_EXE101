import { Briefcase, Globe, Mail, MapPin, Phone, Wrench, Calendar } from 'lucide-react';

export default function Template2_BoardroomReady({ data }) {
    if (!data) return null;
    const { name, title, contact, summaryAlt, skills, experience2 } = data;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-lg min-h-[1100px] p-10 print:shadow-none print:w-full font-sans text-slate-800">

            <div className="flex justify-between items-start mb-8 border-b-2 border-slate-100 pb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-600 mb-2">{name}</h1>
                    <h2 className="text-[15px] font-semibold tracking-widest uppercase text-slate-500">{title}</h2>
                </div>
                <div className="flex flex-col gap-1.5 text-[13px] text-slate-600 font-medium whitespace-nowrap pt-2">
                    <div className="flex items-center gap-2"><Phone size={14} /> {contact?.phone}</div>
                    <div className="flex items-center gap-2"><Mail size={14} /> {contact?.email}</div>
                    <div className="flex items-center gap-2"><Calendar size={14} /> {contact?.dob}</div>
                    <div className="flex items-center gap-2"><MapPin size={14} /> {contact?.location}</div>
                    <div className="flex items-center gap-2"><Globe size={14} /> {contact?.linkedin?.replace("linkedin.com/in/", "")}</div>
                </div>
            </div>

            <div className="mb-8 pl-1">
                <p className="text-[14px] leading-relaxed text-slate-700">{summaryAlt}</p>
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

            <div>
                <div className="flex items-center gap-3 bg-slate-100 p-2 rounded mb-6">
                    <div className="bg-slate-700 text-white p-1 rounded"><Briefcase size={18} /></div>
                    <h3 className="text-lg font-bold text-slate-800">WORK EXPERIENCE</h3>
                </div>

                <div className="px-2">
                    {experience2?.map((exp, idx) => (
                        <div key={idx} className="mb-8">
                            <div className="flex justify-between font-bold border-b border-slate-200 pb-2 mb-4 bg-slate-50 p-2 text-[15px]">
                                <div className="text-slate-700">{exp.title}</div>
                                <div className="text-slate-900">{exp.company}</div>
                                <div className="text-slate-700">{exp.dates}</div>
                            </div>

                            <ul className="list-disc ml-8 text-[14px] flex flex-col gap-2 mb-6">
                                {exp.bullets?.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>

                            {exp.project1 && (
                                <div className="mb-6">
                                    <div className="uppercase font-bold text-[13px] mb-3 tracking-wider">PROJECT:</div>
                                    <div className="mb-4">
                                        <div className="font-bold text-[14px] mb-2">{exp.project1.name} | <span className="font-normal text-slate-600">{exp.project1.dates}</span></div>
                                        <ul className="list-disc ml-8 text-[13px] flex flex-col gap-1.5">
                                            <li><strong className="font-semibold">Project description:</strong> {exp.project1.description}</li>
                                            <li><strong className="font-semibold">Responsibilities:</strong> {exp.project1.responsibilities}</li>
                                            <li><strong className="font-semibold">Tech stack:</strong> {exp.project1.techStack}</li>
                                            <li><strong className="font-semibold">Team size:</strong> {exp.project1.teamSize}</li>
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {exp.project2 && (
                                <div className="mb-6">
                                    <div className="font-bold text-[14px] mb-2">{exp.project2.name} | <span className="font-normal text-slate-600">{exp.project2.dates}</span></div>
                                    <ul className="list-disc ml-8 text-[13px] flex flex-col gap-1.5">
                                        <li><strong className="font-semibold">Project description:</strong> {exp.project2.description}</li>
                                        <li>
                                            <strong className="font-semibold">Responsibilities:</strong>
                                            <ul className="list-disc ml-5 mt-1">
                                                {exp.project2.responsibilitiesList?.map((r,i) => <li key={i}>{r}</li>)}
                                            </ul>
                                        </li>
                                        <li><strong className="font-semibold">Tech stack:</strong> {exp.project2.techStack}</li>
                                        <li><strong className="font-semibold">Team size:</strong> {exp.project2.teamSize}</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
