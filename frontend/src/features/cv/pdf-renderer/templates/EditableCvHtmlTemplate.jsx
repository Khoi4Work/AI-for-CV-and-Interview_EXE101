import {getVisibleCvPdfSections} from '../sectionVisibility.js';
import {Fragment} from 'react';
import {ArrowDown, ArrowUp, BriefcaseBusiness, CalendarDays, ExternalLink, Globe, GripVertical, Mail, MapPin, Phone, Plus, Trash2, Wrench} from 'lucide-react';
import notoLatinRegular from '@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff?inline';
import notoLatinBold from '@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff?inline';
import notoVietnameseRegular from '@fontsource/noto-sans/files/noto-sans-vietnamese-400-normal.woff?inline';
import notoVietnameseBold from '@fontsource/noto-sans/files/noto-sans-vietnamese-700-normal.woff?inline';
import templateCss from './EditableCvHtmlTemplate.css?inline';
import {getCvTemplateLayout} from '../templateSectionLayout.js';
import {supportsProfilePhoto} from '../../utils/templateCapabilities.js';

const value = item => typeof item === 'string' || typeof item === 'number' ? String(item).trim() : '';
function clearSectionDropPreview(root) {
    if (!root) return;
    root.querySelectorAll('.cv-section-drop-preview').forEach(preview => preview.remove());
    root.querySelectorAll('.cv-section-drop-target, .cv-section-drop-before, .cv-section-drop-after, .cv-column-drop-target')
        .forEach(target => target.classList.remove('cv-section-drop-target', 'cv-section-drop-before', 'cv-section-drop-after', 'cv-column-drop-target'));
}

function isPointerOverDropPreview(root, event) {
    const preview = root?.querySelector('.cv-section-drop-preview');
    if (!preview) return false;
    const bounds = preview.getBoundingClientRect();
    return event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
}

function getColumnSections(root, column, includeDragging = false) {
    const columnElement = root?.querySelector(column === 'sidebar' ? '.cv-standard-sidebar' : '.cv-standard-main');
    if (!columnElement) return [];
    const selector = column === 'sidebar'
        ? ':scope > [data-section-key]'
        : ':scope > .cv-standard-content > [data-section-key]';
    return Array.from(columnElement.querySelectorAll(selector))
        .filter(section => !section.classList.contains('cv-section-drop-preview')
            && (includeDragging || !section.classList.contains('cv-section-dragging')));
}

function getColumnInsertionTarget(root, column, clientY) {
    const sections = getColumnSections(root, column);
    const nextSection = sections.find(section => {
        const bounds = section.getBoundingClientRect();
        return clientY < bounds.top + bounds.height / 2;
    });
    return nextSection?.dataset.sectionKey || null;
}

function getSectionDropTargetKey(root, target, column, position) {
    if (position === 'append') return '';
    if (position === 'before') return target?.dataset.sectionKey || '';
    const sections = getColumnSections(root, column);
    const targetIndex = sections.findIndex(section => section === target);
    return sections[targetIndex + 1]?.dataset.sectionKey || '';
}

function sectionDropChangesLayout(root, source, targetKey, targetColumn) {
    const sourceKey = source?.dataset.sectionKey;
    if (!sourceKey) return false;
    const sourceColumn = source.closest('.cv-standard-sidebar') ? 'sidebar' : 'main';
    if (sourceColumn !== targetColumn) return true;

    const currentKeys = getColumnSections(root, sourceColumn, true).map(section => section.dataset.sectionKey);
    const nextKeys = currentKeys.filter(key => key !== sourceKey);
    const targetIndex = targetKey ? nextKeys.indexOf(targetKey) : -1;
    nextKeys.splice(targetIndex < 0 ? nextKeys.length : targetIndex, 0, sourceKey);
    return nextKeys.some((key, index) => key !== currentKeys[index]);
}

function showSectionDropPreview(target, position = 'append', column = 'sidebar') {
    const root = target.closest('.cv-standard-document');
    const source = root?.querySelector('.cv-section-dragging');
    if (!root || !source || source === target || source.contains(target)) return;
    const dropContainer = position === 'append' && target.matches('.cv-standard-main')
        ? target.querySelector('.cv-standard-content') || target : target;

    let preview = root.querySelector('.cv-section-drop-preview');
    const targetKey = getSectionDropTargetKey(root, target, column, position);
    if (!sectionDropChangesLayout(root, source, targetKey || null, column)) {
        clearSectionDropPreview(root);
        return;
    }
    if (preview?.dataset.dropTargetKey === targetKey && preview.dataset.dropPosition === position
        && preview.dataset.dropColumn === column && preview.parentElement === (position === 'append' ? dropContainer : target.parentElement)) return;

    root.querySelectorAll('.cv-section-drop-target, .cv-section-drop-before, .cv-section-drop-after, .cv-column-drop-target')
        .forEach(item => item.classList.remove('cv-section-drop-target', 'cv-section-drop-before', 'cv-section-drop-after', 'cv-column-drop-target'));
    preview?.remove();
    if (!preview) {
        preview = source.cloneNode(true);
        preview.classList.remove('cv-section-dragging', 'cv-section-drop-target', 'cv-section-drop-before', 'cv-section-drop-after');
        preview.classList.add('cv-section-drop-preview');
        preview.removeAttribute('data-section-key');
        preview.setAttribute('aria-hidden', 'true');
        preview.setAttribute('draggable', 'false');
    }

    const sideSection = column === 'sidebar';
    preview.classList.toggle('cv-standard-side-section', sideSection);
    preview.classList.toggle('cv-standard-section', !sideSection);
    const heading = preview.querySelector('.cv-standard-side-heading, .cv-standard-section-heading');
    const headingTitle = heading?.querySelector('h2');
    const nameHeader = preview.querySelector('.cv-standard-header');
    const isCloudTemplate = root.querySelector('.cv-template-cloud-expert');
    nameHeader?.classList.toggle('cv-sidebar-header', sideSection && Boolean(isCloudTemplate));
    if (heading) {
        heading.classList.toggle('cv-standard-side-heading', sideSection);
        heading.classList.toggle('cv-standard-section-heading', !sideSection);
    }
    if (headingTitle) headingTitle.className = sideSection ? 'side-title' : 'cv-standard-section-title';

    preview.dataset.dropTargetKey = targetKey;
    preview.dataset.dropPosition = position;
    preview.dataset.dropColumn = column;
    if (position === 'before') target.parentElement.insertBefore(preview, target);
    else if (position === 'after') {
        let next = target.nextElementSibling;
        while (next && next.classList.contains('cv-section-drop-preview')) next = next.nextElementSibling;
        target.parentElement.insertBefore(preview, next);
    } else dropContainer.append(preview);

    if (position !== 'append') {
        target.classList.add('cv-section-drop-target', position === 'after' ? 'cv-section-drop-after' : 'cv-section-drop-before');
    } else {
        dropContainer.classList.add('cv-column-drop-target');
    }
}

const nextSkillCategory = skills => {
    const categories = new Set((skills || []).map(skill => value(skill.category)));
    let category = 'Nhóm kỹ năng mới';
    let suffix = 2;
    while (categories.has(category)) category = `Nhóm kỹ năng mới ${suffix++}`;
    return category;
};
export const cvTemplateFontCss = `@font-face{font-family:CVNoto;src:url('${notoLatinRegular}');font-weight:400}
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

function EditableBulletList({details, path, onEdit, project = false, emphasizeLabels = false}) {
    const normalized = normalizeBulletDetails(details);
    if (typeof onEdit !== 'function') return <ul className={project ? 'project-details' : 'bullet-details'}>
        {normalized.map((line, index) => {
            const label = emphasizeLabels && line.match(/^(Project description|Responsibilities|Tech stack|Team size):\s*/i);
            return <li key={index}>{label ? <><strong>{label[1]}:</strong> {line.slice(label[0].length)}</> : line}</li>;
        })}
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

function SectionActions({sectionKey, column, index, count, onMove, onReorder, onRemove, onAdd, addValue, addLabel, dragOnly = false}) {
    return <div className="cv-section-actions" role="toolbar" aria-label="Thao tác mục CV">
        {onReorder && <button type="button" className="cv-section-drag-handle" draggable="true"
            title="Kéo để sắp xếp mục" aria-label="Kéo để sắp xếp mục"
            onDragStart={event => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', JSON.stringify({sectionKey, column}));
                const section = event.currentTarget.closest('section');
                section?.classList.add('cv-section-dragging');
                if (section && event.dataTransfer.setDragImage) {
                    // The full section as a native drag image duplicates its text over
                    // the in-flow destination preview. Keep the native drag ghost hidden.
                    const dragImage = document.createElement('canvas');
                    dragImage.width = 1;
                    dragImage.height = 1;
                    event.dataTransfer.setDragImage(dragImage, 0, 0);
                }
            }} onDragEnd={event => {
                const root = event.currentTarget.closest('.cv-standard-document');
                clearSectionDropPreview(root);
                root?.querySelectorAll('.cv-section-dragging').forEach(target => target.classList.remove('cv-section-dragging'));
            }}><GripVertical size={15}/></button>}
        {!dragOnly && onMove && <><button type="button" title="Di chuyển mục lên" aria-label="Di chuyển mục lên" disabled={index <= 0} onClick={() => onMove(sectionKey, column, -1)}><ArrowUp size={14}/></button>
            <button type="button" title="Di chuyển mục xuống" aria-label="Di chuyển mục xuống" disabled={index >= count - 1} onClick={() => onMove(sectionKey, column, 1)}><ArrowDown size={14}/></button></>}
        {!dragOnly && onRemove && <button type="button" className="cv-item-delete" title="Xóa mục" aria-label="Xóa mục" onClick={() => onRemove(sectionKey)}><Trash2 size={14}/></button>}
        {!dragOnly && <AddButton onAdd={onAdd} path={sectionKey === 'personalInfo' ? 'personalInfo.customFields' : sectionKey} value={addValue} label={addLabel}/>}
    </div>;
}

function CvSection({sectionKey, column, index, count, title, onSectionMove, onSectionReorder, onSectionRemove, onAdd, addValue, addLabel, side = false, className = '', dragOnly = false, children}) {
    const handleDragOver = event => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const section = event.currentTarget;
        const root = section.closest('.cv-standard-document');
        if (isPointerOverDropPreview(root, event)) return;
        const source = root?.querySelector('.cv-section-dragging');
        if (source === section) {
            clearSectionDropPreview(root);
            return;
        }
        const after = event.clientY >= section.getBoundingClientRect().top + section.getBoundingClientRect().height / 2;
        showSectionDropPreview(section, after ? 'after' : 'before', column);
    };
    const handleDragLeave = event => {
        const root = event.currentTarget.closest('.cv-standard-document');
        if (!root?.querySelector('.cv-section-drop-preview') && !event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.classList.remove('cv-section-drop-target', 'cv-section-drop-before', 'cv-section-drop-after');
        }
    };
    const handleDrop = event => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.stopPropagation();
        const target = event.currentTarget;
        const root = target.closest('.cv-standard-document');
        try {
            const source = JSON.parse(event.dataTransfer.getData('text/plain'));
            const preview = root?.querySelector('.cv-section-drop-preview');
            const targetColumn = preview?.dataset.dropColumn || column;
            const dropPosition = event.clientY >= target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2
                ? 'after' : 'before';
            const targetKey = preview
                ? preview.dataset.dropTargetKey || null
                : getSectionDropTargetKey(root, target, targetColumn, dropPosition);
            const sourceElement = root?.querySelector('.cv-section-dragging');
            clearSectionDropPreview(root);
            if (sourceElement && sectionDropChangesLayout(root, sourceElement, targetKey || null, targetColumn)) {
                onSectionReorder(source.sectionKey, source.column, targetKey || null, targetColumn);
            }
        } catch {
            // Ignore drops that were not started from a section drag handle.
        }
    };
    return <section data-section-key={sectionKey} className={`${side ? 'cv-standard-side-section' : 'cv-standard-section'} ${className}`.trim()}
        onDragOver={onSectionReorder ? handleDragOver : undefined}
        onDragLeave={onSectionReorder ? handleDragLeave : undefined}
        onDrop={onSectionReorder ? handleDrop : undefined}>
        <div className={`${side ? 'cv-standard-side-heading' : 'cv-standard-section-heading'} cv-editable-section`}>
            <SectionActions sectionKey={sectionKey} column={column} index={index} count={count}
                onMove={dragOnly ? undefined : onSectionMove} onReorder={onSectionReorder}
                onRemove={dragOnly || sectionKey === 'personalInfo' || sectionKey === 'name' ? undefined : onSectionRemove}
                onAdd={dragOnly || sectionKey === 'name' ? undefined : onAdd} addValue={addValue} addLabel={addLabel} dragOnly={dragOnly}/>
            <h2 className={side ? 'side-title' : 'cv-standard-section-title'}>{title}</h2>
        </div>{children}
    </section>;
}

function getSkillGroups(skills = [], languages = [], editing = false) {
    const languageNames = new Set(languages.map(item => value(item.name).toLowerCase()));
    const groups = new Map();
    skills.forEach((skill, index) => {
        const name = value(skill.name);
        const normalizedName = name.toLowerCase();
        const duplicatesLanguage = name && (
            [...languageNames].some(language => normalizedName === language
                || normalizedName.startsWith(`${language}:`) || normalizedName.startsWith(`${language} `))
            || /^english\s*[:-]/i.test(name)
        );
        if ((!name && !editing) || duplicatesLanguage) return;
        const category = value(skill.category) || 'Other';
        if (!groups.has(category)) groups.set(category, []);
        groups.get(category).push({name, level: value(skill.level), index});
    });
    return [...groups];
}

function getCloudSkillTiers(skills = [], languages = [], editing = false) {
    const languageNames = new Set(languages.map(item => value(item.name).toLowerCase()));
    const tiers = new Map([['Excellent', []], ['Intermediate', []], ['Beginner', []]]);
    skills.forEach((skill, index) => {
        const name = value(skill.name);
        const normalizedName = name.toLowerCase();
        const duplicatesLanguage = name && (
            [...languageNames].some(language => normalizedName === language
                || normalizedName.startsWith(`${language}:`) || normalizedName.startsWith(`${language} `))
            || /^english\s*[:-]/i.test(name)
        );
        if ((!name && !editing) || duplicatesLanguage) return;
        const level = value(skill.level).toUpperCase();
        const tier = ['EXPERT', 'ADVANCED', 'EXCELLENT'].includes(level) ? 'Excellent'
            : level === 'INTERMEDIATE' ? 'Intermediate' : 'Beginner';
        tiers.get(tier).push({name, level: value(skill.level), index});
    });
    return [...tiers].filter(([, items]) => items.length);
}

function SkillGroups({templateId, skills = [], languages = [], onEdit, onAdd, onMove, onRemove, onGroupMove, onGroupRemove, onRename}) {
    const variant = {'boardroom-ready':'boardroom', 'data-scientist':'data', 'security-analyst':'security',
        'cloud-expert':'cloud', 'portfolio-hybrid':'portfolio', 'the-standard':'standard'}[templateId] || 'standard';
    if (variant === 'cloud' || variant === 'security') {
        const entries = getCloudSkillTiers(skills, languages, typeof onEdit === 'function');
        return <div className="cv-skill-groups cv-skill-groups-cloud">{entries.map(([category, items]) =>
            <div key={category} className="cv-skill-group cv-skill-group-cloud">
                <strong className="cv-skill-category cloud-skill-heading">{category}</strong>
                <div className="cloud-skill-grid"><div className="chips">{items.map(item =>
                    <EditableItem key={item.index} path="skills" index={item.index} count={skills.length}
                        onMove={onMove} onRemove={onRemove} onAdd={onAdd}
                        addValue={{name:'', category, level:''}} addLabel="kỹ năng" className="cv-skill-item">
                        <span className="chip"><EditableText as="span" path={`skills.${item.index}.name`} onEdit={onEdit} placeholder="Kỹ năng">{item.name}</EditableText>
                            {item.level && <span className="cv-skill-level"> ({item.level})</span>}</span>
                    </EditableItem>)}</div></div>
            </div>)}</div>;
    }
    const entries = getSkillGroups(skills, languages, typeof onEdit === 'function');
    return <div className={`cv-skill-groups cv-skill-groups-${variant}`}>{entries.map(([category, items], groupIndex) => {
        const categoryField = <EditableText as="strong" className="cv-skill-category"
            onEdit={onRename ? (_, next) => onRename(category, next) : undefined} path="category" placeholder="Tên nhóm kỹ năng">{category}</EditableText>;
        const chips = <div className="chips">{items.map(item => <EditableItem key={item.index} path="skills" index={item.index} count={skills.length}
            onMove={onMove} onRemove={onRemove} onAdd={onAdd} addValue={{name:'',category,level:''}} addLabel="kỹ năng" className="cv-skill-item">
            <span className="chip"><EditableText as="span" path={`skills.${item.index}.name`} onEdit={onEdit} placeholder="Kỹ năng">{item.name}</EditableText>
                {item.level && <span className="cv-skill-level"> ({item.level})</span>}</span>
        </EditableItem>)}</div>;
        const content = variant === 'data' ? <><div className="data-skill-heading">{categoryField}</div>{chips}</>
            : variant === 'security' ? <><div className="security-skill-heading">{categoryField}</div>{chips}</>
                : variant === 'cloud' ? <><div className="cloud-skill-heading">{categoryField}</div><div className="cloud-skill-grid">{chips}</div></>
                    : variant === 'portfolio' ? <><div className="portfolio-skill-heading">{categoryField}</div>{chips}</>
                        : <>{categoryField}{chips}</>;
        return <EditableItem key={category} path="skills" index={groupIndex} count={entries.length}
            onMove={onGroupMove ? (...args) => onGroupMove(category, args[2]) : undefined}
            onRemove={onGroupRemove ? () => onGroupRemove(category) : undefined}
            onAdd={onAdd} addValue={{name:'',category,level:''}} addLabel="nhóm kỹ năng"
            className={`cv-skill-group cv-skill-group-${variant}${/^soft[\s-]*skills?$/i.test(category) ? ' cv-soft-skills' : ''}`}>{content}</EditableItem>;
    })}</div>;
}

function ExperienceList({templateId, items = [], onEdit, onMove, onRemove, onAdd, addValue}) {
    const variant = {'boardroom-ready':'boardroom', 'data-scientist':'data', 'security-analyst':'security',
        'cloud-expert':'cloud', 'portfolio-hybrid':'portfolio', 'the-standard':'standard'}[templateId] || 'standard';
    return <div className={`experience-list experience-list-${variant}`}>{items.map((item, index) => {
        const period = <EditableText as="span" className="period" path={`experiences.${index}.period`} onEdit={onEdit} placeholder="Thời gian">{value(item.period)}</EditableText>;
        const role = <EditableText as="h3" path={`experiences.${index}.role`} onEdit={onEdit} placeholder="Vị trí">{value(item.role)}</EditableText>;
        const company = <div className="company"><span>at </span><EditableText path={`experiences.${index}.company`} onEdit={onEdit} placeholder="Công ty">{value(item.company)}</EditableText></div>;
        const cloudCompany = <div className="company cloud-company"><span aria-hidden="true">|</span><EditableText path={`experiences.${index}.company`} onEdit={onEdit} placeholder="Công ty">{value(item.company)}</EditableText></div>;
        const portfolioCompany = <div className="company portfolio-company"><EditableText path={`experiences.${index}.company`} onEdit={onEdit} placeholder="Công ty">{value(item.company)}</EditableText></div>;
        const bullets = <EditableBulletList details={item.details} path={`experiences.${index}.details`} onEdit={onEdit}/>;
        const content = variant === 'boardroom' ? <><div className="reference-experience-heading">{role}{portfolioCompany}{period}</div>{bullets}</>
            : variant === 'security' ? <><div className="security-reference-entry-heading">{role}{period}</div>{portfolioCompany}{bullets}</>
            : variant === 'data' ? <><div className="reference-data-heading">{role}{period}</div>{portfolioCompany}{bullets}</>
                    : variant === 'cloud' ? <><div className="cloud-entry-period">{period}</div><div className="cloud-entry-heading">{role}{cloudCompany}</div>{bullets}</>
                        : variant === 'portfolio' ? <><div className="portfolio-entry-heading"><div className="portfolio-role-company">{role}{portfolioCompany}</div>{period}</div>{bullets}</>
                            : <><div className="standard-entry-heading">{period}</div><div className="standard-role-company">{role}{company}</div>{bullets}</>;
        return <EditableItem key={item.id || index} path="experiences" index={index} count={items.length}
            onMove={onMove} onRemove={onRemove} onAdd={onAdd} addValue={addValue} addLabel="kinh nghiệm"
            className={`experience-entry experience-entry-${variant}`}>{content}</EditableItem>;
    })}</div>;
}

function ProjectList({templateId, items = [], onEdit, onMove, onRemove, onAdd, addValue}) {
    const variant = {'boardroom-ready':'boardroom', 'data-scientist':'data', 'security-analyst':'security',
        'cloud-expert':'cloud', 'portfolio-hybrid':'portfolio', 'the-standard':'standard'}[templateId] || 'standard';
    return <div className={`project-list project-list-${variant}`}>{items.map((item, index) => {
        const period = <EditableText as="span" className="period" path={`projects.${index}.period`} onEdit={onEdit} placeholder="Thời gian">{value(item.period)}</EditableText>;
        const name = <EditableText as="h3" path={`projects.${index}.name`} onEdit={onEdit} placeholder="Tên dự án">{value(item.name)}</EditableText>;
        const projectUrl = value(item.url);
        const hasClickableProjectUrl = /^https?:\/\//i.test(projectUrl);
        const supportsProjectLinkIcon = ['cloud', 'portfolio'].includes(variant);
        const projectLink = supportsProjectLinkIcon && typeof onEdit === 'function'
            ? <span className={`project-link-editor${hasClickableProjectUrl ? ' has-project-link' : ''}`}>
                <button type="button" className={`${variant}-project-link project-link-icon project-link-edit-button`}
                    aria-label="Nhập liên kết dự án" title="Nhập liên kết dự án"><ExternalLink aria-hidden="true"/></button>
                <span className="project-link-popover">
                    <label htmlFor={`project-url-${index}`}>Liên kết dự án</label>
                    <input id={`project-url-${index}`} type="url" inputMode="url" defaultValue={projectUrl}
                        placeholder="https://..." aria-label="Liên kết dự án"
                        onKeyDown={event => {
                            if (event.key === 'Enter') event.currentTarget.blur();
                            if (event.key === 'Escape') event.currentTarget.blur();
                        }}
                        onBlur={event => {
                            const next = event.currentTarget.value.trim();
                            if (next !== projectUrl) onEdit(`projects.${index}.url`, next);
                        }}/>
                </span>
            </span>
            : supportsProjectLinkIcon && hasClickableProjectUrl
                ? <a className={`${variant}-project-link project-link-icon`} href={projectUrl} target="_blank" rel="noreferrer" aria-label="Mở liên kết dự án"><ExternalLink aria-hidden="true"/></a>
                : null;
        const cloudName = <div className="cloud-project-title">{name}{projectLink}</div>;
        const portfolioName = <div className="portfolio-project-title">{name}{projectLink}</div>;
        const bullets = <EditableBulletList details={item.details} path={`projects.${index}.details`} onEdit={onEdit} project
            emphasizeLabels={['boardroom', 'security'].includes(variant)}/>;
        const metadata = <div className="project-meta">
            {(onEdit || value(item.techStack)) && <p className="project-detail"><strong>Tech stack:</strong> <EditableText path={`projects.${index}.techStack`} onEdit={onEdit} placeholder="Công nghệ">{value(item.techStack)}</EditableText></p>}
            {(onEdit || value(item.teamSize)) && <p className="project-detail"><strong>Team size:</strong> <EditableText path={`projects.${index}.teamSize`} onEdit={onEdit} placeholder="Quy mô nhóm">{value(item.teamSize)}</EditableText></p>}
            {!['cloud', 'portfolio'].includes(variant) && (onEdit || value(item.url)) && <p className="project-detail">{variant === 'security' && !onEdit && /^https?:\/\//i.test(value(item.url))
                ? <>Project URL: <a href={value(item.url)} target="_blank" rel="noreferrer">{value(item.url)}</a></>
                : <EditableText path={`projects.${index}.url`} onEdit={onEdit} placeholder="Liên kết">{value(item.url)}</EditableText>}</p>}
        </div>;
        const content = variant === 'boardroom' ? <><div className="reference-project-heading">{name}{period}</div>{bullets}{metadata}</>
            : variant === 'security' ? <><div className="security-reference-entry-heading">{name}{period}</div>{bullets}{metadata}</>
            : variant === 'data' ? <><div className="data-entry-period">{period}</div>{name}{bullets}{metadata}</>
                    : variant === 'cloud' ? <><div className="cloud-entry-period">{period}</div>{cloudName}{bullets}{metadata}</>
                        : variant === 'portfolio' ? <><div className="portfolio-entry-heading portfolio-project-heading">{portfolioName}{period}</div>{bullets}{metadata}</>
                            : <><div className="standard-entry-heading">{period}{name}</div>{bullets}{metadata}</>;
        return <EditableItem key={item.id || index} path="projects" index={index} count={items.length}
            onMove={onMove} onRemove={onRemove} onAdd={onAdd} addValue={addValue} addLabel="dự án"
            className={`project-entry project-entry-${variant}`}>{content}</EditableItem>;
    })}</div>;
}

function ProfilePhoto({source}) {
    return <div className="cv-standard-photo-wrap">
        {value(source) ? <img className="cv-standard-photo" src={source} alt="Ảnh hồ sơ"/>
            : <div className="cv-standard-photo-placeholder" role="img" aria-label="Ảnh hồ sơ mặc định"/>}
    </div>;
}

export default function EditableCvHtmlTemplate({data: source = {}, templateId = 'the-standard', onEdit, onAdd, onMove, onRemove,
    onSectionMove, onSectionReorder, onSectionRemove, onSkillGroupMove, onSkillGroupRemove, onSkillRename, onClear, includeStyles = true}) {
    const data = source || {};
    const personal = data.personalInfo || {};
    const sections = getVisibleCvPdfSections(data);
    const layout = data.editorLayout || {};
    const hidden = new Set((layout.hiddenSections || []).filter(key => key !== 'name'));
    const templateLayout = getCvTemplateLayout(layout, templateId);
    const securityTemplate = templateId === 'security-analyst';
    const referenceTemplate = ['data-scientist', 'boardroom-ready'].includes(templateId);
    const executiveTemplate = templateId === 'boardroom-ready';
    const contactDefaults = ['phone', 'email', 'dob', 'address', 'linkedin'];
    const personalContactOrder = ['portfolio-hybrid', 'cloud-expert'].includes(templateId)
        ? contactDefaults
        : [...new Set([...(layout.personalInfoOrder || []), ...contactDefaults])]
            .filter(field => contactDefaults.includes(field));
    const cloudExtraContactRows = templateId === 'cloud-expert'
        ? (Array.isArray(personal.customFields) ? personal.customFields.length : 0)
        : 0;
    const cloudPanelOffset = cloudExtraContactRows * 26;
    const cloudPanelShoulder = 245 + cloudPanelOffset;
    const cloudTemplateStyle = templateId === 'cloud-expert' ? {
        '--cloud-panel-height': `${530 + cloudPanelOffset}px`,
        '--cloud-panel-shape': `path('M 0 0 H 278 L 245 ${cloudPanelShoulder} Q 243 ${cloudPanelShoulder + 15} 227 ${cloudPanelShoulder + 18} C 171 ${cloudPanelShoulder + 26} 98 ${cloudPanelShoulder + 31} 34 ${cloudPanelShoulder + 36} L 0 ${500 + cloudPanelOffset} Z')`,
    } : undefined;
    const cloudMainOrder = ['summary', 'experiences', 'projects', 'languages', 'awards'];
    const cloudSideOrder = ['name', 'profilePhoto', 'personalInfo', 'education', 'skills', 'certificates'];
    const portfolioMainOrder = ['name', 'summary', 'experiences', 'projects', 'languages', 'awards'];
    const portfolioSideOrder = ['profilePhoto', 'personalInfo', 'skills', 'education', 'certificates'];
    const forcedMainOrder = templateId === 'cloud-expert' ? cloudMainOrder
        : templateId === 'portfolio-hybrid' ? portfolioMainOrder : templateLayout.mainOrder;
    const forcedSideOrder = templateId === 'cloud-expert' ? cloudSideOrder
        : templateId === 'portfolio-hybrid' ? portfolioSideOrder : templateLayout.sidebarOrder;
    const mainOrder = forcedMainOrder.filter(key => !hidden.has(key));
    const sideOrder = forcedSideOrder.filter(key => !hidden.has(key));
    const experiences = onEdit ? data.experiences || [] : sections.experiences;
    const projects = onEdit ? data.projects || [] : sections.projects;
    const education = onEdit ? data.education || [] : sections.education;
    const certificates = onEdit ? data.certificates || [] : sections.certificates;
    const languages = onEdit ? data.languages || [] : sections.languages;
    const awards = onEdit ? data.awards || [] : sections.awards;
    const contactFields = [['Phone', 'phone'], ['Email', 'email'], ['Date of birth', 'dob'], ['Area', 'address'], ['LinkedIn', 'linkedin']];
    const cloudContactIcons = {phone: Phone, email: Mail, address: MapPin, dob: CalendarDays, linkedin: Globe};
    const nameBackgroundMoves = templateId === 'the-standard';
    const headerInSidebar = false;
    const renderNameCluster = () => <div className="cv-name-cluster">
        <EditableText as="h1" className="cv-standard-name" path="personalInfo.name" onEdit={onEdit} placeholder="Họ và tên">{value(personal.name)}</EditableText>
        <EditableText as="div" className="cv-standard-title" path="professionalTitle" onEdit={onEdit} placeholder="Vị trí ứng tuyển">{value(data.professionalTitle)}</EditableText>
    </div>;
    const renderSection = (key, column, order) => {
        const side = column === 'sidebar';
        const index = order.indexOf(key);
        const sectionProps = {sectionKey:key, column, index, count:order.length, side,
            onSectionMove, onSectionReorder: securityTemplate && ['name', 'profilePhoto'].includes(key) ? undefined : onSectionReorder, onSectionRemove, onAdd};
        if (key === 'name') return <CvSection key={key} {...sectionProps} title="" dragOnly
            className={`cv-name-section${nameBackgroundMoves ? ' cv-name-section-moves-background' : ''}`}>
            {nameBackgroundMoves
                ? <header className="cv-standard-header">{renderNameCluster()}</header>
                : renderNameCluster()}
        </CvSection>;
        if (key === 'profilePhoto') {
            if (!supportsProfilePhoto(templateId)) return null;
            return <CvSection key={key} {...sectionProps} title="" onAdd={undefined}
                className={`cv-photo-section${onEdit ? '' : ' cv-photo-section-readonly'}`}>
                <ProfilePhoto source={data.profilePhoto}/>
            </CvSection>;
        }
        if (key === 'summary') {
            if (!onEdit && !value(data.summary)) return null;
            const summaryTitle = { 'the-standard': 'Summary', 'data-scientist': 'About Me', 'boardroom-ready': 'Professional Summary',
                'security-analyst': 'About Me', 'cloud-expert': 'Professional Summary', 'portfolio-hybrid': 'About Me' }[templateId] || 'Summary';
            return <CvSection key={key} {...sectionProps} title={templateId === 'portfolio-hybrid' ? '' : summaryTitle} onAdd={undefined}>
                <EditableText as="div" className="cv-standard-summary" path="summary" onEdit={onEdit} multiline placeholder="Giới thiệu bản thân">{value(data.summary)}</EditableText>
            </CvSection>;
        }
        if (key === 'personalInfo') {
            const customFields = (personal.customFields || []).map(field => typeof field === 'string'
                ? {label: '', value: field} : field || {label: '', value: ''});
            const personalTitle = templateId === 'security-analyst' ? 'Personal Details'
                : templateId === 'portfolio-hybrid' ? '' : 'Personal Information';
            return <CvSection key={key} {...sectionProps} title={personalTitle} addValue={{label:'',value:''}} addLabel="thông tin">
                <div className="cv-standard-contacts">
                    {personalContactOrder.filter(field => onEdit || value(personal[field])).map((field, contactIndex) => {
                        const [label] = contactFields.find(([, fieldKey]) => fieldKey === field);
                        const ContactIcon = cloudContactIcons[field];
                        return <Fragment key={field}>
                            {templateId === 'data-scientist' && contactIndex === 3 && <span className="cv-reference-contact-break" aria-hidden="true"/>}
                            <EditableItem path="personalInfo.contacts" index={personalContactOrder.indexOf(field)} count={personalContactOrder.length}
                            onMove={onMove} onAdd={onAdd ? (_, newField) => onAdd('personalInfo.customFields', newField) : undefined}
                            addValue={{label:'',value:''}} addLabel="thông tin" className="cv-standard-contact">
                            <span className="cv-standard-contact-icon">{ContactIcon ? <ContactIcon aria-hidden="true"/> : label[0]}</span><span className="cv-standard-contact-value"><EditableText path={`personalInfo.${field}`} onEdit={onEdit} placeholder={label}>{value(personal[field])}</EditableText></span>
                        </EditableItem></Fragment>;
                    })}
                    {['dob', 'linkedin'].filter(field => !personalContactOrder.includes(field) && value(personal[field])).map(field => <div className="cv-standard-contact" key={field}>
                        <span className="cv-standard-contact-icon">{templateId === 'cloud-expert'
                            ? (() => { const Icon = cloudContactIcons[field]; return <Icon aria-hidden="true"/>; })()
                            : field === 'dob' ? 'D' : 'L'}</span>
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
        if (key === 'skills' && !onEdit && !(data.skills || []).some(skill => value(skill.name)
            && !languages.some(language => value(language.name).toLowerCase() === value(skill.name).toLowerCase()))) return null;
        if (key === 'skills') return <CvSection key={key} {...sectionProps} title={referenceTemplate ? <>{executiveTemplate && <Wrench className="cv-reference-section-icon"/>}Skill</> : 'Skill'} addValue={{name:'', category:nextSkillCategory(data.skills), level:''}} addLabel="nhóm kỹ năng">
            <SkillGroups templateId={templateId} skills={data.skills || []} languages={languages} onEdit={onEdit} onAdd={onAdd} onMove={onMove} onRemove={onRemove}
                onGroupMove={onSkillGroupMove} onGroupRemove={onSkillGroupRemove} onRename={onSkillRename}/>
        </CvSection>;
        if (key === 'experiences') {
            if (!onEdit && !experiences.length) return null;
            return <CvSection key={key} {...sectionProps} title={<>{executiveTemplate && <BriefcaseBusiness className="cv-reference-section-icon"/>}Work Experience</>}
                onAdd={experiences.length ? undefined : onAdd} addValue={{role:'',company:'',period:'',details:['']}} addLabel="kinh nghiệm">
                <ExperienceList templateId={templateId} items={experiences} onEdit={onEdit} onMove={onMove} onRemove={onRemove}
                    onAdd={onAdd} addValue={{role:'',company:'',period:'',details:['']}}/>
            </CvSection>;
        }
        if (key === 'projects') {
            if (!onEdit && !projects.length) return null;
            const projectTitle = executiveTemplate ? 'Project:' : securityTemplate || templateId === 'cloud-expert' ? 'Personal Project'
                : templateId === 'portfolio-hybrid' ? 'Highlight Project' : 'Projects';
            return <CvSection key={key} {...sectionProps} title={projectTitle} onAdd={projects.length ? undefined : onAdd}
                addValue={{name:'',period:'',techStack:'',teamSize:'',url:'',details:['']}} addLabel="dự án">
                <ProjectList templateId={templateId} items={projects} onEdit={onEdit} onMove={onMove} onRemove={onRemove}
                    onAdd={onAdd} addValue={{name:'',period:'',techStack:'',teamSize:'',url:'',details:['']}}/>
            </CvSection>;
        }
        const rows = key === 'education' ? education : key === 'certificates' ? certificates : key === 'languages' ? languages : awards;
        const addValues = {education:{school:'',degree:'',year:'',gpa:'',details:[]}, certificates:{name:'',issuer:'',date:'',url:''}, languages:{name:'',level:''}, awards:{name:'',issuer:'',date:''}};
        const labels = {education:'học vấn', certificates:'chứng chỉ', languages:'ngoại ngữ', awards:'giải thưởng'};
        const title = {education:'Education', certificates:'Certificate', languages:'Foreign Language', awards:'Award'}[key];
        if (!onEdit && !rows.length) return null;
        return <CvSection key={key} {...sectionProps} title={title} onAdd={rows.length ? undefined : onAdd} addValue={addValues[key]} addLabel={labels[key]}>
            {rows.map((item, itemIndex) => <EditableItem key={item.id || itemIndex} path={key} index={itemIndex} count={rows.length}
                onMove={onMove} onRemove={onRemove} onAdd={onAdd} addValue={addValues[key]} addLabel={labels[key]}
                className={`cv-standard-side-item${key === 'languages' ? ' cv-standard-language' : ''}`}>
                {key === 'education' ? <><EditableText as="h3" className="cv-standard-school" path={`education.${itemIndex}.school`} onEdit={onEdit} placeholder="Trường">{value(item.school)}</EditableText>
                    <EditableText as="div" className="cv-standard-degree" path={`education.${itemIndex}.degree`} onEdit={onEdit} placeholder="Ngành học">{value(item.degree)}</EditableText>
                    <EditableText as="div" className="cv-standard-muted cv-education-period" path={`education.${itemIndex}.${value(item.year) ? 'year' : 'period'}`} onEdit={onEdit} placeholder="Thời gian">{value(item.year || item.period)}</EditableText>
                    <EditableGpa path={`education.${itemIndex}.gpa`} value={item.gpa} onEdit={onEdit}/>
                    {(referenceTemplate || securityTemplate) && (onEdit || item.details?.length > 0) && <EditableBulletList details={item.details}
                        path={`education.${itemIndex}.details`} onEdit={onEdit}/>}</>
                    : key === 'languages' ? <><EditableText as="strong" path={`languages.${itemIndex}.name`} onEdit={onEdit} placeholder="Ngoại ngữ">{value(item.name)}</EditableText>
                        <EditableText as="span" path={`languages.${itemIndex}.level`} onEdit={onEdit} placeholder="Trình độ">{value(item.level)}</EditableText></>
                    : <><EditableText as="h3" className="cv-standard-item-title" path={`${key}.${itemIndex}.name`} onEdit={onEdit} placeholder="Tên">{value(item.name)}</EditableText>
                        <EditableText as="div" className="cv-standard-item-body" path={`${key}.${itemIndex}.issuer`} onEdit={onEdit} placeholder="Đơn vị cấp">{value(item.issuer)}</EditableText>
                        <EditableText as="div" className="cv-standard-muted cv-record-date" path={`${key}.${itemIndex}.date`} onEdit={onEdit} placeholder="Ngày">{value(item.date)}</EditableText>
                        {key === 'certificates' && (!onEdit && /^https?:\/\//i.test(value(item.url))
                            ? <a className="cv-certificate-link" href={value(item.url)} target="_blank" rel="noreferrer">View certificate</a>
                            : <EditableText as="div" className="cv-standard-muted" path={`certificates.${itemIndex}.url`} onEdit={onEdit} placeholder="Liên kết">{value(item.url)}</EditableText>)}</>}
            </EditableItem>)}
        </CvSection>;
    };
    const handleColumnDragOver = event => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        const root = event.currentTarget.closest('.cv-standard-document');
        if (isPointerOverDropPreview(root, event) || event.target.closest?.('[data-section-key]')) return;
        const column = event.currentTarget.closest('.cv-standard-sidebar') ? 'sidebar' : 'main';
        const targetKey = getColumnInsertionTarget(root, column, event.clientY);
        if (targetKey) {
            const target = root.querySelector(`[data-section-key="${CSS.escape(targetKey)}"]`);
            if (target) {
                showSectionDropPreview(target, 'before', column);
                return;
            }
        }
        showSectionDropPreview(event.currentTarget, 'append', column);
    };
    const handleColumnDragLeave = event => {
        const root = event.currentTarget.closest('.cv-standard-document');
        if (!root?.querySelector('.cv-section-drop-preview') && event.target === event.currentTarget && !event.currentTarget.contains(event.relatedTarget)) {
            event.currentTarget.classList.remove('cv-column-drop-target');
        }
    };
    const handleColumnDrop = (event, column) => {
        if (!onSectionReorder) return;
        event.preventDefault();
        event.stopPropagation();
        const root = event.currentTarget.closest('.cv-standard-document');
        try {
            const source = JSON.parse(event.dataTransfer.getData('text/plain'));
            const preview = root?.querySelector('.cv-section-drop-preview');
            const targetKey = preview
                ? preview.dataset.dropTargetKey || null
                : getColumnInsertionTarget(root, column, event.clientY);
            const targetColumn = preview?.dataset.dropColumn || column;
            clearSectionDropPreview(root);
            const sourceElement = root?.querySelector('.cv-section-dragging');
            if (sourceElement && sectionDropChangesLayout(root, sourceElement, targetKey, targetColumn)) {
                onSectionReorder(source.sectionKey, source.column, targetKey, targetColumn);
            }
        } catch {
            // Ignore drops that were not started from a section drag handle.
        }
    };
    const templateClasses = ['cv-standard', `cv-template-${templateId}`,
        referenceTemplate ? 'cv-reference-template' : '', executiveTemplate ? 'cv-reference-executive' : '', securityTemplate ? 'cv-security-reference' : '',
        templateLayout.columns === 1 ? 'cv-single-column' : '',
        templateLayout.sidebarFirst ? 'cv-sidebar-first' : ''].filter(Boolean).join(' ');
    const renderHeader = className => <header className={`cv-standard-header ${className || ''}`.trim()}>
        <div className="cv-standard-name cv-standard-name-spacer" aria-hidden="true"/>
        <div className="cv-standard-title cv-standard-title-spacer" aria-hidden="true"/>
    </header>;
    return <div className="cv-standard-document">{includeStyles && <style>{cvTemplateFontCss}{templateCss}</style>}
        <div className={templateClasses} style={cloudTemplateStyle}>
            <main className="cv-standard-main" onDragOver={onSectionReorder ? handleColumnDragOver : undefined}
            onDragLeave={onSectionReorder ? handleColumnDragLeave : undefined}
            onDrop={onSectionReorder ? event => handleColumnDrop(event, 'main') : undefined}>{!referenceTemplate && !headerInSidebar && !nameBackgroundMoves && templateId !== 'security-analyst' && templateId !== 'cloud-expert' && templateId !== 'portfolio-hybrid' && renderHeader()}
                <div className="cv-standard-content" onDragOver={onSectionReorder ? handleColumnDragOver : undefined}
                onDragLeave={onSectionReorder ? handleColumnDragLeave : undefined}
                onDrop={onSectionReorder ? event => handleColumnDrop(event, 'main') : undefined}>
                    {mainOrder.map(key => renderSection(key, 'main', mainOrder))}</div></main>
            <aside className="cv-standard-sidebar" onDragOver={onSectionReorder && templateLayout.columns > 1 ? handleColumnDragOver : undefined}
                onDragLeave={onSectionReorder ? handleColumnDragLeave : undefined}
                onDrop={onSectionReorder && templateLayout.columns > 1 ? event => handleColumnDrop(event, 'sidebar') : undefined}>{headerInSidebar && renderHeader('cv-sidebar-header')}
                {sideOrder.map(key => renderSection(key, 'sidebar', sideOrder))}
            </aside>
        </div>
    </div>;
}
