import React from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../features/auth/contexts/AuthContext.jsx';
import {
    Sparkles, ArrowRight, Cpu, FileText, Zap, ChevronRight, BarChart2, MessageSquare, ExternalLink
} from 'lucide-react';
import FloatingCVCard from '../features/user/components/FloatingCVCard.jsx';
import GuestHeader from '../components/layout/GuestHeader.jsx';
import {TEMPLATES_DATA} from "../features/cv/constants/templates.js";

const LandingPage = () => {
    const navigate = useNavigate();
    const {isLoggedIn} = useAuth();

    return (<div className="min-h-screen bg-background text-on-surface font-sans flex flex-col antialiased">
        <GuestHeader/>
        {/* Hero Section */}
        <section
            className="max-w-7xl mx-auto px-4 md:px-20 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 w-full">
            <div className="lg:col-span-6 flex flex-col space-y-6">
                <div
                    className="bg-primary text-on-primary px-sm py-xs rounded-full w-fit font-label-sm text-label-sm text-[12px] font-semibold tracking-wider">AI-Powered
                    Excellence
                </div>

                <h1 className="text-3xl md:text-6xl font-extrabold text-on-surface tracking-tight leading-tight">
                    ĐỒNG HÀNH CÙNG BẠN XÂY DỰNG <span className="text-primary relative">
                        SỰ NGHIỆP
                    </span>
                </h1>

                <p className="text-on-surface-variant text-base sm:text-lg max-w-2xl leading-relaxed">
                    Tất cả các mẫu sơ yếu lý lịch SmartFolio đều đã được kiểm nghiệm với các hệ thống quản lý tuyển dụng (ATS) hàng đầu để đảm bảo khả năng tương thích hoàn toàn. Nhờ bố cục gọn gàng, phông chữ dễ đọc và tiêu đề các mục theo chuẩn, thông tin của bạn sẽ không bị phần mềm bỏ sót.
                </p>

                <div
                    className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                    <button
                        id="landing-cta-create-cv"
                        onClick={() => navigate(isLoggedIn ? '/builder' : '/register')}
                        className="bg-primary hover:bg-primary-container text-on-primary font-medium px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
                    >
                        <span>Tạo CV ngay</span>
                        <ArrowRight className="w-4 h-4"/>
                    </button>
                    <button
                        id="landing-cta-view-templates"
                        onClick={() => navigate('/templates')}
                        className="bg-surface-container hover:bg-surface-container-low text-on-surface font-medium px-6 py-3.5 rounded-xl border border-outline-variant transition-all flex items-center justify-center active:scale-[0.98]"
                    >
                        Xem mẫu CV
                    </button>
                </div>
            </div>

            {/* Hero Image Mockup */}
            <div className="lg:col-span-6 flex justify-center relative">
                <FloatingCVCard/>
            </div>
        </section>

        {/* AI Features Section */}
        <section className=" border-t border-b border-outline-variant py-20 px-4 md:px-20">
            <div className="max-w-[1280px] mx-auto flex flex-col space-y-12">
                <div className="text-center space-y-4">
                    <h2 className="font-headline-xl text-2xl md:text-5xl text-primary font-bold">
                        Tính năng đột phá từ AI</h2>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                        Quy trình tạo CV truyền thống đã lỗi thời. Hãy để AI đồng hành cùng bạn trên con đường sự
                        nghiệp với bộ công cụ thông minh nhất.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                    <div
                        className="border-2  p-lg rounded-xl border-interview-selection-border hover:bg-on-primary/40 transition-all group">
                        <div
                            className="border-white opacity-60 border-2 w-12 h-12 rounded-lg ai-gradient-bg flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-on-tertiary-container"/>
                        </div>
                        <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Tạo CV Thông
                            minh</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Xây dựng CV chuyên nghiệp dựa trên thông tin cá nhân, JD và đặc thù của từng công ty.
                        </p>
                    </div>

                    <div
                        className="border-2  p-lg rounded-xl border-interview-selection-border hover:bg-on-primary/40 transition-all group">
                        <div
                            className="w-12 h-12 rounded-lg bg-tertiary-container border-white opacity-60 border-2 flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5 text-on-tertiary-container"/>
                        </div>
                        <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phỏng vấn mô
                            phỏng</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Luyện tập phỏng vấn theo mục tiêu công ty, JD và văn hóa doanh nghiệp thực tế.
                        </p>
                    </div>

                    <div
                        className="border-2  p-lg rounded-xl border-interview-selection-border hover:bg-on-primary/40 transition-all group">
                        <div
                            className="border-white opacity-60 border-2 w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                            <BarChart2 className="w-5 h-5 text-on-tertiary-container"/>
                        </div>
                        <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phân tích CV theo
                            JD</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            So sánh chi tiết CV hiện tại với JD để tìm ra những điểm thiếu sót và cơ hội cải thiện.
                        </p>
                    </div>

                    <div
                        className="border-2  p-lg rounded-xl border-interview-selection-border hover:bg-on-primary/40 transition-all group">
                        <div
                            className="border-white opacity-60 border-2 w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-5 h-5 text-on-tertiary-container"/>
                        </div>
                        <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phản hồi & Phân
                            tích</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Nhận đánh giá chi tiết và phân tích kết quả sau mỗi buổi phỏng vấn mô phỏng.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-xl w-full">
            <div className="max-w-[1280px] mx-auto px-xl lg:px-gutter">
                <div className="flex justify-between items-end mb-lg">
                    <div className="space-y-2">
                        <h2 className="font-headline-xl text-2xl md:text-5xl text-primary font-bold">Kho mẫu CV
                            hiện đại</h2>
                        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Hơn 50+ mẫu thiết kế chuẩn
                            ngành nghề, phong cách đa dạng.</p>
                    </div>
                    <a className="text-primary font-label-md text-label-md flex items-center gap-xs hover:underline cursor-pointer"
                       href="/templates">
                        Khám phá tất cả mẫu
                        <ExternalLink className="w-3 h-3"/>
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
                    {TEMPLATES_DATA.slice(0, 4).map((template) => (
                        <div key={template.id} className="group cursor-pointer">
                            <div
                                className="relative aspect-3/4 rounded-xl overflow-hidden shadow-md border border-outline-variant mb-sm transition-transform group-hover:-translate-y-2">
                                <img className="border-3 border-primary  rounded-2xl w-full h-full object-cover" alt={template.title}
                                     src={template.image}/>
                                <div
                                    className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        className="bg-surface-container text-primary px-sm py-xs rounded-lg font-label-md text-label-md shadow-lg cursor-pointer"
                                        onClick={() => navigate("/templates")}
                                    >Sử dụng mẫu này
                                    </button>
                                </div>
                            </div>
                            <h4 className="font-label-md text-label-md text-primary text-center">{template.title}</h4>
                        </div>))}
                </div>
            </div>
        </section>
        <section className="py-xl px-xl lg:px-gutter max-w-[1280px] mx-auto w-full">
            <div
                className="ai-gradient-bg rounded-[2rem] p-lg md:p-xl flex flex-col items-center text-center gap-md relative overflow-hidden ai-glow">
                <div
                    className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div
                    className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container/30 rounded-full blur-3xl -ml-32 -mb-32"></div>
                <h2 className="font-display-lg text-2xl md:text-5xl text-white/60 max-w-2xl relative z-10 font-bold">
                    Sẵn sàng để sở hữu công việc mơ ước?
                </h2>
                <p className="font-body-lg text-body-lg text-shadow-primary/70 max-w-2xl relative z-10">
                    Gia nhập cộng đồng 100,000+ chuyên gia đang nâng tầm sự nghiệp cùng Smartfolio AI.
                </p>
                <button
                    onClick={() => navigate("/templates")}
                    className="bg-surface-container text-primary px-xl py-sm rounded-lg font-title-md text-title-md relative z-10 transition-all hover:bg-surface-container-low hover:shadow-xl active:scale-95 font-semibold cursor-pointer">
                    Bắt đầu hoàn toàn miễn phí
                </button>
            </div>
        </section>

        <footer className="bg-surface-container-low border-t border-outline-variant py-8 px-6 mt-auto text-xs text-on-surface-variant">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                    <span className="font-bold text-on-surface text-sm">Smartfolio</span>
                    <p>© 2026 Smartfolio. Precision built for professionals.</p>
                </div>
                <div className="flex items-center space-x-6 font-medium">
                    <a href="#privacy" onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }} className="hover:text-primary">Chính sách bảo mật</a>
                    <a href="#terms" onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }} className="hover:text-primary">Điều khoản dịch vụ</a>
                    <a href="#support" onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                    }} className="hover:text-primary">Hỗ trợ</a>
                </div>
            </div>
        </footer>
    </div>);
};

export default LandingPage;