import React from 'react';
import {Header} from '../components/layout/PublicHeader.jsx';
import {Footer} from '../components/layout/Footer.jsx';
import FloatingCVCard from '../features/user/components/FloatingCVCard.jsx';
import {useAuth} from '../features/auth/contexts/AuthContext.jsx';
import {useApp} from '../features/auth/contexts/AppContext.jsx';
import {ArrowRight, FileText, Bot, BarChart2, MessageSquare, ExternalLink} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import { TEMPLATES_DATA } from '../features/cv/constants/templates.js';

export default function Home() {
    const {profile, handleLogout} = useAuth();
    const {notificationsCount, showToast} = useApp();
    const navigate = useNavigate();
    const logout = (e) => {
        e.preventDefault();
        handleLogout();
        navigate('/');
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-background text-on-surface font-sans antialiased">
            <Header
                profile={profile}
                notificationsCount={notificationsCount}
                onLogout={logout}
                onHelpClick={() => showToast('Trung tâm trợ giúp Smartfolio đang tải dữ liệu.', 'info')}
            />
            <main className="flex-grow w-full">
                {/* Hero Section */}
                <section
                    className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 w-full">
                    <div className="lg:col-span-6 flex flex-col space-y-6">
                        <div
                            className="bg-primary text-on-primary px-sm py-xs rounded-full w-fit font-label-sm text-label-sm text-[12px] font-semibold tracking-wider">AI-Powered
                            Excellence
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
                            Nâng tầm sự nghiệp với <span className="text-primary relative">CV tối ưu bởi AI
                                <span className="absolute bottom-1 left-0 w-full h-2 bg-primary-container/30 -z-10 rounded"></span>
                            </span>
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                            Biến kinh nghiệm của bạn thành một bản CV chuyên nghiệp, thu hút nhà tuyển dụng chỉ
                            trong vài phút với trí tuệ nhân tạo.
                        </p>
                        <div className="flex flex-wrap gap-sm mt-sm">
                            <button
                                onClick={() => navigate('/builder')}
                                className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs transition-all hover:shadow-lg active:scale-95 cursor-pointer">
                                Tạo CV ngay
                                <ArrowRight className="w-4 h-4"/>
                            </button>
                            <button
                                onClick={() => navigate('/templates')}
                                className="bg-surface-container border border-outline-variant text-on-surface px-lg py-sm rounded-lg font-label-md text-label-md transition-all hover:bg-surface-container-low active:scale-95 cursor-pointer">
                                Xem mẫu CV
                            </button>
                        </div>
                    </div>

                    {/* Decorative AI Card Area */}
                    <div className="lg:col-span-6 flex justify-center relative">
                        <FloatingCVCard/>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-surface-container-low border-t border-b border-outline-variant py-20 px-6">
                    <div className="max-w-[1280px] mx-auto flex flex-col space-y-12">
                        <div className="text-center mb-lg space-y-xs">
                            <h2 className="font-headline-xl text-headline-xl text-primary font-bold">Tính năng đột phá
                                từ AI</h2>
                            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
                                Quy trình tạo CV truyền thống đã lỗi thời. Hãy để AI đồng hành cùng bạn trên con đường
                                sự nghiệp với bộ công cụ thông minh nhất.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                            <div
                                className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                                <div
                                    className="w-12 h-12 rounded-lg ai-gradient-bg flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5 text-on-primary"/>
                                </div>
                                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Tạo CV Thông
                                    minh</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Xây dựng CV chuyên nghiệp dựa trên thông tin cá nhân, JD và đặc thù của từng công
                                    ty.
                                </p>
                            </div>

                            <div
                                className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                                <div
                                    className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                                    <Bot className="w-5 h-5 text-on-secondary-container"/>
                                </div>
                                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phỏng vấn mô
                                    phỏng</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Luyện tập phỏng vấn theo mục tiêu công ty, JD và văn hóa doanh nghiệp thực tế.
                                </p>
                            </div>

                            <div
                                className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                                <div
                                    className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                                    <BarChart2 className="w-5 h-5 text-on-tertiary-container"/>
                                </div>
                                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phân tích CV
                                    theo JD</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    So sánh chi tiết CV hiện tại với JD để tìm ra những điểm thiếu sót và cơ hội cải
                                    thiện.
                                </p>
                            </div>

                            <div
                                className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                                <div
                                    className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-5 h-5 text-on-primary-container"/>
                                </div>
                                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phản hồi &
                                    Phân tích</h3>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Nhận đánh giá chi tiết và phân tích kết quả sau mỗi buổi phỏng vấn mô phỏng.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CV Templates Section */}
                <section className="py-xl w-full">
                    <div className="max-w-[1280px] mx-auto px-xl lg:px-gutter">
                        <div className="flex justify-between items-end mb-lg">
                            <div className="space-y-2">
                                <h2 className="font-headline-xl text-headline-xl text-primary font-bold">Kho mẫu CV
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
                                    <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-outline-variant mb-sm transition-transform group-hover:-translate-y-2">
                                        <img className="w-full h-full object-cover" alt={template.title}
                                             src={template.image}/>
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                className="bg-surface-container text-primary px-sm py-xs rounded-lg font-label-md text-label-md shadow-lg cursor-pointer"
                                                onClick={() => navigate("/templates")}
                                            >Sử dụng mẫu này
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-label-md text-label-md text-primary text-center">{template.title}</h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-xl px-xl lg:px-gutter max-w-[1280px] mx-auto w-full">
                    <div
                        className="ai-gradient-bg rounded-[2rem] p-lg md:p-xl flex flex-col items-center text-center gap-md relative overflow-hidden ai-glow">
                        <div
                            className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div
                            className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container/30 rounded-full blur-3xl -ml-32 -mb-32"></div>
                        <h2 className="font-display-lg text-headline-xl text-on-primary max-w-2xl relative z-10 font-bold">
                            Sẵn sàng để sở hữu công việc mơ ước?
                        </h2>
                        <p className="font-body-lg text-body-lg text-on-primary-container max-w-2xl relative z-10">
                            Gia nhập cộng đồng 100,000+ chuyên gia đang nâng tầm sự nghiệp cùng Smartfolio AI.
                        </p>
                        <button
                            onClick={() => navigate("/templates")}
                            className="bg-surface-container text-primary px-xl py-sm rounded-lg font-title-md text-title-md relative z-10 transition-all hover:bg-surface-container-low hover:shadow-xl active:scale-95 font-semibold cursor-pointer">
                            Bắt đầu hoàn toàn miễn phí
                        </button>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
}
