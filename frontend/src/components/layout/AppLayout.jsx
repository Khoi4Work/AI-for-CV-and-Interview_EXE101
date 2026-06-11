import React from 'react';
import {Routes, Route, Navigate, useLocation} from 'react-router-dom';
import Sidebar from '../user/Sidebar.jsx';
import Header from '../user/Header.jsx';
import ProtectedRoute from '../ProtectedRoute.jsx';
import LandingPage from '../../pages/base/LandingPage.jsx';
import Home from '../../pages/base/Home.jsx';
import Login from '../../pages/auth/Login.jsx';
import Register from '../../pages/auth/Register.jsx';
import PersonalInfoPage from '../../pages/user/PersonalInfoPage.jsx';
import SecurityPage from '../../pages/user/SecurityPage.jsx';
import PricingPage from '../../pages/user/PricingPage.jsx';
import MyCVsPage from '../../pages/user/MyCVsPage.jsx';
import HistoryPage from '../../pages/user/HistoryPage.jsx';
import {useAuth} from '../../contexts/AuthContext';
import {useApp} from '../../contexts/AppContext';
import TemplateList from "../../pages/cv-template/TemplateList.jsx";
import TemplateDetail from "../../pages/cv-template/TemplateDetail.jsx";
import CVOptimizer from "../../pages/cv-template/CVOptimizer.jsx";
import CVBuilder from "../../pages/cv-template/CVBuilder.jsx";

const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
`;

export default function AppLayout() {
    const {isLoggedIn, profile} = useAuth();
    const {notificationsCount, showToast, toast} = useApp();

    const location = useLocation();

    return (
        <div className="relative">
            <style>{animationStyles}</style>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={!isLoggedIn ? <LandingPage/> : <Navigate to="/home" replace/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/register" element={<Register/>}/>

                {/* Authenticated Home - Standalone Page */}
                <Route path="/home" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <Home/>
                    </ProtectedRoute>
                }/>

                <Route path="/template-list" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <TemplateList/>
                    </ProtectedRoute>}
                />
                <Route path="/template/:id" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <TemplateDetail/>
                    </ProtectedRoute>}
                />
                <Route path="/optimize" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <CVOptimizer/>
                    </ProtectedRoute>}
                />
                <Route path="/builder" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <CVBuilder/>
                    </ProtectedRoute>}
                />

                {/* Protected Routes with Dashboard Layout */}
                <Route path="/*" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
                            <Sidebar/>
                            <div className="flex-1 flex flex-col min-w-0">
                                <Header
                                    profile={profile}
                                    notificationsCount={notificationsCount}
                                    onHelpClick={() => showToast('Trung tâm trợ giúp Smartfolio đang tải dữ liệu.', 'info')}
                                />
                                <main className="flex-1 p-8 overflow-y-auto max-w-5xl w-full mx-auto">
                                    <Routes>
                                        <Route path="personal-info" element={<PersonalInfoPage/>}/>
                                        <Route path="security" element={<SecurityPage/>}/>
                                        <Route path="pricing" element={<PricingPage/>}/>
                                        <Route path="my-cvs" element={<MyCVsPage/>}/>
                                        <Route path="history" element={<HistoryPage/>}/>
                                        <Route path="*" element={<Navigate to="/home" replace/>}/>
                                    </Routes>
                                </main>
                            </div>
                        </div>
                    </ProtectedRoute>
                }/>

            </Routes>

            {toast && (
                <div id="app-toast-alert"
                     className="fixed bottom-6 right-6 z-50 bg-[#0b3c8f] text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-900/40 flex items-center gap-3 w-fit animate-fade-in select-none">
                    <div
                        className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0">
                        {toast.type === 'success' ? '✓' : 'ℹ'}
                    </div>
                    <span className="text-sm font-medium leading-normal whitespace-normal flex-1">
            {toast.message}
          </span>
                </div>
            )}
        </div>
    );
}
