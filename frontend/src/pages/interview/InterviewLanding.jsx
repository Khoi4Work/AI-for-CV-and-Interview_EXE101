import React from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Sparkles,
    PlayCircle,
    Users,
    Terminal,
    UserSquare2,
    Zap,
    Target,
    FileText,
    TrendingUp,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';
import {Header} from "../../components/layout/PublicHeader.jsx";
import {Footer} from "../../components/layout/Footer.jsx";
import {useAuth} from "../../contexts/AuthContext.jsx";
import GuestHeader from "../../components/layout/GuestHeader.jsx";

export default function InterviewLanding() {
    const navigate = useNavigate();
    const {isLoggedIn} = useAuth();
    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Header */}
            {isLoggedIn ? <Header/> : <GuestHeader/>}
            <main>
                {/* Hero Section */}
                <section
                    className="px-6 md:px-12 py-16 lg:py-24  mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    <div className="flex-1 lg:pr-10">
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1a2b49] leading-tight mb-6">
                            Luyện phỏng vấn AI -<br/>
                            <span className="text-blue-600">Chinh phục mọi nhà tuyển dụng</span>
                        </h1>
                        <p className="text-lg text-gray-600 mb-8  leading-relaxed">
                            Mô phỏng môi trường phỏng vấn thực tế, nhận phản hồi tức thì và cải thiện kỹ năng giao tiếp
                            của bạn với trợ lý trí tuệ nhân tạo chuyên sâu.
                        </p>
                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={() => navigate('/interview/job-selection')}
                                className="bg-[#1a56db] text-white px-6 py-3.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-md flex items-center">
                                <PlayCircle className="w-5 h-5 mr-2"/> Bắt đầu phỏng vấn ngay
                            </button>
                            <button
                                className="bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm">
                                Xem bản demo
                            </button>
                        </div>
                    </div>
                    <div
                        className="flex-1 w-full rounded-2xl bg-gray-50 border border-gray-100 shadow-2xl relative aspect-video flex items-center justify-center overflow-hidden">
                        {/* Abstract representation of the video/interview UI */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-white"></div>
                        <div
                            className="absolute bottom-6 left-6 bg-white rounded-xl p-3 shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <Sparkles className="w-3 h-3"/>
                                </div>
                                <span className="text-xs font-semibold text-gray-800">Feedback AI</span>
                            </div>
                            <img
                                src="https://i.postimg.cc/dV633pjF/interview.jpg"
                                alt="AI Feedback"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-gray-50 py-20 px-6 md:px-12 border-t border-gray-100">
                    <div className="-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Đa dạng hình thức phỏng vấn</h2>
                            <p className="text-gray-500 -2xl mx-auto">
                                Chọn loại hình phỏng vấn phù hợp với nhu cầu của bạn. AI của chúng tôi được huấn luyện
                                trên hàng ngàn kịch bản thực tế.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            {/* Card 1 */}
                            <div
                                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                <div
                                    className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                                    <Users className="w-8 h-8" strokeWidth={1.5}/>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">HR Interview</h3>
                                <p className="text-gray-600 mb-6 flex-grow">
                                    Tập trung vào văn hóa doanh nghiệp, kỹ năng mềm và khả năng hòa nhập đội ngũ.
                                </p>
                                <div className="flex gap-2">
                                    <span
                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Văn hóa</span>
                                    <span
                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Kỹ năng mềm</span>
                                </div>
                            </div>

                            {/* Card 2 (Active/Primary) */}
                            <div
                                className="bg-[#1a56db] rounded-2xl p-8 shadow-xl flex flex-col items-center text-center text-white transform scale-105 z-10">
                                <div
                                    className="w-16 h-16 rounded-2xl bg-white/20 text-white flex items-center justify-center mb-6 backdrop-blur-sm">
                                    <Terminal className="w-8 h-8" strokeWidth={1.5}/>
                                </div>
                                <h3 className="text-xl font-bold mb-3">Technical Interview</h3>
                                <p className="text-blue-100 mb-6 flex-grow">
                                    Kiểm tra kiến thức chuyên môn, khả năng giải quyết vấn đề và tư duy logic kỹ thuật.
                                </p>
                                <div className="flex gap-2">
                                    <span
                                        className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium border border-white/10">System Design</span>
                                    <span
                                        className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-medium border border-white/10">Coding</span>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div
                                className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
                                <div
                                    className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
                                    <UserSquare2 className="w-8 h-8" strokeWidth={1.5}/>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Behavioral Interview</h3>
                                <p className="text-gray-600 mb-6 flex-grow">
                                    Phỏng vấn dựa trên hành vi, xử lý tình huống thực tế bằng phương pháp STAR.
                                </p>
                                <div className="flex gap-2">
                                    <span
                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">STAR</span>
                                    <span
                                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Leadership</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className="py-24 px-6 md:px-12 -7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">

                        {/* Left Grid */}
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50">
                                <div
                                    className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                                    <Target className="w-5 h-5"/>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Giảm lo lắng</h4>
                                <p className="text-sm text-gray-600">Thực hành trong không gian riêng tư giúp bạn tự tin
                                    hơn trước buổi phỏng vấn thật.</p>
                            </div>
                            <div className="bg-green-50/50 rounded-2xl p-6 border border-green-100/50 mt-8">
                                <div
                                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                    <Zap className="w-5 h-5"/>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Cải thiện phản xạ</h4>
                                <p className="text-sm text-gray-600">Luyện tập trả lời câu hỏi hóc búa một cách trôi
                                    chảy và mạch lạc nhất.</p>
                            </div>
                            <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100/50 -mt-8">
                                <div
                                    className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-4">
                                    <FileText className="w-5 h-5"/>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Feedback chi tiết</h4>
                                <p className="text-sm text-gray-600">Nhận báo cáo phân tích về ngôn ngữ cơ thể, tông
                                    giọng và nội dung câu trả lời.</p>
                            </div>
                            <div className="bg-[#1a56db] rounded-2xl p-6 shadow-lg text-white">
                                <div
                                    className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-4">
                                    <TrendingUp className="w-5 h-5"/>
                                </div>
                                <h4 className="font-bold mb-2">Kết quả thực tế</h4>
                                <p className="text-sm text-blue-100">Tăng tỷ lệ nhận được offer lên đến 60% sau chỉ 3
                                    buổi luyện tập.</p>
                            </div>
                        </div>

                        {/* Right Content */}
                        <div className="flex-1 space-y-8">
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Tại sao nên luyện phỏng vấn với
                                AI?</h2>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Môi trường an toàn</h4>
                                        <p className="text-gray-600">Tự do thử nghiệm các phương án trả lời khác nhau mà
                                            không sợ phán xét.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Cá nhân hóa theo ngành
                                            nghề</h4>
                                        <p className="text-gray-600">AI điều chỉnh câu hỏi dựa trên vị trí ứng tuyển và
                                            mô tả công việc (JD) cụ thể.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircle2 className="w-6 h-6 text-blue-600"/>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg mb-1">Tiết kiệm thời gian & chi
                                            phí</h4>
                                        <p className="text-gray-600">Luyện tập bất cứ khi nào, bất cứ nơi đâu chỉ với
                                            một chiếc laptop có mic.</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="text-[#1a56db] font-bold inline-flex items-center hover:text-blue-800 transition-colors pt-4">
                                Khám phá thêm các tính năng khác <ArrowRight className="w-4 h-4 ml-2"/>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <section className="bg-[#0f3b97] py-20 px-6 text-center text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Sẵn sàng để tỏa sáng?</h2>
                    <p className="text-blue-100 -2xl mx-auto mb-10 text-lg">
                        Đừng để buổi phỏng vấn mơ ước trôi qua chỉ vì thiếu sự chuẩn bị. Hãy bắt đầu luyện tập ngay hôm
                        nay.
                    </p>
                    <button
                        onClick={() => navigate('/interview/job-selection')}
                        className="bg-white text-[#0f3b97] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-lg">
                        Bắt đầu phỏng vấn ngay - Miễn phí
                    </button>
                </section>
            </main>

            {/* Footer */}
            <Footer/>
        </div>
    );
}
