import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import GuestHeader  from '../../../components/layout/GuestHeader.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import { User, Mail, Lock, ShieldCheck, ArrowRight, LoaderCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import apiClient, { getApiErrorMessage } from '../../../services/apiClient.js';
import { GoogleLogin } from '@react-oauth/google';
import LoginLoading from '../components/LoginLoading.jsx';
import { setAnalyticsEligibility, trackEvent } from '../../analytics/services/analyticsClient.js';
import { categorizeAnalyticsError } from '../../analytics/utils/sanitizeAnalytics.js';
import AuthJourneyPanel from '../components/AuthJourneyPanel.jsx';
import '../components/auth-experience.css';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleLogin, isLoggedIn } = useAuth();
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [emailDraft, setEmailDraft] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const loginInProgress = useRef(false);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loginInProgress.current) return;
    loginInProgress.current = true;
    setRegistering(true);
    setError(null);
    const formData = new FormData(e.target);
    const data = {
      displayName: formData.get('fullName'),
      email: formData.get('email').trim(),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    };

    try {
      await apiClient.post('/auth/accounts', data, { publicRequest: true, anonymousRequest: true });
      trackEvent('registration_submitted', { method: 'email' });
      showToast('Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực.', 'success');
      navigate('/check-email', { state: { email: data.email, registeredAt: Date.now(), from: location.state?.from } });
    } catch (err) {
      trackEvent('feature_error', { feature: 'registration', error_category: categorizeAnalyticsError(err) });
      const msg = getApiErrorMessage(err);
      showToast(msg, 'error');
      setError(msg);
    } finally {
      loginInProgress.current = false;
      setRegistering(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (loginInProgress.current) return;
    loginInProgress.current = true;
    setLoading(true);
    setLoginSuccess(false);
    setError(null);
    try {
      const idToken = credentialResponse.credential;
      const response = await apiClient.post(`/auth/oauth/google`, {
        token: idToken
      }, { publicRequest: true, anonymousRequest: true });
      const tokens = response.data?.result || response.data?.data || {};
      if (!tokens.accessToken) throw new Error('Không nhận được thông tin đăng nhập');
      const authenticatedProfile = await handleLogin(null, tokens);
      setLoginSuccess(true);
      const analyticsExcluded = String(authenticatedProfile?.role || '').toUpperCase() === 'ADMIN' || authenticatedProfile?.analyticsExcluded === true;
      setAnalyticsEligibility(!analyticsExcluded);
      if (!analyticsExcluded) {
        trackEvent('login', { method: 'google' });
      }

      navigate('/home');
    } catch (err) {
      trackEvent('feature_error', { feature: 'login', error_category: categorizeAnalyticsError(err) });
      setLoginSuccess(false);
      setLoading(false);
      loginInProgress.current = false;
      setError(getApiErrorMessage(err));
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  if (isLoggedIn) return <Navigate to="/home" replace />;

  return (
    <>
    {loading && <LoginLoading success={loginSuccess} />}
    <div inert={loading || registering} aria-busy={loading || registering} className="auth-page auth-page--register flex flex-col min-h-screen w-full page-enter">
      <GuestHeader />
      <main className="auth-page__main">
        <div className="auth-page__layout">
          <AuthJourneyPanel mode="register" />
          <div className="flex justify-center">
            <div className="auth-card p-lg md:p-xl">
              <div className="mb-lg">
                <h2 className="font-headline-lg text-headline-lg font-bold leading-tight text-primary mb-base">Bắt đầu ngay</h2>
                <p className="font-body-md text-on-surface-variant">Tạo tài khoản Smartfolio để trải nghiệm</p>
              </div>

              <form className="space-y-md" onSubmit={handleRegister}>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block">Họ và tên</label>
                  <div className="relative group">
                    <User className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input
                      required
                      name="fullName"
                      className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-surface-container focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface placeholder:text-outline/50 text-body-md"
                      placeholder="Nguyễn Văn A"
                      type="text"
                    />
                  </div>
                </div>

                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant block">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                    <input
                      required
                      name="email"
                      onChange={(event) => setEmailDraft(event.target.value)}
                      className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-surface-container focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface placeholder:text-outline/50 text-body-md"
                      placeholder="example@gmail.com"
                      type="email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block">Mật khẩu</label>
                    <div className="relative group">
                      <Lock className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                      <input
                        required
                        name="password"
                        className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-surface-container focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface placeholder:text-outline/50 text-body-md"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant block">Xác nhận mật khẩu</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-sm top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                      <input
                        required
                        name="confirmPassword"
                        className="w-full pl-[48px] pr-md py-sm rounded-lg border border-outline-variant bg-surface-container focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-on-surface placeholder:text-outline/50 text-body-md"
                        placeholder="••••••••"
                        type="password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-xs py-base">
                  <input
                    required
                    className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary transition-all cursor-pointer"
                    id="terms"
                    type="checkbox"
                  />
                  <label className="font-body-sm text-body-sm text-on-surface-variant flex items-center flex-wrap gap-1" htmlFor="terms">
                    Tôi đồng ý với các <Link className="text-primary font-medium hover:underline" to="#">Điều khoản & Điều kiện</Link>
                  </label>
                </div>

                <button
                  disabled={registering}
                  aria-busy={registering}
                  className="w-full ai-gradient text-on-primary py-sm rounded-lg font-title-md text-body-lg font-semibold flex items-center justify-center gap-xs hover:shadow-lg transition-all active:scale-[0.98] group"
                  type="submit"
                >
                  {registering && <LoaderCircle className="w-5 h-5 animate-spin" aria-hidden="true" />}
                  {registering ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                  {!registering && <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
                </button>
              </form>

              {error && (
                <div role="alert" className="error-alert mt-md p-sm rounded-lg bg-red-100 text-red-600 text-body-sm font-medium border border-red-200">
                  {error}
                </div>
              )}
              <p className="mt-md text-center text-sm text-on-surface-variant">
                Chưa nhận được email? <Link to="/check-email" state={{ email: emailDraft, from: location.state?.from }} className="text-primary font-medium hover:underline">Gửi lại email xác thực</Link>
              </p>

              <div className="mt-lg text-center">
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Đã có tài khoản? <Link className="text-primary font-bold hover:underline" to="/login">Đăng nhập</Link>
                </p>
              </div>

              <div className="relative flex items-center gap-md my-lg">
                <div className="flex-grow border-t border-outline-variant"></div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Hoặc tiếp tục với</span>
                <div className="flex-grow border-t border-outline-variant"></div>
              </div>

              <div className="grid grid-cols-1 gap-md">
                <div className="flex min-h-[44px] flex-col items-center justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap={true}
                    use_fedcm_for_prompt={false}
                    theme="outline"
                    size="high"
                    text="signup_with"
                    locale="vi"
                    shape="rectangular"
                  />
                  {loading && <span className="mt-2 text-xs text-on-surface-variant" role="status">Đang đăng nhập...</span>}
                </div>
                {/* Facebook login chưa được triển khai.
                <button
                  onClick={() => setError('Only Google login is supported at the moment')}
                  className="flex items-center justify-center gap-xs py-sm border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-all text-on-surface-variant cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                  Facebook
                </button>
                */}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}
