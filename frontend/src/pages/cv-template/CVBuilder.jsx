import React, { useState } from 'react';
import {Link} from 'react-router-dom';
import {Sparkles, Trash2, Plus, Download, LayoutTemplate, Briefcase} from 'lucide-react';
import Sidebar from "../../components/template/Sidebar.jsx";
import {Header} from "../../components/layout/PublicHeader.jsx";
import { useApp } from '../../contexts/AppContext.jsx';

export default function CVBuilder() {
    const { showToast } = useApp();
    const [editMode, setEditMode] = useState('direct'); // 'direct' or 'paste'
    const [userName, setUserName] = useState('Nguyễn Văn A');
    const [userEmail, setUserEmail] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [experiences, setExperiences] = useState([
        { id: 1, text: '' }
    ]);

    const addExperience = () => {
        setExperiences([...experiences, { id: Date.now(), text: '' }]);
    };

    const removeExperience = (id) => {
        if (experiences.length === 1) {
            showToast('Cần giữ lại ít nhất một mục kinh nghiệm!', 'info');
            return;
        }
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const updateExperience = (id, text) => {
        setExperiences(experiences.map(exp => exp.id === id ? { ...exp, text } : exp));
    };

    const handleFileUpload = () => {
        document.getElementById('cv-upload-input').click();
    };

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            showToast(`Đã tải lên tệp ${file.name} thành công!`, 'success');

            // Giả lập trích xuất dữ liệu từ file
            setUserName('Trần Thị B');
            setUserEmail('tranthib@example.com');
            setUserPhone('0901 234 567');
            setExperiences([
                { id: 1, text: 'Quản lý dự án phát triển phần mềm tại Công ty X trong 3 năm, tăng hiệu suất làm việc của đội ngũ lên 20%.' },
                { id: 2, text: 'Phát triển hệ thống E-commerce sử dụng React và Node.js cho đối tác Nhật Bản.' },
                { id: 3, text: 'Thiết kế kiến trúc hệ thống Microservices cho ứng dụng Fintech với hơn 100k người dùng.' },
            ]);
        }
    };

    const addKeyword = (keyword) => {
        showToast(`Đã thêm từ khóa "${keyword}" vào gợi ý CV`, 'success');
    };

    return (
        <>
            <Header/>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8 w-full flex-grow">

                <div className="flex-grow grid grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Your Info */}
                    <section
                        className="col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center">
                                    <LayoutTemplate className="h-4 w-4"/>
                                </div>
                                <h2 className="text-xl font-bold">Thông tin của bạn</h2>
                            </div>
                            <button
                                onClick={handleFileUpload}
                                className="text-sm font-medium text-blue-700 flex items-center gap-1 hover:underline">
                                <Download className="h-4 w-4"/>
                                Tải CV cũ (.pdf, .docx)
                                <input
                                    id="cv-upload-input"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.docx"
                                    onChange={onFileChange}
                                />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Form Tabs */}
                            {/*<div className="bg-slate-100 p-1 rounded-lg flex mb-8 ">*/}
                            {/*    <button*/}
                            {/*        onClick={() => setEditMode('direct')}*/}
                            {/*        className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${*/}
                            {/*            editMode === 'direct'*/}
                            {/*            ? 'bg-white text-blue-700 shadow-sm'*/}
                            {/*            : 'text-slate-500 hover:text-slate-700'*/}
                            {/*        }`}>*/}
                            {/*        Chỉnh sửa trực tiếp*/}
                            {/*    </button>*/}
                            {/*    <button*/}
                            {/*        onClick={() => setEditMode('paste')}*/}
                            {/*        className={`flex-1 text-center py-2 text-xs font-semibold transition-all ${*/}
                            {/*            editMode === 'paste'*/}
                            {/*            ? 'bg-white text-blue-700 shadow-sm'*/}
                            {/*            : 'text-slate-500 hover:text-slate-700'*/}
                            {/*        }`}>*/}
                            {/*        Dán nội dung*/}
                            {/*    </button>*/}
                            {/*</div>*/}

                            {/* Basic Fields */}
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Tên đầy đủ</label>
                                    <input
                                        type="text"
                                        className="w-full input-underlined text-lg font-bold"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Email</label>
                                        <input
                                            type="email"
                                            className="w-full input-underlined text-slate-600"
                                            value={userEmail}
                                            onChange={(e) => setUserEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400">Số điện
                                            thoại</label>
                                        <input
                                            type="text"
                                            className="w-full input-underlined text-slate-600"
                                            value={userPhone}
                                            onChange={(e) => setUserPhone(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Experience Section */}
                                <div className="pt-4">
                                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Kinh
                                        nghiệm làm việc</h3>

                                    {experiences.map((exp) => (
                                        <div key={exp.id} className="relative group mb-4">
                                            <div
                                                className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-32 focus-within:border-blue-500 transition-colors">
                                                <textarea
                                                    className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-sm"
                                                    placeholder="Nhập kinh nghiệm làm việc..."
                                                    value={exp.text}
                                                    onChange={(e) => updateExperience(exp.id, e.target.value)}
                                                ></textarea>
                                            </div>
                                            <button
                                                onClick={() => removeExperience(exp.id)}
                                                className="absolute -top-3 -right-3 bg-white border border-slate-200 text-red-500 p-1.5 rounded-full hover:bg-red-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Xóa">
                                                <Trash2 className="h-4 w-4"/>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Add More Button */}
                                    <button
                                        onClick={addExperience}
                                        className="w-full mt-4 py-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 font-medium flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-blue-600 transition-colors group">
                                        <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600"/>
                                        Thêm kinh nghiệm
                                    </button>

                                    <Link to="/editor"
                                          className="mt-8 w-full py-3 bg-smartfolio-blue text-white font-bold rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-800 transition">
                                        Tạo CV
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* RIGHT COLUMN: JD & AI */}
                    <section className="col-span-5 flex flex-col gap-6">
                        <div
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px] sticky top-24">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-6 w-6 text-slate-800"/>
                                    <h2 className="text-xl font-bold">Mô tả công việc (JD)</h2>
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-medium text-slate-400">Dán nội dung JD mục tiêu</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                        <span className="text-[10px] font-bold text-blue-900 tracking-wider">AI LISTENING</span>
                                    </div>
                                </div>

                                <div className="flex-grow mb-6 relative">
                                    <p className="text-sm text-slate-400 mb-4 absolute mt-2">Ví dụ:</p>
                                    <textarea
                                        className="w-full h-full border-none focus:ring-0 resize-none p-0 text-slate-600 placeholder-slate-300 pt-8"
                                        placeholder="Nhập mô tả công việc của bạn tại đây..."
                                    ></textarea>
                                </div>

                                {/* AI Suggestions Card */}
                                <div
                                    className="bg-white border-2 border-blue-500 rounded-xl p-5 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-1 opacity-10">
                                        <Sparkles className="w-16 h-16 text-blue-500"/>
                                    </div>

                                    <div className="flex items-center gap-2 mb-2 relative z-10">
                                        <Sparkles className="w-4 h-4 text-blue-600" fill="currentColor"/>
                                        <h4 className="text-sm font-bold text-blue-900">Gợi ý từ AI</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed mb-4 relative z-10">
                                        Dựa trên JD, hãy cân nhắc thêm các từ khóa sau vào CV:
                                    </p>
                                    <div className="flex flex-wrap gap-2 relative z-10">
                                        <button
                                            onClick={() => addKeyword('React Query')}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1 transition-colors">
                                            <span className="text-xs">+</span> React Query
                                        </button>
                                        <button
                                            onClick={() => addKeyword('Web Performance')}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1 transition-colors">
                                            <span className="text-xs">+</span> Web Performance
                                        </button>
                                        <button
                                            onClick={() => addKeyword('TypeScript')}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1 transition-colors">
                                            <span className="text-xs">+</span> TypeScript
                                        </button>
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