function textValue(value) {
    return typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
}

function hasText(...values) {
    return values.some(value => textValue(value));
}

function hasListText(value) {
    return Array.isArray(value) && value.some(item => textValue(item));
}

const hasExperienceContent = item => hasText(item?.role, item?.company, item?.period) || hasListText(item?.details);
const hasProjectContent = item => hasText(item?.name, item?.period, item?.url, item?.techStack, item?.teamSize)
    || hasListText(item?.details);
const hasEducationContent = item => hasText(item?.school, item?.degree, item?.year, item?.period, item?.gpa);
const hasCertificateContent = item => hasText(item?.name, item?.issuer, item?.date, item?.url);
const hasLanguageContent = item => hasText(item?.name, item?.level);
const hasAwardContent = item => hasText(item?.name, item?.issuer, item?.date);

function populatedItems(items, predicate) {
    return (Array.isArray(items) ? items : []).filter(predicate);
}

export function getVisibleCvPdfSections(data = {}) {
    return {
        experiences: populatedItems(data.experiences, hasExperienceContent),
        projects: populatedItems(data.projects, hasProjectContent),
        education: populatedItems(data.education, hasEducationContent),
        certificates: populatedItems(data.certificates, hasCertificateContent),
        languages: populatedItems(data.languages, hasLanguageContent),
        awards: populatedItems(data.awards, hasAwardContent),
    };
}
