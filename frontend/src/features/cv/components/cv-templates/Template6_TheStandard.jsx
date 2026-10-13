import { Globe, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { useCV } from '../../contexts/CVContext.jsx';
import EditableText from '../EditableText.jsx';
import ProfilePhotoPicker from '../ProfilePhotoPicker.jsx';
import SkillCategoryList from '../SkillCategoryList.jsx';
import { hasDetails, hasSkills, hasText } from './templateDataUtils.js';

export default function Template6_TheStandard({ data }) {

    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateExperience,
        updateExperienceDetail,
        updateEducation,
        updateProjects,
        updateAwards,
        updateCertificates
    } = useCV();

    if (!cvData) return null;

    const { title, skills, profilePhoto } = data || {};
    const { personalInfo, summary } = cvData;
    const contact = personalInfo || {};
    const experiences = Array.isArray(cvData.experiences) ? cvData.experiences : [];
    const education = Array.isArray(cvData.education) ? cvData.education : [];
    const certificates = Array.isArray(cvData.certificates) ? cvData.certificates : [];
    const languages = Array.isArray(cvData.languages) ? cvData.languages : [];
    const awards = Array.isArray(cvData.awards) ? cvData.awards : [];
    const projects = Array.isArray(cvData.projects) ? cvData.projects : [];
    const visibleExperiences = experiences.map((experience, index) => ({ experience, index })).filter(({ experience }) => experience && (hasText(experience.role) || hasText(experience.company) || hasText(experience.period) || hasDetails(experience.details)));
    const visibleProjects = projects.map((project, index) => ({ project, index })).filter(({ project }) => project && (hasText(project.name) || hasText(project.period) || hasText(project.url) || hasDetails(project.details)));
    const visibleEducation = education.filter(item => item && (hasText(item.school) || hasText(item.degree) || hasText(item.year) || hasText(item.gpa)));
    const visibleCertificates = certificates.filter(item => item && (hasText(item.name) || hasText(item.issuer) || hasText(item.date) || hasText(item.url)));
    const visibleLanguages = languages.filter(item => item && (hasText(item.name) || hasText(item.level)));
    const visibleAwards = awards.filter(item => item && (hasText(item.name) || hasText(item.issuer) || hasText(item.date)));
    const shouldShowSkills = hasSkills(skills);

    return (
        <div className="overflow-x-auto w-full">
            <div className="max-w-full md:max-w-[1000px] mx-auto bg-white shadow-lg min-h-[1800px] flex print:shadow-none print:w-full font-sans text-slate-800">

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
                        {hasText(title) && <h2 className="text-[14px] font-semibold tracking-[0.2em] uppercase text-white/80 mb-6">
                            <EditableText value={title} onChange={() => {}} className="text-white/80" />
                        </h2>}
                        {hasText(summary) && <EditableText
                            multiline
                            value={summary}
                            onChange={updateSummary}
                            className="text-[13px] text-white/90 leading-relaxed max-w-[90%]"
                        />}
                    </div>

                    {/* Content in Left Column */}
                    <div className="p-10 pt-8 bg-white flex-1">
                        {shouldShowSkills && <div className="mb-8">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-[#564234] border-b-2 border-slate-100 pb-2 mb-6">SKILL</h3>
                            <SkillCategoryList skills={skills} layout="rows" className="grid-cols-[100px_1fr] text-[13px]" />
                        </div>}

                        {visibleExperiences.length > 0 && <div>
                            <h3 className="text-lg font-bold uppercase tracking-widest text-[#564234] border-b-2 border-slate-100 pb-2 mb-6">WORK EXPERIENCE</h3>
                            <div className="flex flex-col gap-6 relative border-l-2 border-[#564234] ml-2 pl-5">
                                {visibleExperiences.map(({ experience: exp, index }) => (
                                    <div key={exp.id ?? index} className="relative">
                                        <div className="absolute w-3 h-3 bg-[#564234] rounded-full -left-[27px] top-1.5"></div>

                                        {hasText(exp.period) && <div className="text-xs font-bold text-slate-500 mb-1">
                                            <EditableText value={exp.period} onChange={(val) => updateExperience(exp.id, 'period', val)} />
                                        </div>}
                                        {(hasText(exp.role) || hasText(exp.company)) && <div className="text-[15px] font-bold text-[#564234] mb-3">
                                            {hasText(exp.role) && <EditableText value={exp.role} onChange={(val) => updateExperience(exp.id, 'role', val)} />}
                                            {hasText(exp.company) && <span className="font-normal text-slate-600 leading-normal block">at
                                                <EditableText value={exp.company} onChange={(val) => updateExperience(exp.id, 'company', val)} />
                                            </span>}
                                        </div>}

                                        {hasDetails(exp.details) && <ul className="list-disc ml-4 text-[13px] flex flex-col gap-2 mb-4">
                                            {exp.details.map((detail, detailIndex) => ({ detail, detailIndex })).filter(({ detail }) => hasText(detail)).map(({ detail, detailIndex }) => (
                                                <li key={detailIndex}>
                                                    <EditableText multiline value={detail} onChange={(val) => updateExperienceDetail(exp.id, detailIndex, val)} />
                                                </li>
                                            ))}
                                        </ul>}
                                    </div>
                                ))}
                            </div>
                        </div>}

                        {visibleProjects.length > 0 && <div className="mt-8">
                            <h3 className="text-lg font-bold uppercase tracking-widest text-[#564234] border-b-2 border-slate-100 pb-2 mb-6">PROJECTS</h3>
                            <div className="flex flex-col gap-6 relative border-l-2 border-[#564234] ml-2 pl-5">
                                {visibleProjects.map(({ project, index }) => (
                                    <div key={`${project.name || 'project'}-${index}`} className="relative">
                                        <div className="absolute w-3 h-3 bg-[#564234] rounded-full -left-[27px] top-1.5"></div>
                                        {hasText(project.period) && <div className="text-xs font-bold text-slate-500 mb-1"><EditableText value={project.period} onChange={value => {
                                            const updated = [...projects];
                                            updated[projects.indexOf(project)] = { ...project, period: value };
                                            updateProjects(updated);
                                        }} /></div>}
                                        {hasText(project.name) && <div className="text-[15px] font-bold text-[#564234] mb-2"><EditableText value={project.name} onChange={value => {
                                            const updated = [...projects];
                                            updated[projects.indexOf(project)] = { ...project, name: value };
                                            updateProjects(updated);
                                        }} /></div>}
                                        {hasDetails(project.details) && <ul className="list-disc ml-4 text-[13px] flex flex-col gap-2">
                                            {project.details.map((detail, detailIndex) => ({ detail, detailIndex })).filter(({ detail }) => hasText(detail)).map(({ detail, detailIndex }) => <li key={detailIndex}><EditableText multiline value={detail} onChange={value => {
                                                const updated = [...projects];
                                                const projectIndex = index;
                                                updated[projectIndex] = { ...project, details: project.details.map((item, itemIndex) => itemIndex === detailIndex ? value : item) };
                                                updateProjects(updated);
                                            }} /></li>)}
                                        </ul>}
                                        {hasText(project.url) && <div className="mt-2 break-all text-sm text-[#564234] underline"><EditableText value={project.url} onChange={value => {
                                            const updated = [...projects];
                                            updated[projects.indexOf(project)] = { ...project, url: value };
                                            updateProjects(updated);
                                        }} /></div>}
                                    </div>
                                ))}
                            </div>
                        </div>}
                    </div>
                </div>

                {/* Right Column - Light Gray */}
                <div className="w-[40%] bg-[#f4f4f4] p-10 pt-16 flex flex-col gap-10 border-l border-slate-200">

                    <div className="flex flex-col items-center mb-2">
                        <ProfilePhotoPicker variant="frame" photo={profilePhoto} className="w-[180px] h-[180px] rounded-full overflow-hidden shadow-sm" />
                    </div>

                    <div className="flex flex-col gap-4 text-[13px] font-medium text-slate-600">
                        {hasText(contact.phone) && <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Phone size={14} className="text-slate-500" /></div> <EditableText value={contact.phone} onChange={(val) => updatePersonalInfo({phone: val})} /></div>}
                        {hasText(contact.email) && <div className="flex min-w-0 items-center gap-3"><div className="shrink-0 border border-slate-300 p-1.5 rounded-full bg-white"><Mail size={14} className="text-slate-500" /></div> <span className="min-w-0 flex-1"><EditableText value={contact.email} onChange={(val) => updatePersonalInfo({email: val})} className="min-w-0 break-words" /></span></div>}
                        {hasText(contact.dob) && <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Calendar size={14} className="text-slate-500" /></div> <EditableText value={contact.dob} onChange={(val) => updatePersonalInfo({dob: val})} /></div>}
                        {hasText(contact.address) && <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><MapPin size={14} className="text-slate-500" /></div> <EditableText value={contact.address} onChange={(val) => updatePersonalInfo({address: val})} /></div>}
                        {hasText(contact.linkedin) && <div className="flex items-center gap-3"><div className="border border-slate-300 p-1.5 rounded-full bg-white"><Globe size={14} className="text-slate-500" /></div> <span className="break-all"><EditableText value={contact.linkedin} onChange={(val) => updatePersonalInfo({linkedin: val})} /></span></div>}
                    </div>

                    {visibleEducation.length > 0 && <div>
                        <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">EDUCATION</h3>
                        {visibleEducation.map((edu) => {
                            const idx = education.indexOf(edu);
                            return (
                            <div key={idx} className="mb-3">
                                {hasText(edu.school) && <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">
                                    <EditableText value={edu.school} onChange={(val) => updateEducation(idx, 'school', val)} />
                                </div>}
                                {hasText(edu.degree) && <div className="text-[13px] font-medium text-slate-700 mb-1">
                                    <EditableText value={edu.degree} onChange={(val) => updateEducation(idx, 'degree', val)} />
                                </div>}
                                {hasText(edu.year) && <div className="text-[12px] text-slate-500 mb-1">
                                    <EditableText value={edu.year} onChange={(val) => updateEducation(idx, 'year', val)} />
                                </div>}
                                {hasText(edu.gpa) && <div className="text-[12px] font-medium">
                                    <EditableText value={edu.gpa} onChange={(val) => updateEducation(idx, 'gpa', val)} />
                                </div>}
                            </div>
                        )})}
                    </div>}

                    {visibleCertificates.length > 0 && <div>
                        <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">CERTIFICATE</h3>
                        {visibleCertificates.map((cert) => {
                            const idx = certificates.indexOf(cert);
                            return (
                            <div key={idx} className="mb-4">
                                {hasText(cert.name) && <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">
                                    <EditableText
                                        value={cert.name}
                                        onChange={(val) => {
                                            const updated = [...certificates];
                                            updated[idx] = { ...cert, name: val };
                                            updateCertificates(updated);
                                        }}
                                    />
                                </div>}
                                {hasText(cert.issuer) && <div className="text-[13px] font-medium text-slate-700 mb-1">
                                    <EditableText
                                        value={cert.issuer}
                                        onChange={(val) => {
                                            const updated = [...certificates];
                                            updated[idx] = { ...cert, issuer: val };
                                            updateCertificates(updated);
                                        }}
                                    />
                                </div>}
                                {hasText(cert.date) && <div className="text-[12px] text-slate-500 mb-2">
                                    <EditableText
                                        value={cert.date}
                                        onChange={(val) => {
                                            const updated = [...certificates];
                                            updated[idx] = { ...cert, date: val };
                                            updateCertificates(updated);
                                        }}
                                    />
                                </div>}
                                {hasText(cert.url) && <a href={cert.url} target="_blank" rel="noreferrer" className="text-[12px] text-[#564234] underline font-semibold">View certificate</a>}
                            </div>
                        )})}
                    </div>}

                    {visibleLanguages.length > 0 && <div>
                        <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">FOREIGN LANGUAGE</h3>
                        <div className="flex flex-col gap-2 text-[13px]">
                            {visibleLanguages.map((l, i) => (
                                <div key={i} className="flex gap-2">
                                    {hasText(l.name) && <span className="font-bold text-[#564234]">{l.name}</span>}
                                    {hasText(l.level) && <span className="text-slate-500">{l.level}</span>}
                                </div>
                            ))}
                        </div>
                    </div>}

                    {visibleAwards.length > 0 && <div>
                        <h3 className="text-[15px] font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-300 pb-2 mb-4">AWARD</h3>
                        {visibleAwards.map((award) => {
                            const idx = awards.indexOf(award);
                            return (
                            <div key={idx} className="mb-3">
                                {hasText(award.name) && <div className="font-bold text-[14px] text-[#564234] mb-1 leading-snug">
                                    <EditableText
                                        value={award.name}
                                        onChange={(val) => {
                                            const updated = [...awards];
                                            updated[idx] = { ...award, name: val };
                                            updateAwards(updated);
                                        }}
                                    />
                                </div>}
                                {hasText(award.issuer) && <div className="text-[13px] font-medium text-slate-700 mb-1">
                                    <EditableText
                                        value={award.issuer}
                                        onChange={(val) => {
                                            const updated = [...awards];
                                            updated[idx] = { ...award, issuer: val };
                                            updateAwards(updated);
                                        }}
                                    />
                                </div>}
                                {hasText(award.date) && <div className="text-[12px] text-slate-500">
                                    <EditableText
                                        value={award.date}
                                        onChange={(val) => {
                                            const updated = [...awards];
                                            updated[idx] = { ...award, date: val };
                                            updateAwards(updated);
                                        }}
                                    />
                                </div>}
                            </div>
                        )})}
                    </div>}

                </div>

            </div>
        </div>
    );
}
