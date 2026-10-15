import {getVisibleCvPdfSections} from '../sectionVisibility.js';
import {ArrowDown, ArrowUp, GripVertical, Plus, Trash2} from 'lucide-react';
import notoLatinRegular from '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?inline';
import notoLatinBold from '@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff?inline';
import notoVietnameseRegular from '@fontsource/noto-sans/files/noto-sans-vietnamese-400-normal.woff?inline';
import notoVietnameseBold from '@fontsource/noto-sans/files/noto-sans-vietnamese-700-normal.woff?inline';
import templateCss from './TheStandardHtmlTemplate.css?inline';

const value = item => typeof item === 'string' || typeof item === 'number' ? String(item).trim() : '';
const nextSkillCategory = skills => {
    const categories = new Set((skills || []).map(skill => value(skill.category)));
    let category = 'Nhóm kỹ năng mới';
    let suffix = 2;
    while (categories.has(category)) category = `Nhóm kỹ năng mới ${suffix++}`;
    return category;
};
export const standardTemplateFontCss = `@font-face{font-family:CVNoto;src:url('${notoLatinRegular}');font-weight:400}
@font-face{font-family:CVNoto;src:url('${notoLatinBold}');font-weight:700}
@font-face{font-family:CVNoto;src:url('${notoVietnameseRegular}');font-weight:400;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9}
@font-face{font-family:CVNoto;src:url('${notoVietnameseBold}');font-weight:700;unicode-range:U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9}`;

function EditableText({as: Tag = 'span', path, onEdit, placeholder, multiline = false, children, className = ''}) {
    const editable = typeof onEdit === 'function';
    const original = String(children ?? '');
    return <Tag className={`${className}${editable ? ' cv-inline-editable' : ''}`.trim()}
        contentEditable={editable ? 'plaintext-only' : undefined} suppressContentEditableWarning={editable}
        role={editable ? 'textbox' : undefined} aria-label={editable ? placeholder || path : undefined}
        data-placeholder={editable ? placeholder : undefined} onBlur={editable ? event => {
            const next = (multiline ? event.currentTarget.innerText : event.currentTarget.textContent).replace(/\\r/g, '').replace(/\\n+$/, '');
            if (next !== original) onEdit(path, next);
        } : undefined} onKeyDown={editable && !multiline ? event => {
            if (event.key === 'Enter') event.preventDefault();
        } : undefined}>{children}</Tag>;
}

function EditableGpa({path, value: gpa, onEdit}) {
    if (typeof onEdit !== 'function') return value(gpa) ? <div className="cv-standard-muted">GPA: {value(gpa)}</div> : null;
    return <div className="cv-standard-muted cv-standard-gpa"><strong>GPA:</strong>
        <input type="number" min="0" step="any" inputMode="decimal" aria-label="GPA" placeholder="0.00"
            defaultValue={value(gpa)} onBlur={event => {
                const next = event.currentTarget.value.trim();
                if (next !== value(gpa)) onEdit(path, next);
            }}/>
    </div>;
}

function normalizeBulletDetails(details) {
    const lines = Array.isArray(details) ? details.flatMap(detail => String(detail ?? '').split(/\r?\n/))
        : String(details ?? '').split(/\r?\n/);
    return lines.map(line => line.replace(/^\s*(?:•|-)\s?/, '').trim()).filter(Boolean);
}

function EditableBulletList({details, path, onEdit, project = false}) {
    const normalized = normalizeBulletDetails(details);
    if (typeof onEdit !== 'function') return <ul className={project ? 'project-details' : 'bullet-details'}>
        {normalized.map((line, index) => <li key={index}>{line}</li>)}
    </ul>;

    const resizeField = field => {
        if (!field) return;
        field.style.height = 'auto';
        field.style.height = `${field.scrollHeight}px`;
    };

    const handleKeyDown = event => {
        const field = event.currentTarget;
        const start = field.selectionStart;
        const end = field.selectionEnd;
        const text = field.value;
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const linePrefix = text.slice(lineStart, start);

        if (event.key === ' ' && linePrefix === '-') {
            event.preventDefault();
            field.setRangeText('• ', lineStart, start, 'end');
            requestAnimationFrame(() => resizeField(field));
            return;
        }
        if (event.key === 'Enter' && start === end) {
            event.preventDefault();
            const lineEnd = text.indexOf('\n', start);
            const currentLine = text.slice(lineStart, lineEnd < 0 ? text.length : lineEnd);
            const nextPrefix = /^\s*(?:•|-)\s?/.test(currentLine) ? '\n• ' : '\n';
            field.setRangeText(nextPrefix, start, end, 'end');
            requestAnimationFrame(() => resizeField(field));
        }
    };

    return <textarea className={`cv-bullet-editor ${project ? 'project-details' : 'bullet-details'}`}
        aria-label="Mô tả" placeholder="Mô tả (gõ - rồi dấu cách để tạo gạch đầu dòng)"
        defaultValue={normalized.map(line => `• ${line}`).join('\n')} rows={1}
        ref={resizeField} onInput={event => resizeField(event.currentTarget)} onKeyDown={handleKeyDown} onBlur={event => {
            const next = normalizeBulletDetails(event.currentTarget.value);
            if (JSON.stringify(next) !== JSON.stringify(normalized)) onEdit(path, next);
        }}/>
}

function AddButton({onAdd, path, value: addValue, label, iconOnly = true}) {
    if (typeof onAdd !== 'function') return null;
    return <button type="button" className="cv-inline-add" title={`Thêm ${label}`} aria-label={`Thêm ${label}`}
        onClick={() => onAdd(path, addValue)}><Plus size={15}/>{iconOnly ? null : <span>Thêm {label}</span>}</button>;
}

function Actions({path, index, count, onMove, onRemove, onAdd, addValue, addLabel}) {
    return <div className="cv-item-actions" role="toolbar" aria-label="Thao tác trường CV">
        {onMove && <><button type="button" title="Di chuyển lên" aria-label="Di chuyển lên" disabled={index <= 0} onClick={() => onMove(path, index, -1)}><ArrowUp size={14}/></button>
            <button type="button" title="Di chuyển xuống" aria-label="Di chuyển xuống" disabled={index >= count - 1} onClick={() => onMove(path, index, 1)}><ArrowDown size={14}/></button></>}
        {onRemove && <button type="button" className="cv-item-delete" title="Xóa trường" aria-label="Xóa trường" onClick={() => onRemove(path, index)}><Trash2 size={14}/></button>}
        <AddButton onAdd={onAdd} path={path} value={addValue} label={addLabel}/>
    </div>;
}

function EditableItem({path, index, count, onMove, onRemove, onAdd, addValue, addLabel, children, className = ''}) {
    return <div className={`cv-editable-item ${className}`.trim()}>
        <Actions path={path} index={index} count={count} onMove={onMove} onRemove={onRemove}
            onAdd={onAdd} addValue={addValue} addLabel={addLabel}/>{children}
    </div>;
}

function SectionActions({sectionKey, column, index, count, onMove, onReorder, onRemove, onAdd, addValue, addLabel}) {
    return <div className="cv-section-actions" role="toolbar" aria-label="Thao tác mục CV">
        {onReorder && <button type="button" className="cv-section-drag-handle" draggable="true"
            title="Kéo để sắp xếp mục" aria-label="Kéo để sắp xếp mục"
            onDragStart={event => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', JSON.stringify({sectionKey, column}));
            }}><GripVertical size={15}/></button>}
        {onMove && <><button type="button" title="Di chuyển mục lên" aria-label="Di chuyển mục lên" disabled={index <= 0} onClick={() => onMove(sectionKey, column, -1)}><ArrowUp size={14}/></button>
            <button type="button" title="Di chuyển mục xuống" aria-label="Di chuyển mục xuống" disabled={index >= count - 1} onClick={() => onMove(sectionKey, column, 1)}><ArrowDown size={14}/></button></>}
        {onRemove && <button type="button" className="cv-item-delete" title="Xóa mục" aria-label="Xóa mục" onClick={() => onRemove(sectionKey)}><Trash2 size={14}/></button>}
        <AddButton onAdd={onAdd} path={sectionKey === 'personalInfo' ? 'personalInfo.customFields' : sectionKey} value={addValue} label={addLabel}/>
    </div>;
}

function CvSection({sectionKey, column, index, count, title, onSectionMove, onSectionReorder, onSectionRemove, onAdd, addValue, addLabel, side = false, children}) {
    const handleDragOver = event => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('cv-section-drop-target');
    };
    const handleDragLeave = event => {
        if (!event.currentTarget.contains(event.relatedTarget)) event.currentTarget.classList.remove('cv-section-drop-target');
    };
    const handleDrop = event => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('cv-section-drop-target');
        try {
            const source = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (source.sectionKey !== sectionKey) {
                onSectionReorder(source.sectionKey, source.column, sectionKey, column);
            }
        } catch {
            // Ignore drops that were not started from a section drag handle.
        }
    };
    return <section className={side ? 'cv-standard-side-section' : 'cv-standard-section'}
        onDragOver={onSectionReorder ? handleDragOver : undefined}
        onDragLeave={onSectionReorder ? handleDragLeave : undefined}
        onDrop={onSectionReorder ? handleDrop : undefined}>
        <div className={`${side ? 'cv-standard-side-heading' : 'cv-standard-section-heading'} cv-editable-section`}>
            <SectionActions sectionKey={sectionKey} column={column} index={index} count={count}
                onMove={onSectionMove} onReorder={onSectionReorder} onRemove={sectionKey === 'personalInfo' ? undefined : onSectionRemove}
                onAdd={onAdd} addValue={addValue} addLabel={addLabel}/>
            <h2 className={side ? 'side-title' : 'cv-standard-section-title'}>{title}</h2>
        </div>{children}
    </section>;
}

function SkillGroups({skills = [], languages = [], onEdit, onAdd, onMove, onRemove, onGroupMove, onGroupRemove, onRename}) {
    const languageNames = new Set(languages.map(item => value(item.name).toLowerCase()));
    const groups = new Map();
    skills.forEach((skill, index) => {
        const name = value(skill.name);
        if ((!name && !onEdit) || (name && languageNames.has(name.toLowerCase()))) return;
        const category = value(skill.category) || 'Other';
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push({name, level: value(skill.level), index});
    });
    const entries = [...groups];
    return entries.map(([category, items], groupIndex) => <div className="cv-skill-group" key={category}>
        <EditableItem path="skills" index={groupIndex} count={entries.length} onMove={onGroupMove ? (...args) => onGroupMove(category, args[2]) : undefined}
            onRemove={onGroupRemove ? () => onGroupRemove(category) : undefined}
            onAdd={onAdd} addValue={{name: '', category, level: ''}} addLabel="kỹ năng" className="cv-skill-group-row">
            <EditableText as="strong" className="cv-skill-category" onEdit={onRename ? (_, next) => onRename(category, next) : undefined}
                path="category" placeholder="Tên nhóm kỹ năng">{category}</EditableText>
            <div className="chips">{items.map(item => <EditableItem key={item.index} path="skills" index={item.index} count={skills.length}
                onMove={onMove} onRemove={onRemove} onAdd={onAdd} addValue={{name: '', category, level: ''}} addLabel="kỹ năng" className="cv-skill-item">
                <span className="chip"><EditableText as="span" path={`skills.${item.index}.name`} onEdit={onEdit} placeholder="Kỹ năng">{item.name}</EditableText>
                    {item.level && <span className="cv-skill-level"> ({item.level})</span>}</span>
            </EditableItem>)}</div>
        </EditableItem>
    </div>);
}

function Timeline({items = [], path, project = false, onEdit, onMove, onRemove, onAdd, addValue}) {
    return <div className="timeline">{items.map((item, index) => <EditableItem key={item.id || index} path={path} index={index}
        count={items.length} onMove={onMove} onRemove={onRemove} onAdd={onAdd}
        addValue={addValue} addLabel={project ? 'dự án' : 'kinh nghiệm'} className="timeline-item">
        <EditableText as="div" className="period" path={`${path}.${index}.period`} onEdit={onEdit} placeholder="Thời gian">{value(item.period)}</EditableText>
        <EditableText as="h3" path={`${path}.${index}.${project ? 'name' : 'role'}`} onEdit={onEdit} placeholder={project ? 'Tên dự án' : 'Vị trí'}>{value(project ? item.name : item.role)}</EditableText>
        {!project && <div className="company">at <EditableText path={`${path}.${index}.company`} onEdit={onEdit} placeholder="Công ty">{value(item.company)}</EditableText></div>}
        <EditableBulletList details={item.details} path={`${path}.${index}.details`} onEdit={onEdit} project={project}/>
        {project && <><p className="project-detail">Tech stack: <EditableText path={`${path}.${index}.techStack`} onEdit={onEdit} placeholder="Công nghệ">{value(item.techStack)}</EditableText></p>
            <p className="project-detail">Team size: <EditableText path={`${path}.${index}.teamSize`} onEdit={onEdit} placeholder="Quy mô nhóm">{value(item.teamSize)}</EditableText></p>
            <p className="project-detail"><EditableText path={`${path}.${index}.url`} onEdit={onEdit} placeholder="Liên kết">{value(item.url)}</EditableText></p></>}
    </EditableItem>)}</div>;
}

export default function TheStandardHtmlTemplate({data: source = {}, onEdit, onAdd, onMove, onRemove,
    onSectionMove, onSectionReorder, onSectionRemove, onSkillGroupMove, onSkillGroupRemove, onSkillRename, onClear, includeStyles = true}) {
    const data = source || {};
    const personal = data.personalInfo || {};
    const sections = getVisibleCvPdfSections(data);
    const layout = data.editorLayout || {};
    const mainDefaults = ['skills', 'experiences', 'projects'];
    const sideDefaults = ['personalInfo', 'education', 'certificates', 'languages', 'awards'];
    const allSectionKeys = [...mainDefaults, ...sideDefaults];
    const hidden = new Set(layout.hiddenSections || []);
    const personalContactOrder = [...new Set([...(layout.personalInfoOrder || []), ...['phone', 'email', 'address']])]
        .filter(field => ['phone', 'email', 'address'].includes(field));
    const explicitMain = [...new Set(layout.mainOrder || [])].filter(key => allSectionKeys.includes(key));
    const explicitSide = [...new Set(layout.sidebarOrder || [])].filter(key => allSectionKeys.includes(key) && !explicitMain.includes(key));
    const mainOrder = [...explicitMain, ...mainDefaults.filter(key => !explicitMain.includes(key) && !explicitSide.includes(key))]
        .filter(key => !hidden.has(key));
    const sideOrder = [...explicitSide, ...sideDefaults.filter(key => !explicitSide.includes(key) && !explicitMain.includes(key))]
        .filter(key => !hidden.has(key));
    const experiences = onEdit ? data.experiences || [] : sections.experiences;
    const projects = onEdit ? data.projects || [] : sections.projects;
    const education = onEdit ? data.education || [] : sections.education;
    const certificates = onEdit ? data.certificates || [] : sections.certificates;
    const languages = onEdit ? data.languages || [] : sections.languages;
    const awards = onEdit ? data.awards || [] : sections.awards;
    const contactFields = [['Phone', 'phone'], ['Email', 'email'], ['Area', 'address']];
    const renderSection = (key, column, order) => {
        const side = column === 'sidebar';
        const index = order.indexOf(key);
        const sectionProps = {key, sectionKey:key, column, index, count:order.length, side,
            onSectionMove, onSectionReorder, onSectionRemove, onAdd};
        if (key === 'personalInfo') {
            const customFields = personal.customFields || [];
            return <CvSection {...sectionProps} title="Personal Information" addValue={{label:'',value:''}} addLabel="thông tin">
                <div className="cv-standard-contacts">
                    {personalContactOrder.map((field, contactIndex) => {
                        const [label] = contactFields.find(([, fieldKey]) => fieldKey === field);
                        return <EditableItem key={field} path="personalInfo.contacts" index={contactIndex} count={personalContactOrder.length}
                            onMove={onMove} onAdd={onAdd ? (_, newField) => onAdd('personalInfo.customFields', newField) : undefined}
                            addValue={{label:'',value:''}} addLabel="thông tin" className="cv-standard-contact">
                            <span className="cv-standard-contact-icon">{label[0]}</span><span className="cv-standard-contact-value"><EditableText path={`personalInfo.${field}`} onEdit={onEdit} placeholder={label}>{value(personal[field])}</EditableText></span>
                        </EditableItem>;
                    })}
                    {['dob', 'linkedin'].filter(field => value(personal[field])).map(field => <div className="cv-standard-contact" key={field}>
                        <span className="cv-standard-contact-icon">{field === 'dob' ? 'D' : 'L'}</span>
                        <span className="cv-standard-contact-value"><EditableText path={`personalInfo.${field}`} onEdit={onEdit} placeholder={field === 'dob' ? 'Ngày sinh' : 'Liên kết'}>{value(personal[field])}</EditableText></span>
                        {onEdit && <button type="button" className="cv-contact-clear" onClick={() => onClear?.(`personalInfo.${field}`)} title="Xóa thông tin" aria-label="Xóa thông tin"><Trash2 size={13}/></button>}
                    </div>)}
                    {customFields.map((field, fieldIndex) => <EditableItem key={field.id || fieldIndex} path="personalInfo.customFields" index={fieldIndex} count={customFields.length}
                        onMove={onMove} onRemove={onRemove} onAdd={onAdd} addValue={{label:'',value:''}} addLabel="thông tin" className="cv-standard-contact">
                        <span className="cv-standard-contact-icon"><EditableText path={`personalInfo.customFields.${fieldIndex}.label`} onEdit={onEdit} placeholder="•">{value(field.label).slice(0, 1)}</EditableText></span>
                        <span className="cv-standard-contact-value"><EditableText path={`personalInfo.customFields.${fieldIndex}.value`} onEdit={onEdit} placeholder="Thông tin">{value(field.value)}</EditableText></span>
                    </EditableItem>)}
                </div>
            </CvSection>;
        }
        if (key === 'skills') return <CvSection {...sectionProps} title="Skill" addValue={{name:'', category:nextSkillCategory(data.skills), level:''}} addLabel="nhóm kỹ năng">
            <SkillGroups skills={data.skills || []} languages={languages} onEdit={onEdit} onAdd={onAdd} onMove={onMove} onRemove={onRemove}
                onGroupMove={onSkillGroupMove} onGroupRemove={onSkillGroupRemove} onRename={onSkillRename}/>
        </CvSection>;
        if (key === 'experiences') return <CvSection {...sectionProps} title="Work Experience"
            onAdd={experiences.length ? undefined : onAdd} addValue={{role:'',company:'',period:'',details:['']}} addLabel="kinh nghiệm">
            <Timeline items={experiences} path="experiences" onEdit={onEdit} onMove={onMove} onRemove={onRemove}
                onAdd={onAdd} addValue={{role:'',company:'',period:'',details:['']}}/>
        </CvSection>;
        if (key === 'projects') return <CvSection {...sectionProps} title="Projects" onAdd={projects.length ? undefined : onAdd}
            addValue={{name:'',period:'',techStack:'',teamSize:'',url:'',details:['']}} addLabel="dự án">
            <Timeline items={projects} path="projects" project onEdit={onEdit} onMove={onMove} onRemove={onRemove}
                onAdd={onAdd} addValue={{name:'',period:'',techStack:'',teamSize:'',url:'',details:['']}}/>
        </CvSection>;
        const rows = key === 'education' ? education : key === 'certificates' ? certificates : key === 'languages' ? languages : awards;
        const addValues = {education:{school:'',degree:'',year:'',gpa:''}, certificates:{name:'',issuer:'',date:'',url:''}, languages:{name:'',level:''}, awards:{name:'',issuer:'',date:''}};
        const labels = {education:'học vấn', certificates:'chứng chỉ', languages:'ngoại ngữ', awards:'giải thưởng'};
        const title = {education:'Education', certificates:'Certificate', languages:'Foreign Language', awards:'Award'}[key];
        return <CvSection {...sectionProps} title={title} onAdd={rows.length ? undefined : onAdd} addValue={addValues[key]} addLabel={labels[key]}>
            {rows.map((item, itemIndex) => <EditableItem key={item.id || itemIndex} path={key} index={itemIndex} count={rows.length}
                onMove={onMove} onRemove={onRemove} onAdd={onAdd} addValue={addValues[key]} addLabel={labels[key]}
                className={`cv-standard-side-item${key === 'languages' ? ' cv-standard-language' : ''}`}>
                {key === 'education' ? <><EditableText as="h3" className="cv-standard-school" path={`education.${itemIndex}.school`} onEdit={onEdit} placeholder="Trường">{value(item.school)}</EditableText>
                    <EditableText as="div" className="cv-standard-degree" path={`education.${itemIndex}.degree`} onEdit={onEdit} placeholder="Ngành học">{value(item.degree)}</EditableText>
                    <EditableText as="div" className="cv-standard-muted" path={`education.${itemIndex}.${value(item.year) ? 'year' : 'period'}`} onEdit={onEdit} placeholder="Thời gian">{value(item.year || item.period)}</EditableText>
                    <EditableGpa path={`education.${itemIndex}.gpa`} value={item.gpa} onEdit={onEdit}/></>
                    : key === 'languages' ? <><EditableText as="strong" path={`languages.${itemIndex}.name`} onEdit={onEdit} placeholder="Ngoại ngữ">{value(item.name)}</EditableText>
                        <EditableText as="span" path={`languages.${itemIndex}.level`} onEdit={onEdit} placeholder="Trình độ">{value(item.level)}</EditableText></>
                    : <><EditableText as="h3" className="cv-standard-item-title" path={`${key}.${itemIndex}.name`} onEdit={onEdit} placeholder="Tên">{value(item.name)}</EditableText>
                        <EditableText as="div" className="cv-standard-item-body" path={`${key}.${itemIndex}.issuer`} onEdit={onEdit} placeholder="Đơn vị cấp">{value(item.issuer)}</EditableText>
                        <EditableText as="div" className="cv-standard-muted" path={`${key}.${itemIndex}.date`} onEdit={onEdit} placeholder="Ngày">{value(item.date)}</EditableText>
                        {key === 'certificates' && <EditableText as="div" className="cv-standard-muted" path={`certificates.${itemIndex}.url`} onEdit={onEdit} placeholder="Liên kết">{value(item.url)}</EditableText>}</>}
            </EditableItem>)}
        </CvSection>;
    };
    const handleColumnDragOver = event => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        if (event.target === event.currentTarget) event.currentTarget.classList.add('cv-column-drop-target');
    };
    const handleColumnDragLeave = event => {
        if (event.target === event.currentTarget && !event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.classList.remove('cv-column-drop-target');
        }
    };
    const handleColumnDrop = (event, column) => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('cv-column-drop-target');
        try {
            const source = JSON.parse(event.dataTransfer.getData('text/plain'));
            onSectionReorder(source.sectionKey, source.column, null, column);
        } catch {
            // Ignore drops that were not started from a section drag handle.
        }
    };
    return <div className="cv-standard-document">{includeStyles && <style>{standardTemplateFontCss}{templateCss}</style>}
        <div className="cv-standard">
            <main className="cv-standard-main"><header className="cv-standard-header">
                <EditableText as="h1" className="cv-standard-name" path="personalInfo.name" onEdit={onEdit} placeholder="Họ và tên">{value(personal.name)}</EditableText>
                <EditableText as="div" className="cv-standard-title" path="professionalTitle" onEdit={onEdit} placeholder="Vị trí ứng tuyển">{value(data.professionalTitle)}</EditableText>
                {!hidden.has('summary') && <div className="cv-optional-field">
                    <div className="cv-optional-actions"><button type="button" onClick={() => onClear?.('summary')} title="Xóa phần giới thiệu" aria-label="Xóa phần giới thiệu"><Trash2 size={14}/></button></div>
                    <EditableText as="div" className="cv-standard-summary" path="summary" onEdit={onEdit} multiline placeholder="Giới thiệu bản thân">{value(data.summary)}</EditableText>
                </div>}
            </header><div className="cv-standard-content" onDragOver={onSectionReorder ? handleColumnDragOver : undefined}
                onDragLeave={onSectionReorder ? handleColumnDragLeave : undefined}
                onDrop={onSectionReorder ? event => handleColumnDrop(event, 'main') : undefined}>
                {mainOrder.map(key => renderSection(key, 'main', mainOrder))}</div></main>
            <aside className="cv-standard-sidebar" onDragOver={onSectionReorder ? handleColumnDragOver : undefined}
                onDragLeave={onSectionReorder ? handleColumnDragLeave : undefined}
                onDrop={onSectionReorder ? event => handleColumnDrop(event, 'sidebar') : undefined}>
                {value(data.profilePhoto) && <div className="cv-standard-photo-wrap cv-optional-field">
                    <div className="cv-optional-actions"><button type="button" onClick={() => onClear?.('profilePhoto')} title="Xóa ảnh" aria-label="Xóa ảnh"><Trash2 size={14}/></button></div>
                    <img className="cv-standard-photo" src={data.profilePhoto} alt="Ảnh hồ sơ"/>
                </div>}
                {sideOrder.map(key => renderSection(key, 'sidebar', sideOrder))}
            </aside>
        </div>
    </div>;
}
