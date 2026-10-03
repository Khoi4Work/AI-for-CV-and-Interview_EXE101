import {createContext, useState, useContext, useCallback} from 'react';

const CVContext = createContext();

const noop = () => {};
const previewActions = Object.fromEntries([
    'updatePersonalInfo', 'updateSummary', 'updateProfilePhoto', 'updateExperience',
    'updateExperienceDetail', 'updateEducation', 'updateProjects', 'updateCertificates',
    'updateLanguages', 'updateAwards', 'updateSkills',
].map(name => [name, noop]));

export function CVPreviewProvider({ cvData, children }) {
    return <CVContext.Provider value={{ cvData, readOnly: true, ...previewActions }}>{children}</CVContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- Context hooks share the provider's context.
export function useCVReadOnly() {
    return useContext(CVContext)?.readOnly === true;
}

const INITIAL_CV_STATE = {
    personalInfo: {
        name: '',
        email: '',
        phone: '',
        dob: '',
        address: '',
        linkedin: '',
    },
    profilePhoto: '',
    summary: '',
    experiences: [],
    skills: [],
    education: [],
    projects: [],
    certificates: [],
    languages: [],
    awards: [],
    selectedTemplateId: 'the-standard',
};

export function CVProvider({children}) {
    const [cvData, setCvData] = useState(INITIAL_CV_STATE);
    // Content is held in memory; never attach a stale persisted ID to a fresh draft after reload.
    const [currentCvId, setCurrentCvId] = useState(null);
    const [hasCV, setHasCV] = useState(() => {
        const saved = localStorage.getItem('hasCV');
        return saved !== null ? saved === 'true' : null;
    }); // null: unknown, true: has, false: doesn't have

    const setHasCVWithPersistence = useCallback((value) => {
        setHasCV(value);
        localStorage.setItem('hasCV', String(value));
    }, []);

    const setCurrentCvIdWithPersistence = useCallback((id) => {
        setCurrentCvId(id || null);
        if (id) localStorage.setItem('currentCvId', id);
        else localStorage.removeItem('currentCvId');
    }, []);

    const setFullCVData = useCallback((newData) => {
        setCvData(prev => ({
            ...prev,
            ...newData,
            selectedTemplateId: newData.selectedTemplateId || prev.selectedTemplateId
        }));
    }, []);

    const updatePersonalInfo = useCallback((info) => {
        setCvData(prev => ({...prev, personalInfo: {...prev.personalInfo, ...info}}));
    }, []);

    const updateSummary = useCallback((summary) => {
        setCvData(prev => ({...prev, summary}));
    }, []);

    const updateProfilePhoto = useCallback((profilePhoto) => {
        setCvData(prev => ({...prev, profilePhoto: profilePhoto || ''}));
    }, []);

    const addExperience = useCallback(() => {
        const newExp = {id: Date.now(), company: '', role: '', period: '', details: ['']};
        setCvData(prev => ({...prev, experiences: [...prev.experiences, newExp]}));
    }, []);

    const updateExperience = useCallback((id, field, value) => {
        setCvData(prev => ({
            ...prev,
            experiences: prev.experiences.map(exp => exp.id === id ? {...exp, [field]: value} : exp)
        }));
    }, []);

    const updateExperienceDetail = useCallback((expId, detailIndex, value) => {
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
    }, []);

    const removeExperience = useCallback((id) => {
        setCvData(prev => ({...prev, experiences: prev.experiences.filter(exp => exp.id !== id)}));
    }, []);

    const updateSkills = useCallback((skills) => {
        setCvData(prev => ({...prev, skills}));
    }, []);

    const setTemplate = useCallback((id) => {
        setCvData(prev => ({...prev, selectedTemplateId: id}));
    }, []);

    const setExperiences = useCallback((experiences) => {
        setCvData(prev => ({...prev, experiences}));
    }, []);

    const updateEducation = useCallback((index, field, value) => {
        setCvData(prev => {
            const newEdu = [...prev.education];
            newEdu[index] = {...newEdu[index], [field]: value};
            return {...prev, education: newEdu};
        });
    }, []);

    const addEducation = useCallback(() => {
        setCvData(prev => ({...prev, education: [...prev.education, {degree: '', school: '', year: ''}]}));
    }, []);

    const removeEducation = useCallback((index) => {
        setCvData(prev => ({...prev, education: prev.education.filter((_, i) => i !== index)}));
    }, []);

    const setEducation = useCallback((education) => {
        setCvData(prev => ({...prev, education}));
    }, []);

    const updateProjects = useCallback((projects) => {
        setCvData(prev => ({...prev, projects}));
    }, []);

    const updateCertificates = useCallback((certs) => {
        setCvData(prev => ({...prev, certificates: certs}));
    }, []);

    const updateLanguages = useCallback((langs) => {
        setCvData(prev => ({...prev, languages: langs}));
    }, []);

    const updateAwards = useCallback((awards) => {
        setCvData(prev => ({...prev, awards}));
    }, []);

    const resetCV = useCallback(() => {
        setCvData(prev => ({
            ...INITIAL_CV_STATE,
            selectedTemplateId: prev.selectedTemplateId
        }));
    }, []);

    return (
        <CVContext.Provider value={{
            cvData,
            currentCvId,
            setCurrentCvId: setCurrentCvIdWithPersistence,
            hasCV,
            setHasCV: setHasCVWithPersistence,
            updatePersonalInfo,
            updateSummary,
            updateProfilePhoto,
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
            updateAwards,
            setFullCVData,
            resetCV
        }}>
            {children}
        </CVContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components -- Context hooks share the provider's context.
export function useCV() {
    const context = useContext(CVContext);
    if (!context) {
        throw new Error('useCV must be used within a CVProvider');
    }
    return context;
}
