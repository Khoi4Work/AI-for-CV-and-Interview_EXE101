import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bell, ChevronDown, User, ArrowRight, ArrowLeft } from 'lucide-react';

export default function InterviewSetup() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
            {/* Top Nav (from image 6) */}

            <main className="flex-grow flex flex-col items-center pt-8 px-6 pb-20 relative">

                {/* Simple Tabs Menu */}
                <div className="flex items-center gap-8 text-xs font-bold tracking-widest text-gray-400 mb-8 mt-4 uppercase">
                    <div className="text-[#1a2b49] border-b-2 border-[#1a2b49] pb-2">SETUP</div>
                    <div className="pb-2">START</div>
                    <div className="pb-2">RESULTS</div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-8 lg:p-10 w-full max-w-3xl  z-20">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Session Setup</h1>
                        <p className="text-gray-500 text-sm">Configure your practice session with details for AI personalization.</p>
                    </div>

                    <div className="space-y-6">

                        {/* Field: Position */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Position</label>
                            <div className="relative">
                                <select className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                                    <option value="" disabled selected>Select position...</option>
                                    <option>Software Engineer</option>
                                    <option>Product Manager</option>
                                    <option>Data Scientist</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Field: Experience level */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Experience level</label>
                            <div className="relative">
                                <select className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                                    <option value="" disabled selected>Select level...</option>
                                    <option>Intern / Freshman</option>
                                    <option>Junior</option>
                                    <option>Senior</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                        </div>

                        {/* Grid for Interview Type & Language */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Interview type</label>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-medium py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                                        <option>HR / General</option>
                                        <option>Technical</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">Language</label>
                                <div className="relative">
                                    <select className="w-full appearance-none bg-white border border-gray-200 text-gray-900 font-medium py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                                        <option>English</option>
                                        <option>Vietnamese</option>
                                    </select>
                                    {/* Language icon instead of chevron in design */}
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-600">
                                        <span className="font-serif italic font-bold">文A</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Field: Duration */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Duration</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button className="py-3 px-2 border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition-colors">
                                    <div className="font-bold text-gray-900 text-lg">5</div>
                                    <div className="text-xs text-gray-500">Minutes</div>
                                </button>
                                <button className="py-3 px-2 bg-blue-100/50 border border-blue-200 rounded-xl text-center shadow-inner transition-colors">
                                    <div className="font-bold text-blue-700 text-lg">10</div>
                                    <div className="text-xs text-blue-600 font-medium">Minutes</div>
                                </button>
                                <button className="py-3 px-2 border border-gray-200 rounded-xl text-center hover:bg-gray-50 transition-colors">
                                    <div className="font-bold text-gray-900 text-lg">15</div>
                                    <div className="text-xs text-gray-500">Minutes</div>
                                </button>
                            </div>
                        </div>

                        {/* AI Callout Box */}
                        <div className="bg-[#f4f7fa] border border-blue-100 rounded-xl p-4 flex gap-3 mt-2">
                            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 mb-1">AI Personalization</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    Use 1000+ real interview data points to mô phỏng nhất dựa các con. Hệ thống sẽ tự động học các dựa trên cơ sở liệu từ 1000+ doanh nghiệp hàng đầu.
                                </p>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                onClick={() => navigate('/interview/career-goal')}
                                className="w-full flex items-center justify-center bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                            </button>
                            <button
                                onClick={() => navigate('/home')}
                                className="w-full flex items-center justify-center bg-[#0e3a9f] text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors shadow-md">
                                Continue <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 mt-4">© 2024 Smartfolio AI Platform. Bảo mật thông tin người dùng là ưu tiên hàng đầu của chúng tôi.</p>
                        </div>

                    </div>
                </div>

                {/* Decorative background element showing context of a recording UI floating on the right */}
                <div className="hidden lg:block absolute bottom-24 right-12 z-10 w-72 pointer-events-none opacity-80">
                    <div className="bg-white rounded-xl p-5 shadow-2xl border border-gray-100 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0"></div>
                            <div className="w-full">
                                <div className="h-2 bg-gray-200 rounded-full w-full mb-2"></div>
                                <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                            </div>
                        </div>
                        <div className="bg-[#0e3a9f] rounded-xl p-4 text-white mt-4 -mx-2 -mb-2 shadow-lg">
                            <div className="w-8 h-8 rounded-full bg-white/20 mb-3 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="font-bold text-sm mb-1">Ready to shine?</h4>
                            <p className="text-xs text-blue-100 leading-relaxed">Your AI interview session is ready to start after this step.</p>
                        </div>
                    </div>
                </div>

            </main>

            {/* Footer */}

        </div>
    );
}
