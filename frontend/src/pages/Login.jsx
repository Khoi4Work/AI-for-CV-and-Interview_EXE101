import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/PublicHeader';
import { Footer } from '../components/layout/Footer';

export default function Login({ onLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin();
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-surface">
      <Header />
      <main className="flex-grow flex items-center justify-center py-xl px-sm relative overflow-hidden w-full">
        {/* Atmospheric Ambient Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-container rounded-full blur-[100px]"></div>
        </div>

        {/* Login Card */}
        <div className="glass-panel w-full max-w-[480px] p-lg md:p-xl rounded-xl custom-shadow border border-outline-variant relative z-10">
          <div className="text-center mb-lg">
            <h1 className="font-display-lg text-[36px] leading-[1.2] text-primary mb-xs font-extrabold tracking-tight">Đăng nhập</h1>
            <p className="font-body-md text-body-md text-secondary">Chào mừng bạn quay trở lại</p>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-sm mb-lg">
            <button className="flex items-center justify-center gap-xs border border-outline-variant rounded-lg py-sm font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200">
              <img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCM5yTkcE6Hy-CM8aXFgvhREOfAy1n593dsBvyU_vG4slmlZRmTT9oQxg5Gn5qt2C6qAJpklxVIcrzJPGTAg-HrzKjoQ-GJdFtyMBOLxEHANCEYcXKfwx9nefPjG-xiID4DQ3ttnFtfqTE4SKBySCHL_IlLvL0BCdsYnDLarROfkQoU43nuAUIO_IMgy0zRm6ciU1HP7eJJ2FUQnfE6qw4r6dKEB4L-IoeRQHiKHSUMXsq1cGbw5XQrZnV1PtWqX8OAK8fR0iI5xxU"/>
              Google
            </button>
            <button className="flex items-center justify-center gap-xs border border-outline-variant rounded-lg py-sm font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200">
              <span className="material-symbols-outlined text-[#1877F2]" style={{ fontVariationSettings: "'FILL' 1" }}>face_nod</span>
              Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-lg">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant"></div>
            </div>
            <span className="relative px-sm bg-surface-container-lowest font-label-sm text-label-sm text-outline tracking-widest uppercase">Hoặc sử dụng Email</span>
          </div>

          {/* Login Form */}
          <form className="space-y-md" onSubmit={handleLogin}>
            <div className="space-y-xs">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">Email của bạn</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input required className="w-full pl-[48px] pr-sm py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest transition-all outline-none text-body-md" id="email" placeholder="email@example.com" type="email"/>
              </div>
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Mật khẩu</label>
                <Link className="font-label-sm text-label-sm text-primary hover:underline" to="#">Quên mật khẩu?</Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                <input required className="w-full pl-[48px] pr-[48px] py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest transition-all outline-none text-body-md" id="password" placeholder="••••••••" type={showPassword ? "text" : "password"}/>
                <button
                  className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-xs">
              <input className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary" id="remember" type="checkbox"/>
              <label className="font-label-md text-label-md text-secondary select-none" htmlFor="remember">Ghi nhớ đăng nhập</label>
            </div>

            <button className="w-full bg-primary text-on-primary py-sm rounded-lg font-title-md text-[18px] font-semibold flex items-center justify-center gap-xs hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_4px_12px_rgba(0,80,203,0.2)] mt-sm" type="submit">
              Đăng nhập
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="mt-lg text-center">
            <p className="font-body-md text-body-md text-secondary">
              Chưa có tài khoản?{' '}
              <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4" to="/register">Đăng ký ngay</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
