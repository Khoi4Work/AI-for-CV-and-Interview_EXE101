import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../../../service/apiClient.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    profession: '',
    linkedin: '',
    portfolio: '',
    github: '',
    membershipType: 'Free',
    memberSince: '',
    favorites: [], // List of template IDs
  });

  // Centralized state for history and security
  const [activityLogs, setActivityLogs] = useState([]);
  const [devices, setDevices] = useState([]);
  const [securityLogs, setSecurityLogs] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      let token = localStorage.getItem('accessToken');
      const savedProfile = localStorage.getItem('userProfile');

      if (token === 'undefined') {
        localStorage.removeItem('accessToken');
        token = null;
      }

      if (token) {
        setIsLoggedIn(true);

        // 1. Load cached profile immediately for fast UI response
        if (savedProfile) {
          try {
            setProfile(JSON.parse(savedProfile));
          } catch (e) {
            console.error('Failed to parse saved profile', e);
          }
        }

        // 2. Fetch fresh profile from Backend to ensure data is up-to-date
        try {
          const response = await apiClient.get('/auth/me');
          // Support both .data and .result patterns from Backend
          const freshProfile = response.data?.data || response.data?.result || response.data;
          if (freshProfile) {
            setProfile(freshProfile);
            localStorage.setItem('userProfile', JSON.stringify(freshProfile));
          }
        } catch (error) {
          console.error('Failed to fetch fresh profile:', error);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (userData, tokens) => {
    if (tokens && tokens.accessToken && tokens.accessToken !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      if (tokens.refreshToken && tokens.refreshToken !== 'undefined') {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }
    }

    setIsLoggedIn(true);

    if (userData) {
      setProfile(userData);
      localStorage.setItem('userProfile', JSON.stringify(userData));
    } else {
      // If no userData provided, fetch it immediately from Backend
      try {
        // Ensure the token is fully written to localStorage before calling apiClient
        // Although localStorage.setItem is synchronous, we want to be explicit.
        const response = await apiClient.get('/auth/me');
        const freshProfile = response.data?.data || response.data?.result || response.data;
        if (freshProfile) {
          setProfile(freshProfile);
          localStorage.setItem('userProfile', JSON.stringify(freshProfile));
        }
      } catch (error) {
        console.error('Failed to fetch profile after login:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiClient.delete('/auth/tokens', {
          data: { refreshToken }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
      setIsLoggedIn(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
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
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await apiClient.patch('/auth/password', passwordData);
      return { success: true };
    } catch (error) {
      throw error;
    }
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
      setIsLoggedIn,
      is2faEnabled,
      profile,
      handleLogin,
      handleLogout,
      updateProfile,
      changePassword,
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
      {!isLoading && children}
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
