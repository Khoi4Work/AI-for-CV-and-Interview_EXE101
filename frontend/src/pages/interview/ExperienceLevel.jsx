import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, ArrowRight, GraduationCap, Rocket, Medal, Crown } from 'lucide-react';
import {Header} from "../../components/layout/PublicHeader.jsx";
import { Footer } from "../../components/layout/Footer.jsx";

export default function ExperienceLevel() {
    const navigate = useNavigate();
    const [selected, setSelected] = useState(null);

    const levels = [
        { id: 'Intern/Freshman', title: 'Intern/Freshman', desc: 'Sinh viên mới tốt nghiệp hoặc đang tìm kiếm cơ hội thực tập đầu tiên.', icon: GraduationCap },
        { id: 'Junior', title: 'Junior', desc: 'Từ 1 - 3 năm kinh nghiệm làm việc thực tế trong lĩnh vực chuyên môn.', icon: Rocket },
        { id: 'Senior', title: 'Senior', desc: 'Từ 3 - 5 năm kinh nghiệm, có khả năng làm việc độc lập và dẫn dắt nhóm.', icon: Medal },
        { id: 'Expert', title: 'Expert', desc: 'Trên 5 năm kinh nghiệm, chuyên gia hoặc quản lý cấp cao trong ngành.', icon: Crown },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-white font-sans relative">
            <Header />
            {/* Top Nav (simplified version based on Image 4 context) */}


            <main className="flex-grow flex flex-col items-center pt-10 px-6 pb-20">
                <div className="w-full max-w-3xl">

                    {/* Progress Header aligned differently in image 4 */}
                    <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-3">
                        <span>Step 3 of 4</span>
                        <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-12">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Mức độ kinh nghiệm của bạn?</h1>
                        <p className="text-gray-600 text-lg">Điều này giúp chúng tôi cá nhân hóa các gợi ý AI và mẫu CV phù hợp nhất với lộ trình sự nghiệp của bạn.</p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-20">
                        {levels.map((level) => {
                            const Icon = level.icon;
                            const isSelected = selected === level.id;

                            return (
                                <div
                                    key={level.id}
                                    onClick={() => setSelected(level.id)}
                                    className={`bg-white p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col ${
                                        isSelected ? 'border-blue-100 shadow-md ring-0 bg-blue-50/20' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'
                                    }`}
                                    style={{
                                        borderColor: isSelected ? '#dbeafe' : '#f1f5f9'
                                    }}
                                >
                                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${isSelected ? 'bg-blue-100 text-blue-600 shadow-sm shadow-blue-100/50' : 'bg-blue-50 text-blue-500'}`}>
                                        <Icon className="w-6 h-6" strokeWidth={1.5} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{level.title}</h3>
                                    <p className="text-gray-600 text-sm flex-grow leading-relaxed">
                                        {level.desc}
                                    </p>
                                </div>
                            )
                        })}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between w-full">
                        <button
                            onClick={() => navigate('/interview/cv-status')}
                            className="flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                        </button>
                        <button
                            onClick={() => navigate('/interview/career-goal')}
                            className="bg-[#1a56db] text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                            Tiếp tục <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>

                </div>
            </main>

            {/* Simple Footer */}
            <Footer />
        </div>
    );
}
