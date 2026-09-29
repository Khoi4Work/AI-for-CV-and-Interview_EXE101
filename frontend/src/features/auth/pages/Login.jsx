import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Footer } from '../../../components/layout/Footer.jsx';
import GuestHeader from "../../../components/layout/GuestHeader.jsx";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from "../contexts/AuthContext.jsx";
import apiClient, { getApiErrorMessage } from '../../../service/apiClient.js';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { handleLogin } = useAuth();

    const handleIsLoggedIn = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/auth/tokens', { email, password });
            console.log('Login response:', response.data);

            // BE returns data in 'result' field based on logs
            const tokens = response.data?.result || response.data?.data || {};
            const { accessToken, refreshToken } = tokens;

            console.log('Extracted tokens:', { accessToken, refreshToken });

            // Assuming BE might not return full user profile in /tokens,
            // but we need some basic info or just trigger handleLogin.
            // In a real app, we'd call /auth/me here.
            handleLogin(null, { accessToken, refreshToken });

            const origin = location.state?.from?.pathname || '/home';
            navigate(origin);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError(null);
        try {
            const idToken = credentialResponse.credential;
            const response = await apiClient.post(`/auth/oauth/google`, {
                token: idToken
            });
            const tokens = response.data?.result || response.data?.data || {};
            handleLogin(null, tokens);

            const origin = location.state?.from?.pathname || '/home';
            navigate(origin);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError('Google login failed. Please try again.');
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-surface">
            <GuestHeader/>
            <main className="flex-grow flex items-center justify-center py-xl px-sm relative overflow-hidden w-full">
                {/* Atmospheric Ambient Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 overflow-hidden">
                    <div
                        className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
                    <div
                        className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-container rounded-full blur-[100px]"></div>
                </div>

                {/* Login Card */}
                <div
                    className="glass-panel w-full max-w-[480px] p-lg md:p-xl rounded-xl custom-shadow border border-outline-variant relative z-10">
                    <div className="text-center mb-lg">
                        <h1 className="font-display-lg text-[36px] leading-[1.2] text-primary mb-xs font-extrabold tracking-tight">Đăng
                            nhập</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Chào mừng bạn quay trở lại</p>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-sm mb-lg">
                        <div className="flex items-center justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap={true}
                                use_fedcm_for_prompt={false}
                                theme="outline"
                                width="100%"
                            />
                        </div>
                        <button
                            onClick={() => setError('Only Google login is supported at the moment')}
                            className="flex items-center justify-center gap-xs border border-outline-variant rounded-lg py-sm font-label-md text-label-md text-on-surface-variant bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200 cursor-pointer">
                            <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                            Facebook
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center mb-lg">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-outline-variant"></div>
                        </div>
                        <span
                            className="relative px-sm bg-surface-container-lowest font-label-sm text-label-sm text-outline tracking-widest uppercase">Hoặc sử dụng Email</span>
                    </div>

                    {error && (
                        <div className="mb-md p-sm rounded-lg bg-red-100 text-red-600 text-body-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="space-y-md" onSubmit={handleIsLoggedIn}>
                        <div className="space-y-xs">
                            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">Email
                                của bạn</label>
                            <div className="relative group">
                                <Mail
                                    className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors"/>
                                <input required
                                       name="email"
                                       className="w-full pl-[48px] pr-sm py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest transition-all outline-none text-body-md"
                                       id="email" placeholder="email@example.com" type="email"/>
                            </div>
                        </div>

                        <div className="space-y-xs">
                            <div className="flex justify-between items-center">
                                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Mật
                                    khẩu</label>
                                <Link className="font-label-sm text-label-sm text-primary hover:underline" to="#">Quên
                                    mật khẩu?</Link>
                            </div>
                            <div className="relative group">
                                <Lock
                                    className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors"/>
                                <input required
                                       name="password"
                                       className="w-full pl-[48px] pr-[48px] py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest transition-all outline-none text-body-md"
                                       id="password" placeholder="••••••••" type={showPassword ? "text" : "password"}/>
                                <button
                                    className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-xs">
                            <input className="w-5 h-5 rounded-md border-outline-variant text-primary focus:ring-primary"
                                   id="remember" type="checkbox"/>
                            <label className="font-label-md text-label-md text-on-surface-variant select-none"
                                   htmlFor="remember">Ghi nhớ đăng nhập</label>
                        </div>

                        <button
                            disabled={loading}
                            className={`w-full bg-primary text-on-primary py-sm rounded-lg font-title-md text-[18px] font-semibold flex items-center justify-center gap-xs hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-sm cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="submit">
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                            {!loading && <ArrowRight className="w-5 h-5"/>}
                        </button>
                    </form>

                    <div className="mt-lg text-center">
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Chưa có tài khoản?{' '}
                            <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4"
                                  to="/register">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
