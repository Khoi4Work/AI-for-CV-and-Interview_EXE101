import { Plus, Trash2 } from 'lucide-react';
import { useCV } from '../contexts/CVContext.jsx';

const inputClass = 'w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

function Field({ label, value, onChange, multiline = false }) {
    const Control = multiline ? 'textarea' : 'input';
    return <label className="block min-w-0 space-y-1.5 text-xs font-semibold text-on-surface-variant">
        <span>{label}</span>
        <Control
            className={`${inputClass} ${multiline ? 'min-h-24 resize-y' : ''}`}
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

function RecordList({ title, records, fields, onChange, onAdd, onRemove, initialValue, open = false }) {
    return <EditorSection title={title} open={open}>
        <div className="space-y-4">
            {records.map((record, index) => <article key={record.id ?? `${title}-${index}`} className="space-y-3 rounded-xl border border-outline-variant bg-surface-container/40 p-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-on-surface">{title} {index + 1}</p>
                    <button type="button" onClick={() => onRemove(index)} aria-label={`Xóa ${title.toLowerCase()} ${index + 1}`} className="rounded-md p-1.5 text-error hover:bg-error/10">
                        <Trash2 size={15} />
                    </button>
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
    } = useCV();

    const updateListRecord = (records, setter, index, field, value) => {
        const updated = [...records];
        updated[index] = { ...updated[index], [field]: value };
        setter(updated);
    };
    const addToList = (records, setter, record) => setter([...records, { ...record }]);
    const removeFromList = (records, setter, index) => setter(records.filter((_, itemIndex) => itemIndex !== index));
    const experiences = cvData.experiences || [];
    const education = cvData.education || [];
    const projects = cvData.projects || [];
    const skills = cvData.skills || [];
    const certificates = cvData.certificates || [];
    const languages = cvData.languages || [];
    const awards = cvData.awards || [];

    return <div className="space-y-1">
        <p className="mb-3 text-xs leading-relaxed text-on-surface-variant">Bản xem trước PDF sẽ tự cập nhật sau khi bạn ngừng nhập khoảng 1 giây.</p>
        <EditorSection title="Thông tin cá nhân" open>
            <div className="space-y-3">
                <Field label="Họ và tên" value={cvData.personalInfo?.name} onChange={value => updatePersonalInfo({ name: value })} />
                <Field label="Chức danh" value={cvData.professionalTitle} onChange={updateProfessionalTitle} />
                <Field label="Email" value={cvData.personalInfo?.email} onChange={value => updatePersonalInfo({ email: value })} />
                <Field label="Số điện thoại" value={cvData.personalInfo?.phone} onChange={value => updatePersonalInfo({ phone: value })} />
                <Field label="Ngày sinh" value={cvData.personalInfo?.dob} onChange={value => updatePersonalInfo({ dob: value })} />
                <Field label="Địa chỉ" value={cvData.personalInfo?.address} onChange={value => updatePersonalInfo({ address: value })} />
                <Field label="LinkedIn / liên kết" value={cvData.personalInfo?.linkedin} onChange={value => updatePersonalInfo({ linkedin: value })} />
            </div>
        </EditorSection>

        <EditorSection title="Tóm tắt chuyên môn">
            <Field label="Nội dung" multiline value={cvData.summary} onChange={updateSummary} />
        </EditorSection>

        <RecordList title="Kinh nghiệm" records={experiences} fields={[
            { key: 'role', label: 'Vị trí' }, { key: 'company', label: 'Công ty' },
            { key: 'period', label: 'Thời gian' }, { key: 'details', label: 'Mô tả (mỗi ý một dòng)', multiline: true },
        ]} onChange={(index, field, value) => updateListRecord(experiences, setExperiences, index, field, value)}
        onAdd={record => addToList(experiences, setExperiences, record)} onRemove={index => removeFromList(experiences, setExperiences, index)}
        initialValue={{ role: '', company: '', period: '', details: [''] }} />

        <RecordList title="Học vấn" records={education} fields={[
            { key: 'school', label: 'Trường' }, { key: 'degree', label: 'Chuyên ngành / bằng cấp' },
            { key: 'year', label: 'Thời gian' }, { key: 'gpa', label: 'GPA' },
        ]} onChange={(index, field, value) => updateEducation(index, field, value)} onAdd={addEducation}
        onRemove={removeEducation} initialValue={{ school: '', degree: '', year: '', gpa: '' }} />

        <RecordList title="Dự án" records={projects} fields={[
            { key: 'name', label: 'Tên dự án' }, { key: 'period', label: 'Thời gian' },
            { key: 'techStack', label: 'Công nghệ' }, { key: 'teamSize', label: 'Quy mô nhóm' },
            { key: 'url', label: 'Liên kết' }, { key: 'details', label: 'Mô tả (mỗi ý một dòng)', multiline: true },
        ]} onChange={(index, field, value) => updateListRecord(projects, updateProjects, index, field, value)}
        onAdd={record => addToList(projects, updateProjects, record)} onRemove={index => removeFromList(projects, updateProjects, index)}
        initialValue={{ name: '', period: '', techStack: '', teamSize: '', url: '', details: [''] }} />

        <RecordList title="Kỹ năng" records={skills} fields={[
            { key: 'name', label: 'Kỹ năng' }, { key: 'category', label: 'Nhóm kỹ năng' }, { key: 'level', label: 'Mức độ' },
        ]} onChange={(index, field, value) => updateListRecord(skills, updateSkills, index, field, value)}
        onAdd={record => addToList(skills, updateSkills, record)} onRemove={index => removeFromList(skills, updateSkills, index)}
        initialValue={{ name: '', category: '', level: '' }} />

        <RecordList title="Chứng chỉ" records={certificates} fields={[
            { key: 'name', label: 'Tên chứng chỉ' }, { key: 'issuer', label: 'Đơn vị cấp' },
            { key: 'date', label: 'Ngày cấp' }, { key: 'url', label: 'Liên kết' },
        ]} onChange={(index, field, value) => updateListRecord(certificates, updateCertificates, index, field, value)}
        onAdd={record => addToList(certificates, updateCertificates, record)} onRemove={index => removeFromList(certificates, updateCertificates, index)}
        initialValue={{ name: '', issuer: '', date: '', url: '' }} />

        <RecordList title="Ngoại ngữ" records={languages} fields={[
            { key: 'name', label: 'Ngôn ngữ' }, { key: 'level', label: 'Trình độ' },
        ]} onChange={(index, field, value) => updateListRecord(languages, updateLanguages, index, field, value)}
        onAdd={record => addToList(languages, updateLanguages, record)} onRemove={index => removeFromList(languages, updateLanguages, index)}
        initialValue={{ name: '', level: '' }} />

        <RecordList title="Giải thưởng" records={awards} fields={[
            { key: 'name', label: 'Tên giải thưởng' }, { key: 'issuer', label: 'Đơn vị trao' }, { key: 'date', label: 'Thời gian' },
        ]} onChange={(index, field, value) => updateListRecord(awards, updateAwards, index, field, value)}
        onAdd={record => addToList(awards, updateAwards, record)} onRemove={index => removeFromList(awards, updateAwards, index)}
        initialValue={{ name: '', issuer: '', date: '' }} />
    </div>;
}
