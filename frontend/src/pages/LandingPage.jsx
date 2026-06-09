import React, { Component } from 'react';
import { Sparkles, ArrowRight, CheckCircle2, Cpu, FileText, Zap, ChevronRight, GraduationCap, Briefcase } from 'lucide-react';

class LandingPage extends Component {
  render() {
    const { onLogin } = this.props;
    return (
      <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col antialiased">
        {/* Landing Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-150 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#0b3c8f] flex items-center justify-center text-white font-bold text-lg select-none">
              S
            </div>
            <span className="text-xl font-bold text-[#0b3c8f] tracking-tight">Smartfolio</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <a href="#home" className="text-[#0b3c8f] border-b-2 border-[#0b3c8f] pb-1">Home</a>
            <a href="#interview" className="text-slate-500 hover:text-slate-800 transition-colors">Interview</a>
            <a href="#templates" className="text-slate-500 hover:text-slate-800 transition-colors">Templates</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center space-x-4">
            <button
              id="landing-register-btn"
              onClick={onLogin}
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
            >
              Đăng ký
            </button>
            <button
              id="landing-login-btn"
              onClick={onLogin}
              className="bg-[#0b3c8f] hover:bg-[#093278] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98]"
            >
              Đăng nhập
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 w-full">
          <div className="lg:col-span-6 flex flex-col space-y-6">
            <div className="inline-flex items-center self-start">
              <span className="h-2 w-8 bg-[#0b3c8f]/20 rounded-full"></span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Nâng tầm sự nghiệp với <br />
              <span className="text-[#0b3c8f] relative">
                CV tối ưu bởi AI
                <span className="absolute bottom-1 left-0 w-full h-2 bg-blue-100 -z-10 rounded"></span>
              </span>
            </h1>

            <p className="text-slate-500 text-base sm:text-lg max-w-lg leading-relaxed">
              Áp dụng trí tuệ nhân tạo tiên tiến giúp rà soát lỗi, chấm điểm kỹ năng và đề xuất các từ khóa chuẩn ATS giúp bạn chinh phục mọi nhà tuyển dụng.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                id="landing-cta-create-cv"
                onClick={onLogin}
                className="bg-[#0b3c8f] hover:bg-[#093278] text-white font-medium px-6 py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:shadow-[#0b3c8f]/10 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
              >
                <span>Tạo CV ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="landing-cta-view-templates"
                onClick={onLogin}
                className="bg-white hover:bg-slate-50 text-slate-800 font-medium px-6 py-3.5 rounded-xl border border-slate-200 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                Xem mẫu CV
              </button>
            </div>
          </div>

          {/* Hero Image Mockup */}
          <div className="lg:col-span-6 flex justify-center relative">
            <div className="absolute -top-12 -left-12 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
            <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-60"></div>

            <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-100 aspect-[3/4] p-8 flex flex-col justify-between overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                    <div className="space-y-1.5">
                      <div className="w-24 h-3 bg-slate-200 rounded-full"></div>
                      <div className="w-16 h-2 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="w-12 h-4 bg-slate-100 rounded-full"></div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="w-28 h-2.5 bg-slate-200 rounded-full mb-3"></div>
                    <div className="space-y-2">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                      <div className="w-[85%] h-1.5 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="w-32 h-2.5 bg-slate-200 rounded-full mb-3"></div>
                    <div className="space-y-2">
                      <div className="w-full h-1.5 bg-slate-100 rounded-full"></div>
                      <div className="w-[90%] h-1.5 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 right-4 transform translate-x-4 -translate-y-1/2 z-10">
                <div className="bg-white/95 shadow-xl border border-slate-150/80 rounded-full px-4 py-2 flex items-center space-x-1.5 backdrop-blur-sm select-none">
                  <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-700">AI Suggestion</span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-slate-100/80 flex justify-between items-center text-[10px] text-slate-400">
                <span>Smartfolio ATS Verifier</span>
                <div className="flex space-x-1">
                  <span className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-semibold">✓</span>
                  <span className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold font-mono">1</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="bg-slate-50 border-t border-b border-slate-100 py-20 px-6">
          <div className="max-w-7xl mx-auto flex flex-col space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tính năng đột phá từ AI</h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Quy trình tạo CV truyền thống đã lỗi thời. Hãy để AI đồng hành cùng bạn trên con đường sự nghiệp.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
              <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[#0b3c8f]">
                    <Cpu className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900">Phân tích từ khóa ATS</h3>
                  </div>
                  <p className="text-xs text-slate-500 max-w-md">
                    Hệ thống thông minh sẽ so sánh trực tiếp CV của bạn với bản mô tả công việc (JD) của dự án để lọc ra các từ khóa then chốt còn thiếu.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-1 rounded-full font-medium">✓ ReactJS</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-1 rounded-full font-medium">✓ TypeScript</span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-150 px-2 py-1 rounded-full font-medium animate-pulse">! TailwindCSS</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Git Workflow</span>
                </div>
              </div>

              <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[#0b3c8f]">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900">Chấm điểm CV tối ưu</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Nhận kết quả đánh giá sức mạnh tổng quát, bố cục, độ tối ưu của thông tin cá nhân và định dạng file ngay lập tức.
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs font-semibold text-slate-500">Tổng điểm bảo mật</span>
                  <span className="text-lg font-bold text-[#0b3c8f] bg-blue-50 px-3 py-1 rounded-lg">92%</span>
                </div>
              </div>

              <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[#0b3c8f]">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900">Xuất file PDF nâng cao</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Layout chuẩn mực, không hề bị lỗi dòng, lỗi font chữ khi chuyển định dạng.
                  </p>
                </div>
              </div>

              <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between min-h-[160px]">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-[#0b3c8f]">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="font-bold text-slate-900">Gợi ý từ AI theo thời gian thực</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Tận dụng sức mạnh trí tuệ nhân tạo Gemini để tự dệt câu tự giới thiệu (Summary Review) hoặc diễn hoạt hóa kinh nghiệm cũ trở nên trau chuốt, đắt giá nhất.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="flex flex-col space-y-10">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Kho mẫu CV hiện đại</h2>
                <p className="text-slate-400 text-xs sm:text-sm">Được kiểm định bởi các chuyên gia tuyển dụng hàng đầu hiện nay.</p>
              </div>
              <button
                id="landing-explore-all-templates"
                onClick={onLogin}
                className="text-[#0b3c8f] hover:underline text-xs sm:text-sm font-semibold flex items-center space-x-1 whitespace-nowrap"
              >
                <span>Khám phá tất cả mẫu</span>
                <span className="text-xs">[↗]</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  onClick={onLogin}
                  className="group cursor-pointer bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm hover:shadow-lg hover:border-slate-350 transition-all aspect-[3/4.2] flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#0b3c8f]">
                        CV
                      </div>
                      <div className="w-16 h-2 bg-slate-150 rounded"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="w-full h-1 bg-slate-100 rounded"></div>
                      <div className="w-[80%] h-1 bg-slate-100 rounded"></div>
                    </div>
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="w-12 h-1.5 bg-slate-150 rounded"></div>
                      <div className="w-full h-1 bg-slate-100 rounded"></div>
                      <div className="w-full h-1 bg-slate-100 rounded"></div>
                      <div className="w-[90%] h-1 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-[#0b3c8f] transition-colors flex items-center space-x-0.5">
                    <span>Dùng mẫu này</span>
                    <ChevronRight className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 pb-20 w-full">
          <div className="bg-[#0b3c8f] text-white rounded-3xl p-10 md:p-14 text-center space-y-8 shadow-xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-8 -mb-8 pointer-events-none"></div>

            <div className="space-y-3 max-w-2xl z-10">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Sẵn sàng để sở hữu công việc mơ ước?</h2>
              <p className="text-blue-100 text-sm leading-relaxed max-w-lg mx-auto">
                Chỉ mất 5 phút để xây dựng một bản CV thông minh, vượt qua vòng lọc tự động và nhanh chóng lọt vào mắt xanh của bộ phận tuyển dụng.
              </p>
            </div>

            <button
              id="landing-bottom-cta"
              onClick={onLogin}
              className="z-10 bg-white hover:bg-slate-50 text-[#0b3c8f] font-semibold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-sm"
            >
              Bắt đầu hoàn toàn miễn phí
            </button>
          </div>
        </section>

        <footer className="bg-slate-150/50 border-t border-slate-200 py-8 px-6 mt-auto text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-bold text-slate-700 text-sm">Smartfolio</span>
              <p>© 2026 Smartfolio. Precision built for professionals.</p>
            </div>
            <div className="flex items-center space-x-6 font-medium">
              <a href="#privacy" onClick={onLogin} className="hover:text-slate-800">Privacy Policy</a>
              <a href="#terms" onClick={onLogin} className="hover:text-slate-800">Terms of Service</a>
              <a href="#support" onClick={onLogin} className="hover:text-slate-800">Support</a>
            </div>
          </div>
        </footer >
      </div>
    );
  }
}

export default LandingPage;
