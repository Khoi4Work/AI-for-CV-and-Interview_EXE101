import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Footer } from '../../../components/layout/Footer.jsx';
import GuestHeader from "../../../components/layout/GuestHeader.jsx";
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import apiClient, { getApiErrorMessage } from '../../../service/apiClient.js';
import { useApp } from "../contexts/AppContext.jsx";

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useApp();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');

        setLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/auth/forgot-password', { email });

            if (response.data?.result || response.status === 200) {
                showToast('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.', 'success');
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

                {/* Forgot Password Card */}
                <div className="glass-panel w-full max-w-[480px] p-lg md:p-xl rounded-xl custom-shadow border border-outline-variant relative z-10">
                    <div className="text-center mb-lg">
                        <h1 className="font-display-lg text-[36px] leading-[1.2] text-primary mb-xs font-extrabold tracking-tight">Quên mật khẩu</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">Nhập email để nhận liên kết đặt lại mật khẩu</p>
                    </div>

                    {error && (
                        <div role="alert" className="error-alert mb-md p-sm rounded-lg bg-red-100 text-red-600 text-body-sm font-medium border border-red-200">
                            {error}
                        </div>
                    )}

                    <form className="space-y-md" onSubmit={handleSubmit}>
                        <div className="space-y-xs">
                            <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">Email của bạn</label>
                            <div className="relative group">
                                <Mail className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors"/>
                                <input required
                                       name="email"
                                       className="w-full pl-[48px] pr-sm py-sm rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary-fixed bg-surface-container-lowest transition-all outline-none text-body-md"
                                       id="email" placeholder="email@example.com" type="email"/>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className={`w-full bg-primary text-on-primary py-sm rounded-lg font-title-md text-[18px] font-semibold flex items-center justify-center gap-xs hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 mt-sm cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            type="submit">
                            {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                            {!loading && <ArrowRight className="w-5 h-5"/>}
                        </button>
                    </form>

                    <div className="mt-lg text-center">
                        <Link to="/login" className="inline-flex items-center gap-xs text-primary font-semibold hover:underline decoration-2 underline-offset-4 transition-colors">
                            <ArrowLeft className="w-4 h-4"/>
                            Quay lại Đăng nhập
                        </Link>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
}
