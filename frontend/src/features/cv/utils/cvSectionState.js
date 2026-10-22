function hasContent(value) {
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.some(hasContent);
    return value !== null && value !== undefined;
}

const SECTION_FIELDS = {
    skills: ['name', 'category', 'level'],
    projects: ['name', 'period', 'date', 'details', 'techStack', 'teamSize', 'url'],
    certificates: ['name', 'issuer', 'date', 'url'],
    languages: ['name', 'level'],
    awards: ['name', 'issuer', 'date'],
};

export function sectionHasContent(section, items) {
    const fields = SECTION_FIELDS[section] || [];
    return Array.isArray(items) && items.some(item => fields.some(field => hasContent(item?.[field])));
}

export function replaceCvSectionItems(previous, section, items) {
    const editorLayout = previous.editorLayout || {};
    const hiddenSections = editorLayout.hiddenSections || [];
    const shouldReveal = sectionHasContent(section, items) && hiddenSections.includes(section);

    return {
        ...previous,
        [section]: items,
        ...(shouldReveal ? {
            editorLayout: {...editorLayout, hiddenSections: hiddenSections.filter(key => key !== section)},
        } : {}),
    };
}
