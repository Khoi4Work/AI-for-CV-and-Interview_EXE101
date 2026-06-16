import React, { createContext, useState, useContext } from 'react';

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
    membershipType: 'Pro',
    memberSince: 'Thành viên từ 2026',
    favorites: [], // List of template IDs
  });

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
      handleUpgradePlan
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
