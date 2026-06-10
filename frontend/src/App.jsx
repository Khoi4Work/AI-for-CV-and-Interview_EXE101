import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PersonalInfoPage from './pages/PersonalInfoPage';
import SecurityPage from './pages/SecurityPage';
import PricingPage from './pages/PricingPage';
import MyCVsPage from './pages/MyCVsPage';
import HistoryPage from './pages/HistoryPage';
import ProtectedRoute from './components/ProtectedRoute';

const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [is2faEnabled, setIs2faEnabled] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(2);
  const [toast, setToast] = useState(null);
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
  });
  const [cvs, setCvs] = useState([
    { id: 'cv-1', title: 'Software Engineer 2024', status: 'Hoàn thành', updatedAt: '2 giờ trước', score: 92 },
    { id: 'cv-2', title: 'Product Manager Senior', status: 'AI Optimized', updatedAt: 'Hôm qua', matchPercentage: 85 },
    { id: 'cv-3', title: 'Marketing Specialist', status: 'Bản nháp', updatedAt: '3 ngày trước' },
    { id: 'cv-4', title: 'Data Analyst Resume', status: 'Hoàn thành', updatedAt: '1 tuần trước' },
  ]);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 100000);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    showToast('Chào mừng quay trở lại với Smartfolio!', 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('Đã đăng xuất khỏi tài khoản của bạn.', 'info');
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

  const handleAddCV = (newCV) => {
    setCvs((prev) => [newCV, ...prev]);
  };

  const handleRemoveCV = (id) => {
    const target = cvs.find((c) => c.id === id);
    setCvs((prev) => prev.filter((cv) => cv.id !== id));
    if (target) {
      showToast(`Đã xoá hồ sơ: "${target.title}"`, 'info');
    }
  };

  const handleNotificationRead = () => {
    setNotificationsCount(0);
    showToast('Đã đánh dấu đọc tất cả thông báo.', 'success');
  };

  return (
    <Router>
      <div className="relative">
        <style>{animationStyles}</style>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!isLoggedIn ? <LandingPage /> : <Navigate to="/home" replace />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />

          {/* Authenticated Home - Standalone Page (No Sidebar/Dashboard Header) */}
          <Route path="/home" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Home
                onLogout={handleLogout}
                onShowNotification={showToast}
              />
            </ProtectedRoute>
          } />

          {/* Protected Routes with Dashboard Layout */}
          <Route path="/*" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
                <Sidebar
                  onLogout={handleLogout}
                  is2faEnabled={is2faEnabled}
                />

                <div className="flex-1 flex flex-col min-w-0">
                  <Header
                    profile={profile}
                    notificationsCount={notificationsCount}
                    onHelpClick={() => showToast('Trung tâm trợ giúp Smartfolio đang tải dữ liệu.', 'info')}
                  />

                  <main className="flex-1 p-8 overflow-y-auto max-w-5xl w-full mx-auto">
                    <Routes>
                      <Route path="personal-info" element={
                        <PersonalInfoPage
                          profile={profile}
                          is2faEnabled={is2faEnabled}
                          cvs={cvs}
                          onProfileUpdate={handleProfileUpdate}
                          on2faToggle={handle2faToggle}
                          onShowNotification={showToast}
                        />
                      } />
                      <Route path="security" element={
                        <SecurityPage
                          is2faEnabled={is2faEnabled}
                          on2faToggle={handle2faToggle}
                          onShowNotification={showToast}
                        />
                      } />
                      <Route path="pricing" element={
                        <PricingPage
                          profile={profile}
                          onUpgrade={handleUpgradePlan}
                          onShowNotification={showToast}
                        />
                      } />
                      <Route path="my-cvs" element={
                        <MyCVsPage
                          cvs={cvs}
                          onAddCV={handleAddCV}
                          onRemoveCV={handleRemoveCV}
                          onShowNotification={showToast}
                        />
                      } />
                      <Route path="history" element={
                        <HistoryPage onShowNotification={showToast} />
                      } />
                      {/* Redirect any unknown protected route to home */}
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>

        {toast && (
          <div id="app-toast-alert" className="fixed bottom-6 right-6 z-50 bg-[#0b3c8f] text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-900/40 flex items-center gap-3 w-fit animate-fade-in select-none">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
              {toast.type === 'success' ? '✓' : 'ℹ'}
            </div>
            <span className="text-sm font-medium leading-normal whitespace-normal flex-1">
              {toast.message}
            </span>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
