import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';

export default function Template1_DataScientist({ data }) {
    if (!data) return null;
    const { name, title, contact, summary, skills, experience1, education } = data;

    return (
        <div className="max-w-[850px] mx-auto bg-white shadow-lg min-h-[1350px] p-12 print:shadow-none print:w-full font-sans text-slate-800">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold mb-2">{name}</h1>
                <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-600 mb-6">{title}</h2>
                <div className="flex flex-wrap justify-center items-center gap-4 text-[13px] text-slate-600">
                    <div className="flex items-center gap-1.5"><Phone size={14} /> {contact?.phone}</div>
                    <div className="flex items-center gap-1.5"><Mail size={14} /> {contact?.email}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={14} /> {contact?.dob}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={14} /> {contact?.location}</div>
                    <div className="flex items-center gap-1.5"><Globe size={14} /> {contact?.linkedin?.replace("linkedin.com/in/", "")}</div>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold uppercase border-b-[3px] border-slate-900 mb-4 pb-1">About Me</h3>
                <p className="text-[14px] leading-relaxed text-justify">{summary}</p>
            </div>

            <div className="mb-8">
                <h3 className="text-lg font-bold uppercase border-b-[3px] border-slate-900 mb-4 pb-1">Work Experience</h3>
                <div className="flex flex-col gap-6">
                    {experience1?.map((exp, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between font-bold mb-2 text-sm">
                                <div>{exp.title}<br/><span className="text-slate-800 text-[15px]">{exp.company}</span></div>
                                <div className="text-slate-900">{exp.dates}</div>
                            </div>
                            <ul className="list-disc ml-5 text-[14px] flex flex-col gap-1.5">
                                {exp.bullets?.map((b, i) => <li key={i}>{b}</li>)}
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
                            <div>
                                <div className="font-bold text-[15px] mb-1">{edu.school}</div>
                                <div className="font-semibold text-slate-800">{edu.degree}</div>
                                <div className="text-slate-600">{edu.gpa}</div>
                            </div>
                            <div className="font-bold text-sm whitespace-nowrap">{edu.dates}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold uppercase border-b-[3px] border-slate-900 mb-4 pb-1">Skill</h3>
                <div className="grid grid-cols-[140px_1fr] gap-y-6 text-[14px]">
                    <div className="font-bold pt-1">Back-end</div>
                    <div className="flex flex-wrap gap-2">
                        {skills?.backend?.map(s => <span key={s} className="bg-slate-100 px-3 py-1.5 text-xs font-semibold rounded">{s}</span>)}
                    </div>
                    <div className="font-bold pt-1">Front-end</div>
                    <div className="flex flex-wrap gap-2">
                        {skills?.frontend?.map(s => <span key={s} className="bg-slate-100 px-3 py-1.5 text-xs font-semibold rounded">{s}</span>)}
                    </div>
                    <div className="font-bold pt-1">Soft skills</div>
                    <ul className="list-disc ml-5 flex flex-col gap-1.5">
                        {skills?.soft?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
}
