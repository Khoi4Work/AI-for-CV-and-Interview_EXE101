import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/PublicHeader';
import { Footer } from '../components/layout/Footer';

export default function Register() {
  const panelRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);
  const glassRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const handleMouseMove = (e) => {
      const { left, top, width, height } = panel.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      if (iconRef.current) iconRef.current.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
      if (textRef.current) textRef.current.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      if (glassRef.current) glassRef.current.style.transform = `translate(${x * -20}px, ${y * -20}px) rotate(${x * 5 - 3}deg)`;
    };

    const handleMouseLeave = () => {
      if (iconRef.current) iconRef.current.style.transform = `translate(0, 0)`;
      if (textRef.current) textRef.current.style.transform = `translate(0, 0)`;
      if (glassRef.current) glassRef.current.style.transform = `translate(0, 0) rotate(-3deg)`;
    };

    panel.addEventListener('mousemove', handleMouseMove);
    panel.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      panel.removeEventListener('mousemove', handleMouseMove);
      panel.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center py-xl px-margin-mobile md:px-gutter w-full">
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-lg items-center">

          {/* Left Side: Branding/Value Prop */}
          <div ref={panelRef} className="hidden md:flex md:col-span-6 relative min-h-[600px] rounded-[32px] overflow-hidden ai-gradient p-lg lg:p-xl flex-col justify-end text-white">
            <div className="absolute top-0 right-0 p-lg opacity-20 transition-transform duration-300 ease-out" ref={iconRef}>
              <span className="material-symbols-outlined text-[200px]">bubble_chart</span>
            </div>

            <div className="relative z-10 transition-transform duration-300 ease-out" ref={textRef}>
              <h1 className="font-headline-xl text-headline-xl font-bold leading-tight mb-md">Nâng tầm sự nghiệp<br/>cùng Smartfolio AI</h1>
              <p className="font-body-lg text-body-lg opacity-90 ">
                Tạo CV chuyên nghiệp chỉ trong vài phút với sự hỗ trợ từ trí tuệ nhân tạo hàng đầu.
              </p>
            </div>

            {/* Floating Suggestion Preview */}
            <div ref={glassRef} className="absolute top-20 left-12 glass-panel p-md rounded-xl  custom-shadow transform -rotate-3 transition-transform duration-300 ease-out">
              <div className="flex items-center gap-xs mb-xs">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest font-bold">AI Suggestion</span>
              </div>
              <p className="text-on-surface text-body-sm italic">"Hãy nhấn mạnh kỹ năng lãnh đạo của bạn trong phần kinh nghiệm tại tập đoàn X..."</p>
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="md:col-span-6 flex justify-center">
            <div className="bg-surface-container-lowest p-lg md:p-xl rounded-[24px] w-full  custom-shadow">
              <div className="mb-lg">
                <h2 className="font-headline-xl text-headline-xl font-bold leading-tight text-primary mb-base">Bắt đầu ngay</h2>
                <p className="font-body-md text-secondary">Tạo tài khoản Smartfolio để trải nghiệm</p>
              </div>

              <form className="space-y-md" onSubmit={handleRegister}>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block">Họ và tên</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                    <input required className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md" placeholder="Nguyễn Văn A" type="text"/>
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block">Email</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                    <input required className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md" placeholder="example@gmail.com" type="email"/>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block">Mật khẩu</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                      <input required className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md" placeholder="••••••••" type="password"/>
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block">Xác nhận mật khẩu</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">verified_user</span>
                      <input required className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-body-md" placeholder="••••••••" type="password"/>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-xs py-base">
                  <input required className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary transition-all cursor-pointer" id="terms" type="checkbox"/>
                  <label className="font-body-sm text-body-sm text-on-surface-variant flex items-center flex-wrap gap-1" htmlFor="terms">
                    Tôi đồng ý với các <Link className="text-primary font-medium hover:underline" to="#">Điều khoản & Điều kiện</Link>
                  </label>
                </div>

                <button className="w-full ai-gradient text-on-primary py-sm rounded-lg font-title-md text-body-lg font-semibold flex items-center justify-center gap-xs hover:shadow-lg transition-all active:scale-[0.98]" type="submit">
                  Đăng ký
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </form>

              <div className="mt-lg text-center">
                <p className="font-body-sm text-body-sm text-secondary">
                  Đã có tài khoản? <Link className="text-primary font-bold hover:underline" to="/login">Đăng nhập</Link>
                </p>
              </div>

              <div className="relative flex items-center gap-md my-lg">
                <div className="flex-grow border-t border-outline-variant"></div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Hoặc tiếp tục với</span>
                <div className="flex-grow border-t border-outline-variant"></div>
              </div>

              <div className="grid grid-cols-2 gap-md">
                <button className="flex items-center justify-center gap-xs py-sm border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-all text-on-surface-variant">
                  <img alt="Google Logo" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBtUB99RY0vRaEyxadKa5BDeccU6 laT9S" />
                  Google
                </button>
                <button className="flex items-center justify-center gap-xs py-sm border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-all text-on-surface-variant">
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
