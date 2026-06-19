import React, { useState } from 'react';
import { useCV } from '../../contexts/CVContext.jsx';
import {
    User,
    Briefcase,
    GraduationCap,
    Wrench,
    FileText,
    Plus,
    Trash2,
    ChevronDown,
    ChevronUp,
    Sparkles
} from 'lucide-react';

const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="mb-4 border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-50 text-[#0b3c8f] rounded-lg">
                        <Icon size={16} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{title}</span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            {isOpen && <div className="p-4 pt-0 border-t border-gray-100">{children}</div>}
        </div>
    );
};

const InputField = ({ label, value, onChange, placeholder, type = "text" }) => (
    <div className="mb-3">
        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
    </div>
);

export default function CVFormSidebar() {
    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        addExperience,
        updateExperience,
        updateExperienceDetail,
        removeExperience,
        updateSkills,
        addEducation,
        updateEducation,
        removeEducation
    } = useCV();

    const handleSkillChange = (index, field, value) => {
        const newSkills = [...cvData.skills];
        newSkills[index] = { ...newSkills[index], [field]: value };
        updateSkills(newSkills);
    };

    const addSkill = () => {
        const newSkills = [...cvData.skills, { name: '', level: 50 }];
        updateSkills(newSkills);
    };

    const removeSkill = (index) => {
        const newSkills = cvData.skills.filter((_, i) => i !== index);
        updateSkills(newSkills);
    };

    return (
        <div className="w-80 h-full bg-slate-50 border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={18} className="text-blue-600" />
                    <h2 className="font-bold text-gray-800">Chỉnh sửa CV</h2>
                </div>
                <p className="text-[11px] text-gray-500">Cập nhật thông tin để xem thay đổi trực tiếp trên bản xem trước.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300">
                {/* Personal Info */}
                <Section title="Thông tin cá nhân" icon={User}>
                    <InputField
                        label="Họ và tên"
                        value={cvData.personalInfo.name}
                        onChange={(val) => updatePersonalInfo({ name: val })}
                        placeholder="Nguyễn Văn A"
                    />
                    <InputField
                        label="Email"
                        value={cvData.personalInfo.email}
                        onChange={(val) => updatePersonalInfo({ email: val })}
                        placeholder="email@example.com"
                    />
                    <InputField
                        label="Số điện thoại"
                        value={cvData.personalInfo.phone}
                        onChange={(val) => updatePersonalInfo({ phone: val })}
                        placeholder="090..."
                    />
                    <InputField
                        label="Ngày sinh"
                        value={cvData.personalInfo.dob}
                        onChange={(val) => updatePersonalInfo({ dob: val })}
                        placeholder="dd/mm/yyyy"
                    />
                    <InputField
                        label="Địa chỉ"
                        value={cvData.personalInfo.address}
                        onChange={(val) => updatePersonalInfo({ address: val })}
                        placeholder="Hà Nội, Việt Nam"
                    />
                </Section>

                {/* Summary */}
                <Section title="Giới thiệu bản thân" icon={FileText}>
                    <div className="mb-3">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tóm tắt chuyên môn</label>
                        <textarea
                            value={cvData.summary}
                            onChange={(e) => updateSummary(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                            placeholder="Mô tả ngắn gọn về bản thân và mục tiêu nghề nghiệp..."
                        />
                    </div>
                </Section>

                {/* Experience */}
                <Section title="Kinh nghiệm làm việc" icon={Briefcase}>
                    <div className="flex flex-col gap-4">
                        {cvData.experiences.map((exp, index) => (
                            <div key={exp.id} className="p-3 bg-gray-100 rounded-lg relative group">
                                <button
                                    onClick={() => removeExperience(exp.id)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <InputField
                                    label="Công ty"
                                    value={exp.company}
                                    onChange={(val) => updateExperience(exp.id, 'company', val)}
                                />
                                <InputField
                                    label="Vị trí"
                                    value={exp.role}
                                    onChange={(val) => updateExperience(exp.id, 'role', val)}
                                />
                                <InputField
                                    label="Thời gian"
                                    value={exp.period}
                                    onChange={(val) => updateExperience(exp.id, 'period', val)}
                                />
                                <div className="mb-2">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Chi tiết công việc</label>
                                    {exp.details.map((detail, dIndex) => (
                                        <input
                                            key={dIndex}
                                            value={detail}
                                            onChange={(e) => updateExperienceDetail(exp.id, dIndex, e.target.value)}
                                            className="w-full px-3 py-1 text-xs border border-gray-200 rounded-md mb-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder={`Nhiệm vụ ${dIndex + 1}...`}
                                        />
                                    ))}
                                    <button
                                        onClick={() => {
                                            const newDetails = [...exp.details, ''];
                                            updateExperience(exp.id, 'details', newDetails);
                                        }}
                                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                        <Plus size={10} /> Thêm chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addExperience}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Thêm kinh nghiệm
                        </button>
                    </div>
                </Section>

                {/* Education */}
                <Section title="Học vấn" icon={GraduationCap}>
                    <div className="flex flex-col gap-4">
                        {cvData.education.map((edu, index) => (
                            <div key={index} className="p-3 bg-gray-100 rounded-lg relative group">
                                <button
                                    onClick={() => removeEducation(index)}
                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <InputField
                                    label="Bằng cấp / Chuyên ngành"
                                    value={edu.degree}
                                    onChange={(val) => updateEducation(index, 'degree', val)}
                                />
                                <InputField
                                    label="Trường"
                                    value={edu.school}
                                    onChange={(val) => updateEducation(index, 'school', val)}
                                />
                                <InputField
                                    label="Năm"
                                    value={edu.year}
                                    onChange={(val) => updateEducation(index, 'year', val)}
                                />
                            </div>
                        ))}
                        <button
                            onClick={addEducation}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Thêm học vấn
                        </button>
                    </div>
                </Section>

                {/* Skills */}
                <Section title="Kỹ năng" icon={Wrench}>
                    <div className="flex flex-col gap-3">
                        {cvData.skills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    value={skill.name}
                                    onChange={(val) => handleSkillChange(index, 'name', val)}
                                    className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded-md"
                                    placeholder="Kỹ năng..."
                                />
                                <input
                                    type="number"
                                    value={skill.level}
                                    onChange={(val) => handleSkillChange(index, 'level', parseInt(val) || 0)}
                                    className="w-12 px-1 py-1 text-xs border border-gray-200 rounded-md text-center"
                                    placeholder="%"
                                />
                                <button
                                    onClick={() => removeSkill(index)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addSkill}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Thêm kỹ năng
                        </button>
                    </div>
                </Section>
            </div>
        </div>
    );
}
