import React, { useState } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Upload, Lock } from 'lucide-react';

export default function CvStatus() {
    const [selected, setSelected] = useState(null);

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans relative">
            {/* Weird Top Nav from Image 3 */}


            {/* Main Content */}
            <main className="flex-grow flex flex-col items-center pt-16 px-6 relative pb-32">
                <div className="w-full  max-w-3xl">

                    {/* Progress Bar Container */}
                    <div className="flex flex-col items-center mb-10 w-full  max-w-3xl mx-auto">
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-4">
                            <div className="bg-blue-800 h-full w-1/2 rounded-full"></div>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Bước 2 trên 4 • 50% hoàn tất</p>
                    </div>

                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Bạn đã có CV chưa?</h1>
                        <p className="text-gray-600">Smartfolio sẽ giúp bạn tối ưu hóa hồ sơ dựa trên tình trạng hiện tại.</p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-16">

                        {/* Card 1 */}
                        <div
                            onClick={() => setSelected('have')}
                            className={`bg-white p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col ${
                                selected === 'have' ? 'border-[#1a56db] shadow-md ring-1 ring-[#1a56db] ring-opacity-20' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'
                            }`}
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                                <Upload className="w-7 h-7" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Tôi đã có CV</h3>
                            <p className="text-gray-500 text-sm mb-8 flex-grow leading-relaxed">
                                Tải lên file PDF hoặc Word hiện có. AI sẽ phân tích và gợi ý các cải thiện ngay lập tức.
                            </p>
                            <div className="flex items-center text-[#1a56db] font-semibold text-sm">
                                Tải lên ngay <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div
                            onClick={() => setSelected('nothave')}
                            className={`bg-white p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col ${
                                selected === 'nothave' ? 'border-[#1a56db] shadow-md ring-1 ring-[#1a56db] ring-opacity-20' : 'border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md'
                            }`}
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-6 shadow-md shadow-blue-200">
                                <Sparkles className="w-7 h-7" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Tôi chưa có CV</h3>
                            <p className="text-gray-500 text-sm mb-8 flex-grow leading-relaxed">
                                Tạo mới bằng AI. Chỉ cần trả lời vài câu hỏi, chúng tôi sẽ viết nội dung chuyên nghiệp cho bạn.
                            </p>
                            <div className="flex items-center text-gray-900 font-semibold text-sm">
                                Tạo mới bằng Smartfolio
                            </div>
                        </div>

                    </div>

                    {/* Action Footer (In-page) */}
                    <div className="flex items-center justify-between w-full mt-4">
                        <button className="flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                        </button>
                        <div className="flex items-center text-gray-400 text-xs">
                            <Lock className="w-3 h-3 mr-1" /> Dữ liệu của bạn được bảo mật
                        </div>
                        <button className="bg-[#1a56db] text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm">
                            Tiếp tục
                        </button>
                    </div>

                </div>

                {/* Floating AI Suggestion */}
                <div className="fixed bottom-24 right-8 bg-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100  max-w-3xl z-10 animate-fade-in-up">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-[#1a2b49] text-white flex items-center justify-center flex-shrink-0 mt-1">
                            <Sparkles className="w-5 h-5 fill-current" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-900 mb-1">Gợi ý từ AI</p>
                            <p className="text-sm text-gray-600 leading-tight">Nên chọn "Tạo mới" nếu bạn muốn thay đổi định hướng nghề nghiệp!</p>
                        </div>
                    </div>
                </div>

            </main>

            {/* Actual Footer (Like across all pages) */}

        </div>
    );
}
