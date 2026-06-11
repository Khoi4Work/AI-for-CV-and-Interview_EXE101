import React from 'react';
import { Sparkles, ArrowLeft, Bell } from 'lucide-react';

export default function CareerGoal() {
    const suggestions = [
        '+ Học hỏi công nghệ mới',
        '+ Đóng góp giá trị',
        '+ Định hướng lãnh đạo',
        '+ Tối ưu quy trình'
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
            {/* Top Nav (from image 5) */}

            <main className="flex-grow flex flex-col items-center pt-10 px-6 pb-20">
                <div className="w-full max-w-2xl">

                    {/* Progress Header aligned differently */}
                    <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
                        <span>Bước 4 trên 4 • 100% hoàn tất</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mb-8">
                        <div className="bg-[#1a56db] h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-3xl md:text-3xl font-bold text-gray-900 mb-3">Mục tiêu nghề nghiệp?</h1>
                        <p className="text-gray-600 text-base">Mô tả ngắn gọn về định hướng và giá trị bạn muốn mang lại. AI của chúng tôi sẽ giúp bạn hoàn thiện nó.</p>
                    </div>

                    {/* Form Area */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-12">
             <textarea
                 className="w-full h-40 p-5 text-gray-700 placeholder-gray-400 focus:outline-none resize-none"
                 placeholder="Tôi muốn đóng góp vào các dự án..."
             ></textarea>

                        {/* AI Suggestions Footer of Textarea */}
                        <div className="bg-gray-50/80 p-5 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <p className="text-sm font-bold text-gray-800">Gợi ý từ AI</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((sug, idx) => (
                                    <button key={idx} className="bg-gray-200/60 hover:bg-gray-300/60 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
                                        {sug}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="border-gray-200 mb-8" />

                    {/* Action Buttons Stacked */}
                    <div className="flex flex-col gap-3 w-full">
                        <button className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 px-6 py-3.5 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors shadow-sm">
                            <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại
                        </button>
                        <button className="w-full flex items-center justify-center bg-[#4f6bf5] text-white px-6 py-3.5 rounded-xl text-base font-medium hover:bg-blue-600 transition-colors shadow-md">
                            <Sparkles className="w-5 h-5 mr-2 fill-current" /> Bắt đầu ngay
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            Thông tin này sẽ được sử dụng để tối ưu hồ sơ Smartfolio của bạn.
                        </p>
                    </div>

                </div>
            </main>

            {/* Footer */}

        </div>
    );
}
