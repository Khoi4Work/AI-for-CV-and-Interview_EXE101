export function mapMockDataToCVContext(mockData) {
    if (!mockData) return {};

    const mapExp = (exp, index, group) => ({
        id: Date.now() + index + (group * 1000),
        company: exp.company || '',
        role: exp.title || '',
        period: exp.dates || '',
        details: exp.bullets || [],
    });

    const proficiencyGroups = mockData.skillsGrouped || {};
    const getProficiencyLevel = (name) => {
        const normalize = value => value.replace(/\s*\(.*\)/, '').trim().toLowerCase();
        if ((proficiencyGroups.excellent || []).some(item => normalize(item) === normalize(name))) return 'EXPERT';
        if ((proficiencyGroups.intermediate || []).some(item => normalize(item) === normalize(name))) return 'INTERMEDIATE';
        if ((proficiencyGroups.beginner || []).some(item => normalize(item) === normalize(name))) return 'BEGINNER';
        return null;
    };

    return {
        personalInfo: {
            name: mockData.name || '',
            email: mockData.contact?.email || '',
            phone: mockData.contact?.phone || '',
            dob: mockData.contact?.dob || '',
            address: mockData.contact?.location || '',
            linkedin: mockData.contact?.linkedin || '',
        },
        summary: mockData.summary || '',
        experiences: [
            ...(mockData.experience1 || []).map((exp, i) => mapExp(exp, i, 1)),
            ...(mockData.experience2 || []).map((exp, i) => mapExp(exp, i, 2)),
            ...(mockData.experience3 || []).map((exp, i) => mapExp(exp, i, 3)),
        ],
        skills: Object.entries(mockData.skills || {}).flatMap(([category, skills]) =>
            skills.map(skill => ({
                name: skill.replace(/\s*\(.*\)/, '').trim(),
                level: getProficiencyLevel(skill),
                category: category || ''
            }))
        ),
        education: (mockData.education || []).map(edu => ({
            degree: edu.degree || '',
            school: edu.school || '',
            year: edu.dates || '',
            gpa: edu.gpa || '',
            details: Array.isArray(edu.details) ? edu.details : [],
        })),
        projects: (mockData.projectsList || []).map(proj => ({
            name: proj.name || '',
            period: proj.dates || '',
            details: proj.bullets || [],
            url: proj.url || '',
        })),
        certificates: (mockData.certificates || []).map(cert => ({
            name: cert.name || '',
            issuer: cert.issuer || '',
            date: cert.date || '',
            url: cert.url || '',
        })),
        languages: (mockData.languages || []).map(lang => ({
            name: lang.name || '',
            level: lang.level || '',
        })),
        awards: (mockData.awards || []).map(award => ({
            name: award.name || '',
            issuer: award.issuer || '',
            date: award.date || '',
        })),
    };
}

export function mapImportedCVData(data) {
    const source = data || {};
    const experiences = Array.isArray(source.experiences) ? source.experiences : [];
    return {
        professionalTitle: source.professionalTitle || '',
        targetRoleCode: source.targetRoleCode || null,
        targetRoleOrigin: source.targetRoleOrigin || 'NONE',
        targetRoleEvidence: source.targetRoleEvidence || null,
        sourceText: source.sourceText || null,
        sourceTruncated: Boolean(source.sourceTruncated),
        profilePhoto: source.profilePhoto || '',
        editorLayout: source.editorLayout ? {
            ...source.editorLayout,
            hiddenSections: (source.editorLayout.hiddenSections || []).filter(section => section !== 'personalInfo' && section !== 'name'),
        } : undefined,
        personalInfo: {
            name: source.personalInfo?.name || '',
            email: source.personalInfo?.email || '',
            phone: source.personalInfo?.phone || '',
            dob: source.personalInfo?.dob || '',
            address: source.personalInfo?.address || '',
            linkedin: source.personalInfo?.linkedin || '',
            customFields: Array.isArray(source.personalInfo?.customFields)
                ? source.personalInfo.customFields.map(item => typeof item === 'string' ? {label: '', value: item} : {...item})
                : [],
        },
        summary: source.summary || '',
        experiences: experiences.map((item, index) => ({
            id: Date.now() + index,
            company: item?.company || '',
            role: item?.role || '',
            period: item?.period || '',
            details: Array.isArray(item?.details) ? item.details : [],
        })),
        skills: (Array.isArray(source.skills) ? source.skills : []).map(skill => ({
            name: skill?.name || '',
            level: skill?.level || null,
            category: skill?.category || '',
        })),
        education: Array.isArray(source.education) ? source.education : [],
        projects: Array.isArray(source.projects) ? source.projects : [],
        certificates: Array.isArray(source.certificates) ? source.certificates : [],
        languages: Array.isArray(source.languages) ? source.languages : [],
        awards: Array.isArray(source.awards) ? source.awards : [],
        selectedTemplateId: source.selectedTemplateId || undefined,
    };
}
