export function mapCVDataToTemplate(cvData) {
    if (!cvData) return {};

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
        experience1: cvData.experiences?.map(exp => ({
            title: exp.role,
            company: exp.company,
            dates: exp.period,
            bullets: exp.details || [],
        })) || [],
        experience2: cvData.experiences?.map(exp => ({
            title: exp.role,
            company: exp.company,
            dates: exp.period,
            bullets: exp.details || [],
            // project placeholders
            project1: exp.projects?.[0] || null,
            project2: exp.projects?.[1] || null,
        })) || [],
        experience3: cvData.experiences?.map(exp => ({
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
