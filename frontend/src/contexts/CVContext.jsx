import React, {createContext, useState, useContext} from 'react';

const CVContext = createContext();

const INITIAL_CV_STATE = {
    personalInfo: {
        name: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        linkedin: '',
    },
    summary: '',
    experiences: [],
    skills: [],
    education: [],
    projects: [],
    certificates: [],
    languages: [],
    awards: [],
    selectedTemplateId: 'modern-executive',
};

export function CVProvider({children}) {
    const [cvData, setCvData] = useState(INITIAL_CV_STATE);

    const updatePersonalInfo = (info) => {
        setCvData(prev => ({...prev, personalInfo: {...prev.personalInfo, ...info}}));
    };

    const updateSummary = (summary) => {
        setCvData(prev => ({...prev, summary}));
    };

    const addExperience = () => {
        const newExp = {id: Date.now(), company: '', role: '', period: '', details: ['']};
        setCvData(prev => ({...prev, experiences: [...prev.experiences, newExp]}));
    };

    const updateExperience = (id, field, value) => {
        setCvData(prev => ({
            ...prev,
            experiences: prev.experiences.map(exp => exp.id === id ? {...exp, [field]: value} : exp)
        }));
    };

    const updateExperienceDetail = (expId, detailIndex, value) => {
        setCvData(prev => ({
            ...prev,
            experiences: prev.experiences.map(exp => {
                if (exp.id === expId) {
                    const newDetails = [...exp.details];
                    newDetails[detailIndex] = value;
                    return {...exp, details: newDetails};
                }
                return exp;
            })
        }));
    };

    const removeExperience = (id) => {
        setCvData(prev => ({...prev, experiences: prev.experiences.filter(exp => exp.id !== id)}));
    };

    const updateSkills = (skills) => {
        setCvData(prev => ({...prev, skills}));
    };

    const setTemplate = (id) => {
        setCvData(prev => ({...prev, selectedTemplateId: id}));
    };

    const setExperiences = (experiences) => {
        setCvData(prev => ({...prev, experiences}));
    };

    const updateEducation = (index, field, value) => {
        setCvData(prev => {
            const newEdu = [...prev.education];
            newEdu[index] = {...newEdu[index], [field]: value};
            return {...prev, education: newEdu};
        });
    };

    const addEducation = () => {
        setCvData(prev => ({...prev, education: [...prev.education, {degree: '', school: '', year: ''}]}));
    };

    const removeEducation = (index) => {
        setCvData(prev => ({...prev, education: prev.education.filter((_, i) => i !== index)}));
    };

    const setEducation = (education) => {
        setCvData(prev => ({...prev, education}));
    };

    const updateProjects = (projects) => {
        setCvData(prev => ({...prev, projects}));
    };

    const updateCertificates = (certs) => {
        setCvData(prev => ({...prev, certificates: certs}));
    };

    const updateLanguages = (langs) => {
        setCvData(prev => ({...prev, languages: langs}));
    };

    const updateAwards = (awards) => {
        setCvData(prev => ({...prev, awards}));
    };

    return (
        <CVContext.Provider value={{
            cvData,
            updatePersonalInfo,
            updateSummary,
            addExperience,
            updateExperience,
            updateExperienceDetail,
            removeExperience,
            updateSkills,
            setTemplate,
            setExperiences,
            updateEducation,
            addEducation,
            removeEducation,
            setEducation,
            updateProjects,
            updateCertificates,
            updateLanguages,
            updateAwards
        }}>
            {children}
        </CVContext.Provider>
    );
}

export function useCV() {
    const context = useContext(CVContext);
    if (!context) {
        throw new Error('useCV must be used within a CVProvider');
    }
    return context;
}
