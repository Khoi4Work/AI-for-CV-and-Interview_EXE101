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
import InterviewLanding from '../../pages/interview/InterviewLanding.jsx';
import JobSelection from '../../pages/interview/JobSelection.jsx';
import CVStatus from '../../pages/interview/CVStatus.jsx';
import ExperienceLevel from '../../pages/interview/ExperienceLevel.jsx';
import CareerGoal from '../../pages/interview/CareerGoal.jsx';
import InterviewSetup from '../../pages/interview/InterviewSetup.jsx';
import {useAuth} from '../../contexts/AuthContext';
import {useApp} from '../../contexts/AppContext';
import TemplateList from "../../pages/cv-template/TemplateList.jsx";
import TemplateDetail from "../../pages/cv-template/TemplateDetail.jsx";
import CVOptimizer from "../../pages/cv-template/CVOptimizer.jsx";
import CVBuilder from "../../pages/cv-template/CVBuilder.jsx";
import {AudioSetup} from "../../pages/interview/AudioSetup.jsx";
import {InterviewRoom} from "../../pages/interview/InterviewRoom.jsx";
import {VideoReview} from "../../pages/interview/VideoReview.jsx";
import {VideoSetup} from "../../pages/interview/VideoSetup.jsx";
import {CvAnalysis} from "../../pages/interview/CvAnalysis.jsx";
import {InterviewResults} from "../../pages/interview/InterviewResult.jsx";
import CVEditor from "../../pages/cv-template/CVEditor.jsx";
import FeedbackWidget from "../feedback/FeedbackWidget.jsx";

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
                <Route path="/interview" element={<InterviewLanding/>}/>
                <Route path={"/templates"} element={<TemplateList/>}/>
                <Route path={"/*"} element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <Routes>
                            <Route path={"home"} element={<Home/>}/>

                            <Route path={"template/:id"} element={<TemplateDetail/>}/>
                            <Route path="optimizer" element={<CVOptimizer/>}/>
                            <Route path={"builder"} element={<CVBuilder/>}/>
                            <Route path="analysis" element={<CvAnalysis/>}/>
                            <Route path={"editor"} element={<CVEditor/>}/>

                            <Route path="audio-setup" element={<AudioSetup/>}/>
                            <Route path="video-setup" element={<VideoSetup/>}/>
                            <Route path="interview/room" element={<InterviewRoom/>}/>
                            <Route path="interview/review" element={<VideoReview/>}/>
                            <Route path="interview/result" element={<InterviewResults/>}/>
                            <Route path="interview/job-selection" element={<JobSelection/>}/>
                            <Route path="interview/cv-status" element={<CVStatus/>}/>
                            <Route path="interview/experience-level" element={<ExperienceLevel/>}/>
                            <Route path="interview/career-goal" element={<CareerGoal/>}/>
                            <Route path="interview/setup" element={<InterviewSetup/>}/>

                            {/* Protected Routes with Dashboard Layout */}
                            <Route path="*" element={
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
                                                </Routes>
                                            </main>
                                        </div>
                                    </div>
                                </ProtectedRoute>
                            }/>
                        </Routes>
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

            {/* Global feedback widget — available on every page */}
            <FeedbackWidget />
        </div>
    );
}
