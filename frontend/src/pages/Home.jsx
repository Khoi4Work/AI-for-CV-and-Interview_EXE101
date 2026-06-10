import React, { useEffect, useRef } from 'react';
import { Header } from '../components/layout/PublicHeader';
import { Footer } from '../components/layout/Footer';
import FloatingCVCard from '../components/FloatingCVCard';

export default function Home({ onLogout, onShowNotification }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50/50 text-slate-800 font-sans antialiased">
      <Header onLogout={onLogout} />
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-xl pb-lg w-full max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop lg:px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-center w-full">
            <div className="flex flex-col gap-md z-10 w-full">
              <div className="bg-primary-fixed text-on-primary-fixed-variant px-sm py-xs rounded-full w-fit font-label-sm text-label-sm text-[12px] font-semibold tracking-wider">AI-Powered Excellence</div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Nâng tầm sự nghiệp với <span className="text-primary">CV tối ưu bởi AI</span>
              </h1>
              <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
                Biến kinh nghiệm của bạn thành một bản CV chuyên nghiệp, thu hút nhà tuyển dụng chỉ trong vài phút với trí tuệ nhân tạo.
              </p>
              <div className="flex flex-wrap gap-sm mt-sm">
                <button className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs transition-all hover:shadow-lg active:scale-95">
                  Tạo CV ngay
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button className="bg-surface-container-lowest border border-outline-variant text-primary px-lg py-sm rounded-lg font-label-md text-label-md transition-all hover:bg-surface-container-low active:scale-95">
                  Xem mẫu CV
                </button>
              </div>
            </div>

            {/* Decorative AI Card Area */}
            <div className="relative flex justify-center items-center">
              <FloatingCVCard />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-xl bg-surface-container-low w-full">
          <div className="max-w-[1280px] mx-auto px-xl lg:px-gutter">
            <div className="text-center mb-lg space-y-xs">
              <h2 className="font-headline-xl text-headline-xl text-primary font-bold">Tính năng đột phá từ AI</h2>
              <p className="font-body-md text-body-md text-secondary max-w-2xl mx-auto">
                Quy trình tạo CV truyền thống đã lỗi thời. Hãy để AI đồng hành cùng bạn trên con đường sự nghiệp với bộ công cụ thông minh nhất.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                <div className="w-12 h-12 rounded-lg ai-gradient-bg flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-primary">edit_note</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Tạo CV Thông minh</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Xây dựng CV chuyên nghiệp dựa trên thông tin cá nhân, JD và đặc thù của từng công ty.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                <div className="w-12 h-12 rounded-lg bg-tertiary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-tertiary-container">psychology</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phỏng vấn mô phỏng</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Luyện tập phỏng vấn theo mục tiêu công ty, JD và văn hóa doanh nghiệp thực tế.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-secondary-container">analytics</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phân tích CV theo JD</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  So sánh chi tiết CV hiện tại với JD để tìm ra những điểm thiếu sót và cơ hội cải thiện.
                </p>
              </div>

              <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant hover:border-primary transition-all group">
                <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-on-primary-container">feedback</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary mb-sm font-bold">Phản hồi & Phân tích</h3>
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
                <h2 className="font-headline-xl text-headline-xl text-primary font-bold">Kho mẫu CV hiện đại</h2>
                <p className la="font-body-md text-body-md text-secondary mt-xs">Hơn 50+ mẫu thiết kế chuẩn ngành nghề, phong cách đa dạng.</p>
              </div>
              <a className="text-primary font-label-md text-label-md flex items-center gap-xs hover:underline" href="#">
                Khám phá tất cả mẫu
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-outline-variant mb-sm transition-transform group-hover:-translate-y-2">
                  <img className="w-full h-full object-cover" alt="Minimalist Professional" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnztw7pWaIHplQXdQpl0WElpnDUIwtrO0HUTY1burywRcY4gFpHtFXNhhdmsg14VKvJ7bZjE7RLZjEUfVoZ9d3-sCSw7L1CwGQiRxWoxA2P1gYtqZ1sAQSP3f8OQsfaHCtBlSJ4MDRe6tzC_R00tjdITR1EOfNCuiDo92z6TVPiubwtBwIfNYLgJgIysyy_r5Crgv8g9UkY4AZQZoGe8dyY-6lpZ71DENl19woqs9AV0f4G3N3NLq9P1qzCEgYhsIDmTVAL3SE2Rc"/>
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-primary px-sm py-xs rounded-lg font-label-md text-label-md shadow-lg">Sử dụng mẫu này</button>
                  </div>
                </div>
                <h4 className="font-label-md text-label-md text-primary text-center">Minimalist Professional</h4>
              </div>

              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-outline-variant mb-sm transition-transform group-hover:-translate-y-2">
                  <img className="w-full h-full object-cover" alt="Creative Tech" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMmvOaYMR_XdWl8vIGCH5TW-FKlrgc0WvIm8WC8Db0sq3iwJ_XCRqqyiPfSj2yoHqGI0OaJCQeDeQrGDvQg6Wr2BxsA1qO2YfysUSJyW laT9S" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-primary px-sm py-xs rounded-lg font-label-md text-label-md shadow-lg">Sử dụng mẫu này</button>
                  </div>
                </div>
                <h4 className="font-label-md text-label-md text-primary text-center">Creative Tech</h4>
              </div>

              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-outline-variant mb-sm transition-transform group-hover:-translate-y-2">
                  <img className="w-full h-full object-cover" alt="Executive Classic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAs_5PzbzuVEZqDiBO2qO4bzRtO0Fz43UKmuYkaMtZ9Tr1nAnhc4Jo5WAht7YhKfs_65cKIyBg2MzASW_oKkjUpMNmJXDyTb0wdcFDZ39pZh1brHAYRUSKI2oZSb97Z9e9npP0xp3Xe6ES0n2N laT9S" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-primary px-sm py-xs rounded-lg font-label-md text-label-md shadow-lg">Sử dụng mẫu này</button>
                  </div>
                </div>
                <h4 className="font-label-md text-label-md text-primary text-center">Executive Classic</h4>
              </div>

              <div className="group cursor-pointer">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border border-outline-variant mb-sm transition-transform group-hover:-translate-y-2">
                  <img className="w-full h-full object-cover" alt="Modern Artist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDC--k_r2blsNESwrv3YcvgPBXQjnnLlxlEbC0VKI4-zHB6Sk_an402Cw5AaOVe1t1jCQeM0pllhMwe0U4_F7iWuGRuYQ0s3ze9AhZ2o1TBxj9nwR-tf2L2vPVveKYa5xg_RSh_iGJPUqYIc76IvoBwb_kXYeckbS7lju09 laT9S" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="bg-white text-primary px-sm py-xs rounded-lg font-label-md text-label-md shadow-lg">Sử dụng mẫu này</button>
                  </div>
                </div>
                <h4 className="font-label-md text-label-md text-primary text-center">Modern Artist</h4>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-xl px-xl lg:px-gutter max-w-[1280px] mx-auto w-full">
          <div className="ai-gradient-bg rounded-[2rem] p-lg md:p-xl flex flex-col items-center text-center gap-md relative overflow-hidden ai-glow">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-container/30 rounded-full blur-3 laT9S rounded-full blur-3xl -ml-32 -mb-32"></div>
            <h2 className="font-display-lg text-headline-xl text-on-primary max-w-2xl relative z-10 font-bold">
              Sẵn sàng để sở hữu công việc mơ ước?
            </h2>
            <p className="font-body-lg text-body-lg text-on-primary/80 max-w-2xl relative z-10">
              Gia nhập cộng đồng 100,000+ chuyên gia đang nâng tầm sự nghiệp cùng Smartfolio AI.
            </p>
            <button className="bg-white text-primary px-xl py-sm rounded-lg font-title-md text-title-md relative z-10 transition-all hover:bg-surface-container-low hover:shadow-xl active:scale-95 font-semibold">
              Bắt đầu hoàn toàn miễn phí
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
