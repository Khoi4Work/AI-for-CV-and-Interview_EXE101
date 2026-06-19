import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {
    Sparkles,
    Trash2,
    Plus,
    Download,
    LayoutTemplate,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    CheckCircle2
} from 'lucide-react';
import Sidebar from "../../components/template/Sidebar.jsx";
import {Header} from "../../components/layout/PublicHeader.jsx";
import {useApp} from '../../contexts/AppContext.jsx';
import {useCV} from '../../contexts/CVContext.jsx';

export default function CVBuilder() {
    const {showToast} = useApp();
    const {
        cvData,
        updatePersonalInfo,
        updateSummary,
        addExperience,
        updateExperience,
        updateExperienceDetail,
        removeExperience,
        setExperiences,
        updateEducation,
        addEducation,
        removeEducation,
        setEducation,
        updateSkills,
        updateProjects,
        updateCertificates,
        updateLanguages,
        updateAwards
    } = useCV();

    const [step, setStep] = useState(1);
    const totalSteps = 5;

    const handleFileUpload = () => {
        document.getElementById('cv-upload-input').click();
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            showToast(`Đã tải lên tệp ${file.name} thành công! AI đang trích xuất dữ liệu...`, 'success');

            // 1. Thông tin cá nhân
            updatePersonalInfo({
                name: 'Nguyễn Hoàng Nam',
                email: 'nam.nguyen@dev.com',
                phone: '0905 123 456',
                address: 'Quận Cầu Giấy, Hà Nội',
                linkedin: 'linkedin.com/in/nam-fullstack-dev'
            });
            updateSummary('Kỹ sư Phần mềm Fullstack với hơn 5 năm kinh nghiệm xây dựng các hệ thống quy mô lớn. Chuyên gia về React, Node.js và kiến trúc Microservices. Đam mê tối ưu hóa hiệu năng hệ thống và xây dựng trải nghiệm người dùng mượt mà. Đã từng dẫn dắt đội ngũ phát triển các sản phẩm E-commerce đạt mốc 1M+ người dùng hàng tháng.');

            // 2. Kinh nghiệm làm việc
            const mockExperiences = [
                {
                    id: 101,
                    company: 'VNG Corporation',
                    role: 'Senior Fullstack Engineer',
                    period: '01/2021 - Hiện tại',
                    details: [
                        'Thiết kế và triển khai hệ thống thanh toán trực tuyến bằng Microservices (Node.js, Go, Kafka), giảm thời gian xử lý giao dịch xuống 200ms.',
                        'Tối ưu hóa hiệu năng Frontend bằng cách triển khai Next.js và Server-Side Rendering, tăng điểm Core Web Vitals từ 60 lên 95.',
                        'Xây dựng hệ thống CI/CD tự động với Jenkins và Docker, giảm thời gian deploy từ 30 phút xuống 5 phút.',
                        'Dẫn dắt đội ngũ 5 developers thực hiện review code và áp dụng TDD, giảm 40% tỷ lệ bug trong giai đoạn production.'
                    ]
                },
                {
                    id: 102,
                    company: 'FPT Software',
                    role: 'Frontend Developer',
                    period: '06/2018 - 12/2020',
                    details: [
                        'Phát triển giao diện quản trị cho đối tác Nhật Bản bằng React và Redux, xử lý dữ liệu thời gian thực qua WebSocket.',
                        'Xây dựng bộ thư viện UI Component nội bộ giúp tăng tốc độ phát triển các dự án mới lên 30%.',
                        'Phối hợp chặt chẽ với UI/UX Designer để tối ưu hóa luồng người dùng cho ứng dụng Mobile-first.',
                        'Triển khai Unit Test với Jest và React Testing Library, đạt độ bao phủ code 80%.'
                    ]
                }
            ];
            setExperiences(mockExperiences);

            // 3. Học vấn
            const mockEducation = [
                {
                    degree: 'Kỹ sư Công nghệ thông tin',
                    school: 'Đại học Bách Khoa Hà Nội',
                    year: '2014 - 2018',
                    gpa: '3.6/4.0'
                }
            ];
            setEducation(mockEducation);

            // 4. Kỹ năng
            const mockSkills = [
                {name: 'React / Next.js', level: 95, category: 'frontend'},
                {name: 'TypeScript', level: 90, category: 'frontend'},
                {name: 'Tailwind CSS', level: 90, category: 'frontend'},
                {name: 'Redux / Zustand', level: 85, category: 'frontend'},
                {name: 'Node.js / Express', level: 90, category: 'backend'},
                {name: 'Go / Gin', level: 80, category: 'backend'},
                {name: 'MongoDB / PostgreSQL', level: 85, category: 'backend'},
                {name: 'Redis / Kafka', level: 80, category: 'backend'},
                {name: 'Docker / Kubernetes', level: 80, category: 'backend'},
                {name: 'AWS (S3, EC2, Lambda)', level: 80, category: 'backend'},
                {name: 'Team Leadership', level: 85, category: 'soft'},
                {name: 'Problem Solving', level: 90, category: 'soft'},
                {name: 'Agile / Scrum', level: 85, category: 'soft'},
            ];
            updateSkills(mockSkills);

            // 5. Dự án
            const mockProjects = [
                {
                    name: 'AI CV Optimizer',
                    period: '2023 - 2024',
                    details: ['Xây dựng hệ thống phân tích CV bằng LLM', 'Tự động gợi ý từ khóa dựa trên JD'],
                    url: 'github.com/nam/ai-cv'
                },
                {
                    name: 'E-commerce Microservices',
                    period: '2021 - 2022',
                    details: ['Hệ thống xử lý 10k request/s', 'Tích hợp cổng thanh toán Stripe, Momo'],
                    url: 'github.com/nam/e-comm'
                }
            ];
            updateProjects(mockProjects);

            // 6. Chứng chỉ
            const mockCerts = [
                {name: 'AWS Certified Solutions Architect', issuer: 'Amazon', date: '2022', url: 'aws.amazon.com/cert'},
                {name: 'Google Professional Cloud Developer', issuer: 'Google', date: '2021', url: 'google.com/cert'}
            ];
            updateCertificates(mockCerts);

            // 7. Ngôn ngữ
            const mockLangs = [
                {name: 'Tiếng Việt', level: 'Bản ngữ'},
                {name: 'Tiếng Anh', level: 'IELTS 7.5'},
                {name: 'Tiếng Nhật', level: 'N3'}
            ];
            updateLanguages(mockLangs);

            // 8. Giải thưởng
            const mockAwards = [
                {name: 'Giải Nhất Hackathon 2020', issuer: 'TechFest', date: '2020'},
                {name: 'Học bổng Tài năng IT', issuer: 'ĐH Bách Khoa', date: '2016'}
            ];
            updateAwards(mockAwards);
        }
    };

    const addKeyword = (keyword) => {
        showToast(`Đã thêm từ khóa "${keyword}" vào gợi ý CV`, 'success');
    };

    const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    return (
        <>
            <Header/>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 w-full flex-grow">

                <div className="flex-grow grid grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Wizard Form */}
                    <section
                        className="col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">

                        {/* Stepper Header */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                                        <LayoutTemplate className="h-4 w-4"/>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">Xây dựng nội dung CV</h2>
                                </div>
                                <button
                                    onClick={handleFileUpload}
                                    className="text-sm font-medium text-blue-700 flex items-center gap-1 hover:underline transition-colors">
                                    <Download className="h-4 w-4"/>
                                    Tải CV cũ
                                    <input id="cv-upload-input" type="file" className="hidden" accept=".pdf,.docx"
                                           onChange={onFileChange}/>
                                </button>
                            </div>

                            {/* Stepper Visual */}
                            <div className="flex items-center gap-4">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <div key={s} className="flex items-center gap-2 flex-1">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                step === s ? 'bg-blue-600 text-white shadow-md scale-110' :
                                                    step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            {step > s ? <CheckCircle2 className="w-5 h-5"/> : s}
                                        </div>
                                        <span
                                            className={`text-xs font-bold transition-colors ${step === s ? 'text-blue-600' : 'text-slate-400'}`}>
                                            {s === 1 ? 'Thông tin' : s === 2 ? 'Kinh nghiệm' : s === 3 ? 'Học vấn' : s === 4 ? 'Kỹ năng' : 'Hoàn tất'}
                                        </span>
                                        {s < totalSteps && <div
                                            className={`h-px flex-1 transition-colors ${step > s ? 'bg-green-500' : 'bg-slate-200'}`}></div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-8 flex-grow">
                            {step === 1 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="space-y-6">
                                        <div className="group space-y-1">
                                            <label
                                                className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-blue-600 transition-colors">Tên
                                                đầy đủ</label>
                                            <input
                                                type="text"
                                                className="w-full input-underlined text-lg font-bold placeholder:text-slate-300"
                                                placeholder="Nguyễn Văn A..."
                                                value={cvData.personalInfo.name}
                                                onChange={(e) => updatePersonalInfo({name: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="group space-y-1">
                                                <label
                                                    className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-blue-600 transition-colors">Email</label>
                                                <input
                                                    type="email"
                                                    className="w-full input-underlined text-slate-600 placeholder:text-slate-300"
                                                    placeholder="example@gmail.com"
                                                    value={cvData.personalInfo.email}
                                                    onChange={(e) => updatePersonalInfo({email: e.target.value})}
                                                />
                                            </div>
                                            <div className="group space-y-1">
                                                <label
                                                    className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-blue-600 transition-colors">Số
                                                    điện thoại</label>
                                                <input
                                                    type="text"
                                                    className="w-full input-underlined text-slate-600 placeholder:text-slate-300"
                                                    placeholder="090..."
                                                    value={cvData.personalInfo.phone}
                                                    onChange={(e) => updatePersonalInfo({phone: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="group space-y-1">
                                            <label
                                                className="text-[10px] uppercase font-bold text-slate-400 group-focus-within:text-blue-600 transition-colors">LinkedIn</label>
                                            <input
                                                type="text"
                                                className="w-full input-underlined text-slate-600 placeholder:text-slate-300"
                                                placeholder="linkedin.com/in/yourprofile"
                                                value={cvData.personalInfo.linkedin}
                                                onChange={(e) => updatePersonalInfo({linkedin: e.target.value})}
                                            />
                                        </div>
                                    </div>


                                    <div className="pt-6">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-blue-600"/>
                                            Mục tiêu nghề nghiệp
                                        </h3>
                                        <textarea
                                            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                            placeholder="Mô tả ngắn gọn về mục tiêu và giá trị bạn mang lại..."
                                            value={cvData.summary}
                                            onChange={(e) => updateSummary(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Kinh
                                            nghiệm làm việc</h3>
                                        <button
                                            onClick={addExperience}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                                            <Plus className="w-3 h-3"/> Thêm mục
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {cvData.experiences.map((exp, index) => (
                                            <div key={exp.id}
                                                 className="relative group bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md focus-within:border-blue-500">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">Công
                                                            ty</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm font-bold py-1"
                                                            value={exp.company}
                                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label
                                                            className="text-[10px] font-bold text-slate-400 uppercase">Thời
                                                            gian</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm py-1"
                                                            value={exp.period}
                                                            onChange={(e) => updateExperience(exp.id, 'period', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1 mb-4">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Vị
                                                        trí</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm py-1"
                                                        value={exp.role}
                                                        onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Chi
                                                        tiết công việc</label>
                                                    {exp.details.map((detail, dIdx) => (
                                                        <div key={dIdx} className="flex gap-2">
                                                            <div
                                                                className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                                                            <textarea
                                                                className="w-full bg-transparent border-none resize-none focus:ring-0 text-sm py-1 placeholder:text-slate-300 outline-none"
                                                                placeholder="Ví dụ: Tăng doanh thu 20% trong 6 tháng..."
                                                                value={detail}
                                                                onChange={(e) => updateExperienceDetail(exp.id, dIdx, e.target.value)}
                                                            ></textarea>
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => {
                                                            const newDetails = [...cvData.experiences.find(e => e.id === exp.id).details, ''];
                                                            updateExperience(exp.id, 'details', newDetails);
                                                        }}
                                                        className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3"/> Thêm gạch đầu dòng
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="absolute -top-3 -right-3 bg-white border border-slate-200 text-red-500 p-2 rounded-full hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Xóa">
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Học vấn</h3>
                                        <button
                                            onClick={addEducation}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                                            <Plus className="w-3 h-3"/> Thêm mục
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {cvData.education.map((edu, index) => (
                                            <div key={index}
                                                 className="relative group bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all hover:shadow-md focus-within:border-blue-500">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Bằng cấp / Chứng chỉ</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm font-bold py-1"
                                                            value={edu.degree}
                                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Trường học / Tổ chức</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm py-1"
                                                            value={edu.school}
                                                            onChange={(e) => updateEducation(index, 'school', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Thời gian</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm py-1"
                                                            value={edu.year}
                                                            onChange={(e) => updateEducation(index, 'year', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">GPA</label>
                                                        <input
                                                            type="text"
                                                            className="w-full bg-transparent border-b border-slate-200 focus:border-blue-500 outline-none text-sm py-1"
                                                            value={edu.gpa}
                                                            onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeEducation(index)}
                                                    className="absolute -top-3 -right-3 bg-white border border-slate-200 text-red-500 p-2 rounded-full hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Xóa">
                                                    <Trash2 className="h-4 w-4"/>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Kỹ năng & Thông tin khác</h3>
                                        <Sparkles className="w-4 h-4 text-blue-600" />
                                    </div>

                                    <div className="space-y-8">
                                        {/* Skills Section */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-xs font-bold text-slate-600 uppercase">Kỹ năng chuyên môn</label>
                                                <button
                                                    onClick={() => {
                                                        const newSkills = [...cvData.skills, {name: '', level: 50, category: 'hard'}];
                                                        updateSkills(newSkills);
                                                    }}
                                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Plus className="w-3 h-3"/> Thêm kỹ năng
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {cvData.skills.map((skill, index) => (
                                                    <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 group">
                                                        <input
                                                            type="text"
                                                            className="flex-grow bg-transparent text-sm font-medium outline-none"
                                                            value={skill.name}
                                                            onChange={(e) => {
                                                                const updated = [...cvData.skills];
                                                                updated[index].name = e.target.value;
                                                                updateSkills(updated);
                                                            }}
                                                            placeholder="Tên kỹ năng..."
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                className="w-12 bg-white border border-slate-200 rounded px-1 text-xs text-center"
                                                                value={skill.level}
                                                                onChange={(e) => {
                                                                    const updated = [...cvData.skills];
                                                                    updated[index].level = parseInt(e.target.value) || 0;
                                                                    updateSkills(updated);
                                                                }}
                                                            />
                                                            <select
                                                                className="text-[10px] bg-white border border-slate-200 rounded px-1 outline-none"
                                                                value={skill.category}
                                                                onChange={(e) => {
                                                                    const updated = [...cvData.skills];
                                                                    updated[index].category = e.target.value;
                                                                    updateSkills(updated);
                                                                }}
                                                            >
                                                                <option value="frontend">Front-end</option>
                                                                <option value="backend">Back-end</option>
                                                                <option value="soft">Soft Skill</option>
                                                            </select>
                                                            <button onClick={() => {
                                                                const updated = cvData.skills.filter((_, i) => i !== index);
                                                                updateSkills(updated);
                                                            }} className="text-slate-400 hover:text-red-500 transition-colors">
                                                                <Trash2 className="w-3 h-3"/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Others Sections: Projects, Certs, Langs, Awards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {[
                                                { label: 'Dự án', field: 'projects', updater: updateProjects, placeholder: 'Tên dự án, mô tả ngắn...' },
                                                { label: 'Chứng chỉ', field: 'certificates', updater: updateCertificates, placeholder: 'Tên chứng chỉ...' },
                                                { label: 'Ngôn ngữ', field: 'languages', updater: updateLanguages, placeholder: 'Tiếng Anh, Tiếng Nhật...' },
                                                { label: 'Giải thưởng', field: 'awards', updater: updateAwards, placeholder: 'Giải nhất cuộc thi...' },
                                            ].map((section) => (
                                                <div key={section.field} className="space-y-3">
                                                    <label className="text-xs font-bold text-slate-600 uppercase">{section.label}</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder={section.placeholder}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' && e.target.value) {
                                                                    const currentData = cvData[section.field] || [];
                                                                    const newItem = { name: e.target.value, date: new Date().getFullYear().toString() };
                                                                    section.updater([...currentData, newItem]);
                                                                    e.target.value = '';
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                const input = e.currentTarget.previousElementSibling;
                                                                if (input.value) {
                                                                    const currentData = cvData[section.field] || [];
                                                                    const newItem = { name: input.value, date: new Date().getFullYear().toString() };
                                                                    section.updater([...currentData, newItem]);
                                                                    input.value = '';
                                                                }
                                                            }}
                                                            className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all"
                                                        >
                                                            <Plus className="w-4 h-4"/>
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(cvData[section.field] || []).map((item, i) => (
                                                            <span key={i} className="bg-slate-100 text-slate-600 text-[11px] px-3 py-1 rounded-full border border-slate-200 flex items-center gap-2 group">
                                                                {item.name}
                                                                <button
                                                                    onClick={() => {
                                                                        const updated = (cvData[section.field] || []).filter((_, idx) => idx !== i);
                                                                        section.updater(updated);
                                                                    }}
                                                                    className="text-slate-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-2.5 h-2.5"/>
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 5 && (
                                <div className="text-center py-12 animate-fade-in">
                                    <div
                                        className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                        <CheckCircle2 className="w-10 h-10"/>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 mb-2">Sẵn sàng cho CV của bạn!</h3>
                                    <p className="text-slate-500 mb-8 max-w-4xl mx-auto">
                                        Chúng tôi đã thu thập đủ thông tin. Bây giờ hãy chọn một mẫu thiết kế và tinh
                                        chỉnh nó trong trình chỉnh sửa chuyên nghiệp.
                                    </p>
                                    <Link to="/cv-analyzing"
                                           state={{ target: '/editor' }}
                                           className="px-10 py-4 bg-smartfolio-blue text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-blue-800 transition-all hover:scale-105">
                                        Vào Trình Chỉnh Sửa <ChevronRight className="w-5 h-5"/>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Bottom Navigation */}
                        {step < 5 && (
                            <div
                                className="p-6 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
                                <button
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className="px-6 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 disabled:opacity-30 flex items-center gap-1 transition-colors">
                                    <ChevronLeft className="w-4 h-4"/> Quay lại
                                </button>
                                <button
                                    onClick={nextStep}
                                    className="px-8 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all flex items-center gap-1">
                                    Tiếp tục <ChevronRight className="w-4 h-4"/>
                                </button>
                            </div>
                        )}
                    </section>

                    {/* RIGHT COLUMN: JD & AI */}
                    <section className="col-span-5 flex flex-col gap-6">
                        <div
                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px] sticky top-24">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-6 w-6 text-slate-800"/>
                                    <h2 className="text-xl font-bold">Mô tả công việc (JD)</h2>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-medium text-slate-400">Dán nội dung JD mục tiêu để AI hỗ trợ</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-bold text-blue-900 tracking-wider">AI LISTENING</span>
                                    </div>
                                </div>

                                <div className="flex-grow mb-6 relative">
                                    <textarea
                                        className="w-full h-full border border-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl p-4 text-slate-600 placeholder-slate-300 text-sm outline-none transition-all resize-none"
                                        placeholder="Nhập mô tả công việc (JD) của bạn tại đây..."
                                    ></textarea>
                                </div>

                                {/* AI Suggestions Card */}
                                <div
                                    className="bg-white border-2 border-blue-500 rounded-2xl p-5 shadow-md relative overflow-hidden transition-all hover:shadow-lg group">
                                    <div
                                        className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Sparkles className="w-16 h-16 text-blue-500"/>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                        <Sparkles className="w-4 h-4 text-blue-600" fill="currentColor"/>
                                        <h4 className="text-sm font-bold text-blue-900">Gợi ý từ AI</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4 relative z-10">
                                        Dựa trên JD, hãy cân nhắc thêm các từ khóa sau vào CV để tăng tỷ lệ khớp:
                                    </p>
                                    <div className="flex flex-wrap gap-2 relative z-10">
                                        {['React Query', 'Web Performance', 'TypeScript', 'Microservices', 'TDD'].map(keyword => (
                                            <button
                                                key={keyword}
                                                onClick={() => addKeyword(keyword)}
                                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1 transition-all hover:scale-105 active:scale-95">
                                                <span className="text-xs font-bold">+</span> {keyword}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>
            </main>
        </>
    )
}
