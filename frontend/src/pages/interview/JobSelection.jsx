import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Code, Megaphone, SwatchBook, BarChart2, Target, MoreHorizontal, ArrowLeft, ArrowRight, Bell, Sparkles } from 'lucide-react';
import {Header} from "../../components/layout/PublicHeader.jsx";
import { Footer } from "../../components/layout/Footer.jsx";

export default function JobSelection() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState('Software Engineer');

    const jobs = [
        { id: 'Software Engineer', title: 'Software Engineer', desc: 'Phát triển, bảo trì phần mềm', icon: Code },
        { id: 'Marketing Specialist', title: 'Marketing Specialist', desc: 'Quảng bá thương hiệu & sản phẩm', icon: Megaphone },
        { id: 'UI/UX Designer', title: 'UI/UX Designer', desc: 'Thiết kế giao diện người dùng', icon: SwatchBook },
        { id: 'Data Analyst', title: 'Data Analyst', desc: 'Phân tích dữ liệu & báo cáo', icon: BarChart2 },
        { id: 'Sales Manager', title: 'Sales Manager', desc: 'Phát triển kinh doanh & doanh số', icon: Target },
        { id: 'Khác', title: 'Vị trí khác', desc: 'Tự nhập chức danh mong muốn', icon: MoreHorizontal },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative">
            <Header />
            {/* Progress Bar Header */}
            <div className="flex-1 pt-8 px-6 max-w-3xl mx-auto w-full">
                <div className="flex flex-col items-center mb-10">
                    <p className="text-sm text-gray-500 font-medium mb-3">Bước 1 trên 5 • 25% hoàn tất</p>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full w-1/4 rounded-full"></div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Bạn đang tìm việc ở ngành nào?</h1>
                    <p className="text-gray-600">Chúng tôi sẽ tùy chỉnh các mẫu CV và gợi ý kỹ năng AI dựa trên vai trò mong muốn của bạn.</p>
                </div>

                {/* Search Input */}
                <div className="relative mb-8 shadow-sm rounded-xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Ví dụ: Senior Software Engineer, Marketing Manager..."
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    {jobs.map((job) => {
                        const Icon = job.icon;
                        const isSelected = selected === job.id;
                        return (
                            <div
                                key={job.id}
                                onClick={() => setSelected(job.id)}
                                className={`flex flex-col items-center justify-center p-6 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    isSelected ? 'border-blue-100 bg-blue-50/10' : 'border-transparent shadow-sm hover:border-gray-100'
                                }`}
                                style={{
                                    boxShadow: isSelected ? '0 4px 20px -5px rgba(37, 99, 235, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                                    borderColor: isSelected ? '#e0e7ff' : '#f1f5f9'
                                }}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-500'}`}>
                                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{job.title}</h3>
                                <p className="text-sm text-gray-500 text-center">{job.desc}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-12 pb-24">
                    <button
                        onClick={() => navigate('/interview')}
                        className="flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                    </button>
                    <button
                        onClick={() => navigate('/interview/cv-status')}
                        className="flex items-center bg-[#1a56db] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Floating Bottom Nav (from design) */}
            <Footer />
        </div>
    );
}
