const asText = value => value === null || value === undefined ? '' : String(value).trim();
const asList = value => Array.isArray(value) ? value : [];
const mapRecords = (value, mapper) => asList(value).filter(item => item && typeof item === 'object').map(mapper);

/** Normalize the canonical CV context once for every PDF template. */
export function mapCvDataForPdf(source = {}) {
    const personalInfo = source.personalInfo && typeof source.personalInfo === 'object' ? source.personalInfo : {};

    return {
        contentLanguage: source.contentLanguage === 'vi' ? 'vi' : 'en',
        personalInfo: {
            name: asText(personalInfo.name),
            email: asText(personalInfo.email),
            phone: asText(personalInfo.phone),
            dob: asText(personalInfo.dob),
            address: asText(personalInfo.address),
            linkedin: asText(personalInfo.linkedin),
        },
        professionalTitle: asText(source.professionalTitle),
        summary: asText(source.summary),
        profilePhoto: asText(source.profilePhoto),
        skills: mapRecords(source.skills, skill => ({
            ...skill,
            name: asText(skill.name),
            level: asText(skill.level),
            category: asText(skill.category),
        })).filter(skill => skill.name),
        experiences: mapRecords(source.experiences, item => ({
            ...item,
            role: asText(item.role),
            company: asText(item.company),
            period: asText(item.period),
            details: asList(item.details).map(asText),
        })),
        projects: mapRecords(source.projects, item => ({
            ...item,
            name: asText(item.name),
            period: asText(item.period),
            details: asList(item.details).map(asText).filter(Boolean),
            url: asText(item.url),
            techStack: asText(item.techStack),
            teamSize: asText(item.teamSize),
        })),
        education: mapRecords(source.education, item => ({
            ...item,
            school: asText(item.school),
            degree: asText(item.degree),
            year: asText(item.year),
            period: asText(item.period),
            gpa: asText(item.gpa),
        })),
        certificates: mapRecords(source.certificates, item => ({
            ...item,
            name: asText(item.name),
            issuer: asText(item.issuer),
            date: asText(item.date),
            url: asText(item.url),
        })),
        languages: mapRecords(source.languages, item => ({
            ...item,
            name: asText(item.name),
            level: asText(item.level),
        })),
        awards: mapRecords(source.awards, item => ({
            ...item,
            name: asText(item.name),
            issuer: asText(item.issuer),
            date: asText(item.date),
        })),
    };
}
