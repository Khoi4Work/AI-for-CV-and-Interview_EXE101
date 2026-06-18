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
        updateExperienceDetail, // <--- THÊM Ở ĐÂY
        removeExperience,
        setExperiences
    } = useCV();

    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const handleFileUpload = () => {
        document.getElementById('cv-upload-input').click();
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            showToast(`Đã tải lên tệp ${file.name} thành công! AI đang trích xuất dữ liệu...`, 'success');

            // Giả lập trích xuất dữ liệu từ file và cập nhật vào CVContext
            updatePersonalInfo({
                name: 'Trần Thị B',
                email: 'tranthib@example.com',
                phone: '0901 234 567',
                address: '123 Đường ABC, Quận 1, TP. HCM'
            });
            updateSummary('Một chuyên gia về Marketing với 5 năm kinh nghiệm trong ngành thương mại điện tử, chuyên sâu về tối ưu hóa chuyển đổi và tăng trưởng người dùng thông qua các chiến dịch dữ liệu.');

            // Mock dữ liệu kinh nghiệm làm việc
            const mockExperiences = [
                {
                    id: 101,
                    company: 'Shopee Việt Nam',
                    role: 'Senior Marketing Specialist',
                    period: '01/2021 - Hiện tại',
                    details: [
                        'Quản lý ngân sách quảng cáo 500 triệu/tháng, tăng ROI lên 25%.',
                        'Xây dựng chiến lược thu hút người dùng mới, đạt mốc 100k users/tháng.',
                        'Phối hợp với đội ngũ Product để tối ưu hóa luồng checkout.'
                    ]
                },
                {
                    id: 102,
                    company: 'Tiki.vn',
                    role: 'Marketing Executive',
                    period: '06/2018 - 12/2020',
                    details: [
                        'Triển khai các chiến dịch Email Marketing cho 1 triệu khách hàng.',
                        'Phát triển nội dung cho fanpage đạt 200k followers.',
                        'Theo dõi và phân tích báo cáo tăng trưởng hàng tuần.'
                    ]
                }
            ];

            setExperiences(mockExperiences);
        }
    };

    const addKeyword = (keyword) => {
        showToast(`Đã thêm từ khóa "${keyword}" vào gợi ý CV`, 'success');
        // In a real app, this would push to a "suggested keywords" list or auto-insert into the active field
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
                                {[1, 2, 3].map(s => (
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
                                            {s === 1 ? 'Thông tin' : s === 2 ? 'Kinh nghiệm' : 'Hoàn tất'}
                                        </span>
                                        {s < 3 && <div
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
                                    <Link to="/editor"
                                          className="px-10 py-4 bg-smartfolio-blue text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:bg-blue-800 transition-all hover:scale-105">
                                        Vào Trình Chỉnh Sửa <ChevronRight className="w-5 h-5"/>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Bottom Navigation */}
                        {step < 3 && (
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
