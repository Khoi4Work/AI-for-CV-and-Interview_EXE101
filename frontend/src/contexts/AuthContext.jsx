import React, { createContext, useState, useContext } from 'react';
import { INITIAL_ACTIVITY_LOGS, INITIAL_DEVICES, INITIAL_SECURITY_LOGS } from '../constant/SettingProfile';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'User',
    email: 'email@example.com',
    phone: '0987654321',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    profession: 'Software Engineer',
    linkedin: 'https://linkedin.com/in/user-example',
    portfolio: 'https://myportfolio.com',
    github: 'https://github.com/user-example',
    membershipType: 'Premium',
    memberSince: 'Thành viên từ 2026',
    favorites: [], // List of template IDs
  });

  // Centralized state for history and security
  const [activityLogs, setActivityLogs] = useState(INITIAL_ACTIVITY_LOGS);

  const [devices, setDevices] = useState(INITIAL_DEVICES);

  const [securityLogs, setSecurityLogs] = useState(INITIAL_SECURITY_LOGS);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const toggleFavorite = (templateId) => {
    setProfile((prev) => {
      const isFavorite = prev.favorites.includes(templateId);
      return {
        ...prev,
        favorites: isFavorite
          ? prev.favorites.filter(id => id !== templateId)
          : [...prev.favorites, templateId],
      };
    });
  };

  const handleProfileUpdate = (updated) => {
    setProfile(updated);
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

  // --- New Centralized Handlers ---

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
      setIsLoggedIn,
      is2faEnabled,
      profile,
      handleLogin,
      handleLogout,
      toggleFavorite,
      handleProfileUpdate,
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
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
