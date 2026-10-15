import { ChevronDown, ChevronUp, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useCV } from '../contexts/CVContext.jsx';

const inputClass = 'w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({ label, value, onChange, multiline = false, type = 'text' }) {
    const Control = multiline ? 'textarea' : 'input';
    return <label className="block min-w-0 space-y-1.5 text-xs font-semibold text-on-surface-variant">
        <span>{label}</span>
        <Control
            className={`${inputClass} ${multiline ? 'min-h-24 resize-y' : ''}`}
            type={multiline ? undefined : type}
            maxLength={5000}
            value={value ?? ''}
            onChange={event => onChange(event.target.value)}
        />
    </label>;
}

function EditorSection({ title, children, open = false }) {
    return <details open={open} className="group border-b border-outline-variant last:border-b-0">
        <summary className="cursor-pointer list-none py-3 font-semibold text-on-surface marker:hidden">
            <span className="flex items-center justify-between">{title}<span className="text-on-surface-variant transition-transform group-open:rotate-180">⌄</span></span>
        </summary>
        <div className="space-y-3 pb-4">{children}</div>
    </details>;
}

function RecordList({ title, records, fields, onChange, onAdd, onRemove, onMove, initialValue, open = false }) {
    return <EditorSection title={title} open={open}>
        <div className="space-y-4">
            {records.map((record, index) => <article key={record.id ?? `${title}-${index}`} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container/40 p-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-on-surface">{title} {index + 1}</p>
                    <div className="flex items-center">
                        <button type="button" disabled={index === 0} onClick={() => onMove?.(index, -1)} aria-label={`Di chuyển ${title.toLowerCase()} lên`} className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container disabled:opacity-30"><ChevronUp size={15}/></button>
                        <button type="button" disabled={index === records.length - 1} onClick={() => onMove?.(index, 1)} aria-label={`Di chuyển ${title.toLowerCase()} xuống`} className="rounded-md p-1.5 text-on-surface-variant hover:bg-surface-container disabled:opacity-30"><ChevronDown size={15}/></button>
                        <button type="button" onClick={() => onRemove(index)} aria-label={`Xóa ${title.toLowerCase()} ${index + 1}`} className="rounded-md p-1.5 text-error hover:bg-error/10"><Trash2 size={15} /></button>
                    </div>
                </div>
                {fields.map(field => <Field
                    key={field.key}
                    label={field.label}
                    multiline={field.multiline}
                    value={field.multiline ? (Array.isArray(record[field.key]) ? record[field.key].join('\n') : record[field.key] ?? '') : record[field.key]}
                    onChange={value => onChange(index, field.key, field.multiline ? value.split(/\r?\n/) : value)}
                />)}
            </article>)}
        </div>
        <button type="button" onClick={() => onAdd(initialValue)} className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5">
            <Plus size={15} /> Thêm {title.toLowerCase()}
        </button>
    </EditorSection>;
}

const MAIN_ORDER = ['skills', 'experiences', 'projects'];
const SIDEBAR_ORDER = ['personalInfo', 'education', 'certificates', 'languages', 'awards'];
const SECTION_LABELS = { skills: 'Kỹ năng', experiences: 'Kinh nghiệm', projects: 'Dự án', personalInfo: 'Thông tin cá nhân', education: 'Học vấn', certificates: 'Chứng chỉ', languages: 'Ngoại ngữ', awards: 'Giải thưởng' };

export default function CVContentEditor() {
    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        updateProfessionalTitle,
        setExperiences,
        updateEducation,
        addEducation,
        removeEducation,
        updateProjects,
        updateCertificates,
        updateLanguages,
        updateAwards,
        updateSkills,
        setFullCVData,
    } = useCV();

    const updateListRecord = (records, setter, index, field, value) => {
        const updated = [...records];
        updated[index] = { ...updated[index], [field]: value };
        setter(updated);
    };
    const addToList = (records, setter, record) => setter([...records, { ...record }]);
    const removeFromList = (records, setter, index) => setter(records.filter((_, itemIndex) => itemIndex !== index));
    const moveInList = (records, setter, index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= records.length) return;
        const next = [...records]; [next[index], next[target]] = [next[target], next[index]]; setter(next);
    };
    const layout = cvData.editorLayout || {};
    const hidden = (layout.hiddenSections || []).filter(key => key !== 'personalInfo');
    const ordered = column => {
        const defaults = column === 'main' ? MAIN_ORDER : SIDEBAR_ORDER;
        const key = column === 'main' ? 'mainOrder' : 'sidebarOrder';
        const saved = (layout[key] || []).filter(item => defaults.includes(item));
        return [...new Set([...saved, ...defaults])];
    };
    const moveSection = (section, column, direction) => {
        const key = column === 'main' ? 'mainOrder' : 'sidebarOrder';
        const sequence = ordered(column).filter(item => !hidden.includes(item));
        const index = sequence.indexOf(section); const target = index + direction;
        if (index < 0 || target < 0 || target >= sequence.length) return;
        [sequence[index], sequence[target]] = [sequence[target], sequence[index]];
        setFullCVData({ ...cvData, editorLayout: { ...layout, [key]: sequence, hiddenSections: hidden } });
    };
    const toggleSection = section => {
        const nextHidden = hidden.includes(section) ? hidden.filter(item => item !== section) : [...hidden, section];
        setFullCVData({ ...cvData, editorLayout: { ...layout, hiddenSections: nextHidden } });
    };
    const updateCustomFields = customFields => setFullCVData({ ...cvData, personalInfo: { ...cvData.personalInfo, customFields } });
    const experiences = cvData.experiences || [];
    const education = cvData.education || [];
    const projects = cvData.projects || [];
    const skills = cvData.skills || [];
    const certificates = cvData.certificates || [];
    const languages = cvData.languages || [];
    const awards = cvData.awards || [];

    return <div className="space-y-1">
        <p className="mb-3 text-xs leading-relaxed text-on-surface-variant">Bản xem trước PDF sẽ tự cập nhật sau khi bạn ngừng nhập khoảng 1 giây.</p>
        <EditorSection title="Cấu trúc mục CV" open={false}>
            <p className="text-xs text-on-surface-variant">Ẩn/hiện mục và đổi thứ tự trong từng cột. Thông tin cá nhân luôn được giữ lại.</p>
            {[['main', 'Nội dung chính'], ['sidebar', 'Cột thông tin']].map(([column, label]) => <div key={column} className="space-y-2">
                <p className="text-xs font-bold text-on-surface">{label}</p>
                {ordered(column).map((section, index, list) => <div key={section} className="flex items-center gap-1 rounded-lg border border-outline-variant px-2 py-1">
                    <span className="min-w-0 flex-1 text-xs">{SECTION_LABELS[section]}</span>
                    <button type="button" disabled={hidden.includes(section) || index === 0} onClick={() => moveSection(section, column, -1)} aria-label="Di chuyển mục lên" className="rounded p-1 hover:bg-surface-container disabled:opacity-30"><ChevronUp size={14}/></button>
                    <button type="button" disabled={hidden.includes(section) || index === list.length - 1} onClick={() => moveSection(section, column, 1)} aria-label="Di chuyển mục xuống" className="rounded p-1 hover:bg-surface-container disabled:opacity-30"><ChevronDown size={14}/></button>
                    {section !== 'personalInfo' && <button type="button" onClick={() => toggleSection(section)} aria-label={hidden.includes(section) ? 'Hiện mục' : 'Ẩn mục'} className="rounded p-1 text-on-surface-variant hover:bg-surface-container">{hidden.includes(section) ? <Eye size={14}/> : <EyeOff size={14}/>}</button>}
                </div>)}
            </div>)}
            <div className="flex items-center justify-between rounded-lg border border-outline-variant px-2 py-1"><span className="flex-1 text-xs">Giới thiệu</span><button type="button" onClick={() => toggleSection('summary')} className="rounded p-1 text-on-surface-variant hover:bg-surface-container">{hidden.includes('summary') ? <Eye size={14}/> : <EyeOff size={14}/>}</button></div>
        </EditorSection>
        <EditorSection title="Thông tin cá nhân" open>
            <div className="space-y-3">
                <Field label="Họ và tên" value={cvData.personalInfo?.name} onChange={value => updatePersonalInfo({ name: value })} />
                <Field label="Chức danh" value={cvData.professionalTitle} onChange={updateProfessionalTitle} />
                <Field label="Email" type="email" value={cvData.personalInfo?.email} onChange={value => updatePersonalInfo({ email: value })} />
                <Field label="Số điện thoại" type="tel" value={cvData.personalInfo?.phone} onChange={value => updatePersonalInfo({ phone: value })} />
                <Field label="Ngày sinh" value={cvData.personalInfo?.dob} onChange={value => updatePersonalInfo({ dob: value })} />
                <Field label="Địa chỉ" value={cvData.personalInfo?.address} onChange={value => updatePersonalInfo({ address: value })} />
                <Field label="LinkedIn / liên kết" type="url" value={cvData.personalInfo?.linkedin} onChange={value => updatePersonalInfo({ linkedin: value })} />
                <div className="space-y-2 border-t border-outline-variant pt-3">
                    <p className="text-xs font-semibold text-on-surface-variant">Trường thông tin bổ sung</p>
                    {(cvData.personalInfo?.customFields || []).map((value, index) => <div key={index} className="flex items-center gap-2">
                        <Field label={`Thông tin ${index + 1}`} value={typeof value === 'string' ? value : value?.value} onChange={next => updateCustomFields((cvData.personalInfo?.customFields || []).map((item, i) => i === index ? next : item))}/>
                        <button type="button" onClick={() => updateCustomFields((cvData.personalInfo?.customFields || []).filter((_, i) => i !== index))} aria-label="Xóa trường thông tin" className="mt-5 rounded-md p-1.5 text-error hover:bg-error/10"><Trash2 size={15}/></button>
                    </div>)}
                    <button type="button" onClick={() => updateCustomFields([...(cvData.personalInfo?.customFields || []), ''])} className="inline-flex items-center gap-1 rounded-lg border border-primary/40 px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"><Plus size={14}/> Thêm trường</button>
                </div>
            </div>
        </EditorSection>

        {!hidden.includes('summary') && <EditorSection title="Tóm tắt chuyên môn">
            <Field label="Nội dung" multiline value={cvData.summary} onChange={updateSummary} />
        </EditorSection>}

        <RecordList title="Kinh nghiệm" records={experiences} fields={[
            { key: 'role', label: 'Vị trí' }, { key: 'company', label: 'Công ty' },
            { key: 'period', label: 'Thời gian' }, { key: 'details', label: 'Mô tả (mỗi ý một dòng)', multiline: true },
        ]} onChange={(index, field, value) => updateListRecord(experiences, setExperiences, index, field, value)}
        onAdd={record => addToList(experiences, setExperiences, record)} onRemove={index => removeFromList(experiences, setExperiences, index)} onMove={(index, direction) => moveInList(experiences, setExperiences, index, direction)}
        initialValue={{ role: '', company: '', period: '', details: [''] }} />

        <RecordList title="Học vấn" records={education} fields={[
            { key: 'school', label: 'Trường' }, { key: 'degree', label: 'Chuyên ngành / bằng cấp' },
            { key: 'year', label: 'Thời gian' }, { key: 'gpa', label: 'GPA (không bắt buộc)' },
        ]} onChange={(index, field, value) => updateEducation(index, field, value)} onAdd={addEducation}
        onRemove={removeEducation} onMove={(index, direction) => moveInList(education, records => setFullCVData({ ...cvData, education: records }), index, direction)} initialValue={{ school: '', degree: '', year: '', gpa: '' }} />

        <RecordList title="Dự án" records={projects} fields={[
            { key: 'name', label: 'Tên dự án' }, { key: 'period', label: 'Thời gian' },
            { key: 'techStack', label: 'Công nghệ' }, { key: 'teamSize', label: 'Quy mô nhóm' },
            { key: 'url', label: 'Liên kết' }, { key: 'details', label: 'Mô tả (mỗi ý một dòng)', multiline: true },
        ]} onChange={(index, field, value) => updateListRecord(projects, updateProjects, index, field, value)}
        onAdd={record => addToList(projects, updateProjects, record)} onRemove={index => removeFromList(projects, updateProjects, index)} onMove={(index, direction) => moveInList(projects, updateProjects, index, direction)}
        initialValue={{ name: '', period: '', techStack: '', teamSize: '', url: '', details: [''] }} />

        <RecordList title="Kỹ năng" records={skills} fields={[
            { key: 'name', label: 'Kỹ năng' }, { key: 'category', label: 'Nhóm kỹ năng' }, { key: 'level', label: 'Mức độ' },
        ]} onChange={(index, field, value) => updateListRecord(skills, updateSkills, index, field, value)}
        onAdd={record => addToList(skills, updateSkills, record)} onRemove={index => removeFromList(skills, updateSkills, index)} onMove={(index, direction) => moveInList(skills, updateSkills, index, direction)}
        initialValue={{ name: '', category: '', level: '' }} />

        <RecordList title="Chứng chỉ" records={certificates} fields={[
            { key: 'name', label: 'Tên chứng chỉ' }, { key: 'issuer', label: 'Đơn vị cấp' },
            { key: 'date', label: 'Ngày cấp' }, { key: 'url', label: 'Liên kết' },
        ]} onChange={(index, field, value) => updateListRecord(certificates, updateCertificates, index, field, value)}
        onAdd={record => addToList(certificates, updateCertificates, record)} onRemove={index => removeFromList(certificates, updateCertificates, index)} onMove={(index, direction) => moveInList(certificates, updateCertificates, index, direction)}
        initialValue={{ name: '', issuer: '', date: '', url: '' }} />

        <RecordList title="Ngoại ngữ" records={languages} fields={[
            { key: 'name', label: 'Ngôn ngữ' }, { key: 'level', label: 'Trình độ' },
        ]} onChange={(index, field, value) => updateListRecord(languages, updateLanguages, index, field, value)}
        onAdd={record => addToList(languages, updateLanguages, record)} onRemove={index => removeFromList(languages, updateLanguages, index)} onMove={(index, direction) => moveInList(languages, updateLanguages, index, direction)}
        initialValue={{ name: '', level: '' }} />

        <RecordList title="Giải thưởng" records={awards} fields={[
            { key: 'name', label: 'Tên giải thưởng' }, { key: 'issuer', label: 'Đơn vị trao' }, { key: 'date', label: 'Thời gian' },
        ]} onChange={(index, field, value) => updateListRecord(awards, updateAwards, index, field, value)}
        onAdd={record => addToList(awards, updateAwards, record)} onRemove={index => removeFromList(awards, updateAwards, index)} onMove={(index, direction) => moveInList(awards, updateAwards, index, direction)}
        initialValue={{ name: '', issuer: '', date: '' }} />
    </div>;
}
