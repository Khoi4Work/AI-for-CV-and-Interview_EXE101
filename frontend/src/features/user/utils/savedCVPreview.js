export function getSavedCVPreviewData(cv) {
    const content = cv?.content;
    if (!content || typeof content !== 'object' || Array.isArray(content)) return null;
    const list = value => Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : [];
    return {
        ...content,
        personalInfo: { name: '', email: '', phone: '', dob: '', address: '', linkedin: '', ...content.personalInfo },
        summary: content.summary || '',
        experiences: list(content.experiences).map((item, index) => ({ ...item, id: item.id ?? index,
            details: Array.isArray(item.details) ? item.details : [] })),
        skills: list(content.skills), education: list(content.education),
        projects: list(content.projects).map(item => ({ ...item, details: Array.isArray(item.details) ? item.details : [] })),
        certificates: list(content.certificates), languages: list(content.languages), awards: list(content.awards),
        profilePhoto: content.profilePhoto || '',
        selectedTemplateId: cv.template?.id || content.selectedTemplateId || null,
    };
}
