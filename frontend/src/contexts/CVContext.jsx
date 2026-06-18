import React, {createContext, useState, useContext} from 'react';

const CVContext = createContext();

const INITIAL_CV_STATE = {
    personalInfo: {
        name: 'Nguyễn Văn A',
        email: '',
        phone: '',
        dob: '27/01/1998',
        address: '',
    },
    summary: 'Tôi là một nhân viên bán hàng chuyên nghiệp, đam mê trong việc xây dựng mối quan hệ với khách hàng và đạt được mục tiêu doanh số...',
    experiences: [
        {
            id: 1,
            company: 'Tên công ty',
            role: 'Marketing Manager',
            period: '03/2019 - 09/2020',
            details: [
                'Phụ trách việc tìm kiếm và khai thác thị trường mới...',
                'Nghiên cứu và đánh giá các xu hướng thị trường...'
            ]
        },
    ],
    skills: [
        {name: 'Quản lý dự án', level: 80},
        {name: 'Giao tiếp tốt', level: 90},
        {name: 'Thuyết phục', level: 70},
    ],
    education: [
        {degree: 'Cử nhân Quản trị Kinh doanh', school: 'Đại học Kinh tế Quốc dân', year: '2015 - 2019'},
    ],
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
            setExperiences
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
