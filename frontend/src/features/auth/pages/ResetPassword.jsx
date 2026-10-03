import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Footer } from '../../../components/layout/Footer.jsx';
import GuestHeader from "../../../components/layout/GuestHeader.jsx";
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import apiClient, { getApiErrorMessage } from '../../../service/apiClient.js';
import { useApp } from "../contexts/AppContext.jsx";

export default function ResetPassword() {
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useApp();

    // Extract token from URL search parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newPassword = formData.get('password');
        const confirmNewPassword = formData.get('confirmPassword');

        if (!token) {
            setError('Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/auth/reset-password', { token, newPassword });

            if (response.data?.result || response.status === 200) {
                showToast('Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập.', 'success');
                navigate('/login');
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen w-full bg-surface">
            <GuestHeader/>
            <main className="flex-grow flex items-center justify-center py-xl px-sm relative overflow-hidden w-full">
                {/* Atmospheric Ambient Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-tertiary-container rounded-full blur-[100px]"></div>
                </div>

                {/* Reset Password Card */}
                <div className="glass-panel w-full max-w-[480px] p-lg md:p-xl rounded-xl custom-shadow border border-outline-variant relative z-10">
                    <div className="text-center mb-lg">
                        <h1 className="font-display-lg text-[36px] leading-[1.2] text-primary mb-xs font-extrabold tracking-tight">Đặt lại mật khẩu</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Vui lòng nhập mật khẩu mới cho tài khoản của bạn</p>
                    </div>

                    {error && (
                        <div role="alert" className="error-alert mb-md p-sm rounded-lg bg-red-100 text-red-600 text-body-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-md" onSubmit={handleSubmit}>
                        <div className="space-y-xs">
                            <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">Mật khẩu mới</label>
                            <div className="relative group">
                                <Lock className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors"/>
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

                        <div className="space-y-xs">
                            <label className="block font-label-md text-label-md text-on-surface" htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
                            <div className="relative group">
                                <Lock className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors"/>
                                <input required
                                       name="confirmPassword"
                                       className="w-full pl-[48px] pr-[48px] py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest transition-all outline-none text-body-md"
                                       id="confirmPassword" placeholder="••••••••" type={showPassword ? "text" : "password"}/>
                                <button
                                    className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors cursor-pointer"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className={`w-full bg-primary text-on-primary py-sm rounded-lg font-title-md text-[18px] font-semibold flex items-center justify-center gap-xs hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-sm cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="submit">
                            {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                            {!loading && <ArrowRight className="w-5 h-5"/>}
                        </button>
                    </form>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
