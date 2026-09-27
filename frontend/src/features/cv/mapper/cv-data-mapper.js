export function mapCVDataToTemplate(cvData) {
    if (!cvData) return {};

    const experiences = cvData.experiences || [];

    return {
        name: cvData.personalInfo?.name || "Full Name",
        title: "Professional Title", // Not explicitly in cvData, maybe add to context later
        contact: {
            phone: cvData.personalInfo?.phone || "--",
            email: cvData.personalInfo?.email || "--",
            dob: cvData.personalInfo?.dob || "--",
            location: cvData.personalInfo?.address || "--",
            linkedin: cvData.personalInfo?.linkedin || "linkedin.com/in/yourprofile",
        },
        summary: cvData.summary || "Professional summary...",
        summaryAlt: cvData.summary || "Professional summary...",
        skills: {
            backend: cvData.skills?.filter(s => s.category === 'backend').map(s => s.name) || [],
            frontend: cvData.skills?.filter(s => s.category === 'frontend').map(s => s.name) || [],
            soft: cvData.skills?.filter(s => s.category === 'soft').map(s => s.name) || [],
        },
        skillsGrouped: {
            excellent: cvData.skills?.filter(s => s.level >= 80).map(s => s.name) || [],
            intermediate: cvData.skills?.filter(s => s.level >= 40 && s.level < 80).map(s => s.name) || [],
            beginner: cvData.skills?.filter(s => s.level < 40).map(s => s.name) || [],
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
                techStack: 'React, Node.js, AWS', // Placeholder or derived
                teamSize: '5 members' // Placeholder
            } : null,
            project2: cvData.projects?.[index + 1] ? {
                name: cvData.projects[index + 1].name,
                dates: cvData.projects[index + 1].period,
                description: cvData.projects[index + 1].details?.[0] || '',
                responsibilitiesList: cvData.projects[index + 1].details?.slice(1) || [],
                techStack: 'React, Node.js, AWS', // Placeholder
                teamSize: '3 members' // Placeholder
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
            dates: edu.period,
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
                level: 80,
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
    const personal = data.personal_info || data.personalInfo || {};
    const list = (value) => Array.isArray(value) ? value : [];
    const read = (item, ...keys) => keys.map(key => item?.[key]).find(value => value != null) || '';

    return {
        personalInfo: {
            name: read(personal, 'name', 'full_name', 'fullName'),
            email: read(personal, 'email'),
            phone: read(personal, 'phone', 'phone_number', 'phoneNumber'),
            dob: read(personal, 'dob', 'date_of_birth', 'dateOfBirth'),
            address: read(personal, 'address', 'location'),
            linkedin: read(personal, 'linkedin', 'linkedin_url', 'linkedinUrl'),
        },
        summary: read(data, 'summary', 'professional_summary', 'professionalSummary'),
        experiences: list(data.experience || data.experiences).map((item, index) => ({
            id: Date.now() + index,
            company: read(item, 'company', 'organization'),
            role: read(item, 'role', 'title', 'position'),
            period: read(item, 'period', 'dates', 'duration'),
            details: list(item.details || item.bullets || item.responsibilities),
        })),
        skills: list(data.skills).map(skill => typeof skill === 'string'
            ? {name: skill, level: 80, category: 'soft'}
            : {name: read(skill, 'name', 'skill'), level: Number(skill.level) || 80, category: skill.category || 'soft'}),
        education: list(data.education).map(item => ({
            degree: read(item, 'degree', 'field'),
            school: read(item, 'school', 'university', 'institution'),
            year: read(item, 'year', 'period', 'dates', 'graduation_year'),
            gpa: read(item, 'gpa'),
        })),
        projects: list(data.projects || data.projectsList).map(item => ({
            name: read(item, 'name', 'title'),
            period: read(item, 'period', 'dates', 'duration'),
            details: list(item.details || item.bullets || item.description),
            url: read(item, 'url'),
        })),
        certificates: list(data.certificates).map(item => ({
            name: read(item, 'name', 'title'), issuer: read(item, 'issuer'), date: read(item, 'date'), url: read(item, 'url'),
        })),
        languages: list(data.languages).map(item => typeof item === 'string'
            ? {name: item, level: ''}
            : {name: read(item, 'name', 'language'), level: read(item, 'level', 'proficiency')}),
        awards: list(data.awards).map(item => ({
            name: read(item, 'name', 'title'), issuer: read(item, 'issuer'), date: read(item, 'date'),
        })),
    };
}
