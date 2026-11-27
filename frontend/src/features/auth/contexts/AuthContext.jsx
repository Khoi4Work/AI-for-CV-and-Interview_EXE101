import { createContext, useState, useContext, useEffect, useSyncExternalStore, useCallback } from 'react';
import apiClient from '../../../services/apiClient.js';
import { getCurrentQuota } from '../../../services/quotaService.js';
import { createAuthSession } from '../services/authSession.js';
import LogoutLoading from '../components/LogoutLoading.jsx';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const EMPTY_PROFILE = { fullName: '', email: '', phone: '', location: '', profession: '', favorites: [], membershipType: 'Free' };

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [session] = useState(() => createAuthSession(apiClient, localStorage));
  const auth = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  // Keep the current view behind the blocked logout overlay; credentials are already removed.
  const isLoggedIn = ['profile-loading', 'profile-error', 'authenticated', 'logging-out'].includes(auth.status);
  const isLoading = auth.status === 'checking';
  const sessionExpired = auth.sessionExpired === true;
  const profile = auth.profile || EMPTY_PROFILE;
  const setProfile = session.updateProfile;
  const isLoggingOut = auth.status === 'logging-out';
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);

  useEffect(() => {
    const onExpired = () => session.expire(true);
    window.addEventListener('auth:expired', onExpired);
    session.verify().catch(() => {});
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [session]);

  const handleLogin = async (_userData, tokens, method = 'email') => {
    setIsSigningIn(true);
    try { return await session.login(tokens, method); }
    finally { setIsSigningIn(false); }
  };
  const retryAuth = () => session.verify().catch(() => {});
  const handleLogout = () => session.logout(() => navigate('/', { replace: true, state: { loggedOut: true } }));

  const updateProfile = async (updatedData) => {
    const response = await apiClient.patch('/auth/profile/info', updatedData);
    const result = response.data?.data || response.data?.result || response.data;

    // Check if the result is actually a profile object or just a success message
    const isFullProfile = result && typeof result === 'object' && (result.email || result.fullName);

    if (isFullProfile) {
      setProfile(result);
      localStorage.setItem('userProfile', JSON.stringify(result));
    } else {
      // Fallback: Merge updated data with current profile to avoid losing other fields
      const newProfile = { ...profile, ...updatedData };
      setProfile(newProfile);
      localStorage.setItem('userProfile', JSON.stringify(newProfile));
    }

    return { success: true, data: isFullProfile ? result : { ...profile, ...updatedData } };
  };

  const refreshQuota = useCallback(async () => {
    const quota = await getCurrentQuota();
    if (!quota || typeof quota !== 'object') throw new Error('Không tải được thông tin quota.');

    const planLabel = (plan) => plan ? `${plan[0]}${plan.slice(1).toLowerCase()}` : undefined;
    setProfile((current) => current ? {
      ...current,
      quota,
      membershipType: planLabel(quota.cvPlan) || current.membershipType,
      interviewMembershipType: planLabel(quota.interviewPlan) || current.interviewMembershipType,
    } : current);
    return quota;
  }, [setProfile]);

  const changePassword = async (passwordData) => {
    await apiClient.patch('/auth/password', passwordData);
    return { success: true };
  };

  const toggleFavorite = (templateId) => {
    setProfile((previous) => {
      const favorites = previous.favorites || [];
      const isFavorite = favorites.includes(templateId);
      return {
        ...previous,
        favorites: isFavorite
          ? favorites.filter((id) => id !== templateId)
          : [...favorites, templateId],
      };
    });
  };

  const handle2faToggle = (enabled) => {
    setIs2faEnabled(enabled);
  };

  const handleUpgradePlan = (planType) => {
    setProfile((prev) => ({
      ...prev,
      membershipType: planType,
    }));
  };

  const addActivityLog = (log) => {
    setActivityLogs(prev => [log, ...prev]);
  };

  const removeDevice = (deviceId) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const logoutAllDevices = () => {
    setDevices(prev => prev.filter(d => d.isCurrent));
  };

  const addSecurityLog = (log) => {
    setSecurityLogs(prev => [log, ...prev]);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      isLoading,
      authStatus: auth.status,
      authorizationRole: auth.authorizationRole || auth.profile?.role || null,
      loginEvent: auth.loginEvent || null,
      sessionExpired,
      isLoggingOut,
      is2faEnabled,
      profile,
      setProfile,
      handleLogin,
      retryAuth,
      handleLogout,
      updateProfile,
      quota: profile.quota || null,
      refreshQuota,
      changePassword,
      toggleFavorite,
      handle2faToggle,
      handleUpgradePlan,
      activityLogs,
      addActivityLog,
      devices,
      removeDevice,
      logoutAllDevices,
      securityLogs,
      addSecurityLog
    }}>
      {isLoggingOut && <LogoutLoading />}
      <div inert={isLoggingOut}>
      {isLoading && !isSigningIn ? <div role="status" className="flex min-h-screen items-center justify-center bg-surface text-on-surface">Đang xác minh tài khoản…</div>
        : auth.status === 'error' ? <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface p-6 text-center text-on-surface">
          <p>{auth.error}</p>
          <button onClick={retryAuth} className="rounded-xl bg-primary px-5 py-2 text-on-primary">Thử lại</button>
          <button onClick={handleLogout} className="text-sm underline">Đăng nhập bằng tài khoản khác</button>
        </div> : <>
          {auth.status === 'profile-error' && <div role="alert" className="flex items-center justify-center gap-3 bg-surface-container-high px-4 py-2 text-sm text-on-surface">
            <span>{auth.error}</span>
            <button onClick={retryAuth} className="font-semibold underline">Thử lại</button>
          </div>}
          {children}
        </>}
      </div>
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
