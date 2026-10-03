export function mapCVDataToTemplate(cvData) {
    if (!cvData) return {};

    const experiences = cvData.experiences || [];
    const skills = cvData.skills || [];
    const skillCategory = (skill) => {
        const category = String(skill?.category || '').trim().toLowerCase().replace(/[\s_-]/g, '');
        if (category === 'backend') return 'backend';
        if (category === 'frontend') return 'frontend';
        if (['soft', 'softskill', 'softskills'].includes(category)) return 'soft';
        return 'other';
    };

    return {
        name: cvData.personalInfo?.name || "",
        profilePhoto: cvData.profilePhoto || '',
        title: cvData.professionalTitle || "",
        contact: {
            phone: cvData.personalInfo?.phone || "",
            email: cvData.personalInfo?.email || "",
            dob: cvData.personalInfo?.dob || "",
            location: cvData.personalInfo?.address || "",
            linkedin: cvData.personalInfo?.linkedin || "",
        },
        summary: cvData.summary || "",
        summaryAlt: cvData.summary || "",
        skills: {
            backend: skills.filter(s => skillCategory(s) === 'backend').map(s => s.name).filter(Boolean),
            frontend: skills.filter(s => skillCategory(s) === 'frontend').map(s => s.name).filter(Boolean),
            soft: skills.filter(s => skillCategory(s) === 'soft').map(s => s.name).filter(Boolean),
            other: skills.filter(s => skillCategory(s) === 'other').map(s => s.name).filter(Boolean),
        },
        skillsGrouped: {
            beginner: cvData.skills?.filter(s => s.level === 'BEGINNER').map(s => s.name) || [],
            intermediate: cvData.skills?.filter(s => s.level === 'INTERMEDIATE').map(s => s.name) || [],
            advanced: cvData.skills?.filter(s => s.level === 'ADVANCED').map(s => s.name) || [],
            expert: cvData.skills?.filter(s => s.level === 'EXPERT').map(s => s.name) || [],
            unspecified: cvData.skills?.filter(s => !s.level).map(s => s.name) || [],
        },
        experience: experiences.map(exp => ({
            title: exp.role,
            company: exp.company,
            dates: exp.period,
            bullets: exp.details || [],
        })),
        experience1: experiences.map(exp => ({
            title: exp.role,
            company: exp.company,
            dates: exp.period,
            bullets: exp.details || [],
        })) || [],
        experience2: experiences.map((exp, index) => ({
            title: exp.role,
            company: exp.company,
            dates: exp.period,
            bullets: exp.details || [],
            // Associate global projects to experiences sequentially
            project1: cvData.projects?.[index] ? {
                name: cvData.projects[index].name,
                dates: cvData.projects[index].period,
                description: cvData.projects[index].details?.[0] || '',
                responsibilities: cvData.projects[index].details?.slice(1).join(', ') || '',
                techStack: '',
                teamSize: ''
            } : null,
            project2: cvData.projects?.[index + 1] ? {
                name: cvData.projects[index + 1].name,
                dates: cvData.projects[index + 1].period,
                description: cvData.projects[index + 1].details?.[0] || '',
                responsibilitiesList: cvData.projects[index + 1].details?.slice(1) || [],
                techStack: '',
                teamSize: ''
            } : null,
        })) || [],
        experience3: experiences.map(exp => ({
            title: exp.role,
            company: exp.company,
            dates: exp.period,
            bullets: exp.details || [],
        })) || [],
        education: cvData.education?.map(edu => ({
            school: edu.school,
            degree: edu.degree,
            dates: edu.year || edu.period,
            gpa: edu.gpa,
        })) || [],
        projectsList: cvData.projects?.map(proj => ({
            name: proj.name,
            dates: proj.period,
            bullets: proj.details || [],
            url: proj.url,
        })) || [],
        projectsListAlt: cvData.projects?.map(proj => ({
            name: proj.name,
            dates: proj.period,
            bullets: proj.details || [],
            url: proj.url,
        })) || [],
        certificates: cvData.certificates?.map(cert => ({
            name: cert.name,
            issuer: cert.issuer,
            date: cert.date,
            url: cert.url,
        })) || [],
        languages: cvData.languages?.map(lang => ({
            name: lang.name,
            level: lang.level,
        })) || [],
        awards: cvData.awards?.map(award => ({
            name: award.name,
            issuer: award.issuer,
            date: award.date,
        })) || [],
    };
}

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
                category: category === 'backend' ? 'backend' : category === 'frontend' ? 'frontend' : 'soft'
            }))
        ),
        education: (mockData.education || []).map(edu => ({
            degree: edu.degree || '',
            school: edu.school || '',
            year: edu.dates || '',
            gpa: edu.gpa || '',
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
        personalInfo: {
            name: source.personalInfo?.name || '',
            email: source.personalInfo?.email || '',
            phone: source.personalInfo?.phone || '',
            dob: source.personalInfo?.dob || '',
            address: source.personalInfo?.address || '',
            linkedin: source.personalInfo?.linkedin || '',
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
