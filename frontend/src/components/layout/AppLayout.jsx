import React from 'react';
import {Routes, Route, Navigate, useLocation, useNavigate} from 'react-router-dom';
import {AnimatePresence} from 'framer-motion';
import Sidebar from '../../features/user/components/Sidebar.jsx';
import Header from '../../features/user/components/Header.jsx';
import { Footer } from './Footer.jsx';
import ProtectedRoute from '../ProtectedRoute.jsx';
import LandingPage from '../../pages/LandingPage.jsx';
import Home from '../../pages/Home.jsx';
import Login from '../../features/auth/pages/Login.jsx';
import Register from '../../features/auth/pages/Register.jsx';
import PersonalInfoPage from '../../features/user/pages/PersonalInfoPage.jsx';
import SecurityPage from '../../features/user/pages/SecurityPage.jsx';
import PricingPage from '../../features/user/pages/PricingPage.jsx';
import MyCVsPage from '../../features/user/pages/MyCVsPage.jsx';
import HistoryPage from '../../features/user/pages/HistoryPage.jsx';
import InterviewLanding from '../../features/interview/pages/InterviewLanding.jsx';
import JobSelection from '../../features/interview/pages/JobSelection.jsx';
import CVStatus from '../../features/interview/pages/CVStatus.jsx';
import ExperienceLevel from '../../features/interview/pages/ExperienceLevel.jsx';
import CareerGoal from '../../features/interview/pages/CareerGoal.jsx';
import InterviewSetup from '../../features/interview/pages/InterviewSetup.jsx';
import {useAuth} from '../../features/auth/contexts/AuthContext.jsx';
import {useApp} from '../../features/auth/contexts/AppContext.jsx';
import TemplateList from "../../features/cv/pages/TemplateList.jsx";
import TemplateDetail from "../../features/cv/pages/TemplateDetail.jsx";
import CVBuilder from "../../features/cv/pages/CVBuilder.jsx";
import {AudioSetup} from "../../features/interview/pages/AudioSetup.jsx";
import {InterviewRoom} from "../../features/interview/pages/InterviewRoom.jsx";
import {VideoReview} from "../../features/interview/pages/VideoReview.jsx";
import {VideoSetup} from "../../features/interview/pages/VideoSetup.jsx";
import {CVResult} from "../../features/cv/pages/CVResult.jsx";
import {InterviewResults} from "../../features/interview/pages/InterviewResult.jsx";
import CVEditor from "../../features/cv/pages/CVEditor.jsx";
import {PaymentPage} from "../../features/payment/pages/PaymentPage.jsx";
import CVEvaluation from "../../features/cv/pages/CVEvaluation.jsx";
import CVAnalyzing from "../../features/cv/pages/CVAnalyzing.jsx";
import PageTransition from "../transitions/PageTransition.jsx";
import ScrollToTop from "../transitions/ScrollToTop.jsx";
import RouteProgressBar from "../transitions/RouteProgressBar.jsx";
import {useInterviewSession} from "../../features/interview/hooks/useInterviewSession.js";

/**
 * Guard cho InterviewRoom: cần interviewConfig (đã setup xong) + questions.
 * - Nếu thiếu interviewConfig → redirect về step 1.
 * - Nếu có config nhưng không có questions → tự generate rồi cho vào.
 */
function RoomGuard({children}) {
    const {data, generateQuestions} = useInterviewSession();
    const navigate = useNavigate();
    const configOk = !!(data.interviewConfig?.type && data.interviewConfig?.duration);
    const questionsOk = !!data.backendSessionId && Array.isArray(data.questions) && data.questions.length > 0;
    const creationAttempted = React.useRef(false);

    const createSession = React.useCallback(() => {
        if (creationAttempted.current) return;
        creationAttempted.current = true;
        generateQuestions().catch(() => {});
    }, [generateQuestions]);

    React.useEffect(() => {
        if (configOk && !questionsOk && !data.sessionError) {
            createSession();
        }
    }, [configOk, questionsOk, data.sessionError, createSession]);

    if (!configOk) return <Navigate to="/interview/job-selection" replace/>;
    if (data.sessionError && !questionsOk) return (
        <main
            role="alert"
            aria-live="assertive"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'grid',
                placeItems: 'center',
                width: '100vw',
                minHeight: '100vh',
                padding: '2rem 1rem',
                boxSizing: 'border-box',
                background: 'radial-gradient(circle at center, var(--color-interview-bg-start) 0%, var(--color-interview-bg-end) 100%)',
            }}
        >
            <section
                style={{ width: 'min(100%, 32rem)', boxSizing: 'border-box' }}
                className="error-card rounded-2xl border border-outline-variant bg-interview-card-bg p-5 text-center text-slate-900 shadow-lg sm:p-8"
            >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl font-bold text-red-700" aria-hidden="true">!</div>
                <h1 className="mb-2 text-xl font-bold text-slate-900">Không thể tạo buổi phỏng vấn</h1>
                <p className="mb-6 break-words text-sm leading-6 text-slate-700">{data.sessionError}</p>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        type="button"
                        onClick={() => { creationAttempted.current = false; createSession(); }}
                        className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-on-primary transition-colors hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >Thử lại</button>
                    <button
                        type="button"
                        onClick={() => navigate('/interview/setup')}
                        className="rounded-lg border border-slate-400 px-5 py-2.5 font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >Quay lại cấu hình</button>
                </div>
            </section>
        </main>
    );
    if (configOk && !questionsOk) return null; // đợi API tạo session xong
    return children;
}

/**
 * Guard cho InterviewResult: cần feedback đã lấy từ API.
 * - Nếu chưa có feedback → yêu cầu backend tạo feedback.
 * - Nếu thiếu questions (không từng vào room) → redirect về step 1.
 */
function ResultGuard({children}) {
    const {data, generateFeedback} = useInterviewSession();
    const hasQuestions = Array.isArray(data.questions) && data.questions.length > 0;
    const hasFeedback = !!data.feedback;
    const evaluationAttempted = React.useRef(false);
    const evaluate = React.useCallback(() => {
        if (evaluationAttempted.current) return;
        evaluationAttempted.current = true;
        generateFeedback().catch(() => {});
    }, [generateFeedback]);

    React.useEffect(() => {
        // Generate only when the user opens the result route directly.
        // Sử dụng window.location.pathname vì useLocation() có thể gây loop nếu không cẩn thận
        if (window.location.pathname === '/interview/result' && hasQuestions && !hasFeedback && !data.sessionError) {
            evaluate();
        }
    }, [hasQuestions, hasFeedback, data.sessionError, evaluate]);

    if (!hasQuestions) return <Navigate to="/interview/job-selection" replace/>;
    if (!hasFeedback && data.sessionError) return (
        <div className="min-h-screen flex items-center justify-center bg-interview-radial p-6">
            <div className="error-card rounded-xl bg-interview-card-bg p-6 text-center shadow-lg">
                <h1 className="mb-2 text-xl font-bold text-black">Không thể tải kết quả</h1>
                <p className="mb-5 text-sm text-black/70">{data.sessionError}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={() => { evaluationAttempted.current = false; evaluate(); }} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">Thử lại</button>
                    <button onClick={() => { window.location.href = '/interview/review'; }} className="rounded-lg border px-4 py-2 text-black">Quay lại</button>
                </div>
            </div>
        </div>
    );
    if (!hasFeedback) return null; // đợi API tạo kết quả
    return children;
}

function AppLayout() {
    const {isLoggedIn, profile} = useAuth();
    const {notificationsCount, showToast, toast} = useApp();
    const location = useLocation();
    const [sidebarState, setSidebarState] = React.useState({path: location.pathname, open: false});
    const isSidebarOpen = sidebarState.path === location.pathname && sidebarState.open;
    const setIsSidebarOpen = React.useCallback((open) => {
        setSidebarState({path: location.pathname, open});
    }, [location.pathname]);

    return (
        <div className="relative overflow-x-hidden">
            <ScrollToTop/>
            <RouteProgressBar/>

            {/* ── ZONE A · Public ──────────────────────────────── */}
            <Routes location={location}>
                <Route
                    path="/"
                    element={!isLoggedIn
                        ? <PageTransition key={location.pathname}><LandingPage/></PageTransition>
                        : <Navigate to="/home" replace/>}
                />
                <Route path="/login"
                       element={<PageTransition key={location.pathname}><Login/></PageTransition>}/>
                <Route path="/register"
                       element={<PageTransition key={location.pathname}><Register/></PageTransition>}/>
                <Route path="/interview"
                       element={<PageTransition key={location.pathname}><InterviewLanding/></PageTransition>}/>
                <Route path="/templates"
                       element={<PageTransition key={location.pathname}><TemplateList/></PageTransition>}/>
                <Route path="/cv-evaluation"
                       element={<PageTransition key={location.pathname}><CVEvaluation/></PageTransition>}/>

                {/* ── Protected block (Zones B + C) ───────────────── */}
                <Route path="/*" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <Routes location={location}>
                            {/* ZONE B · Dashboard (Home + 5 settings pages). */}
                            <Route
                                path="home"
                                element={
                                    <PageTransition key={location.pathname}><Home/></PageTransition>
                                }
                            />

                            {/* ZONE C · Interview / CV flow (each page renders its own chrome) */}
                            <Route path="template/:id"
                                   element={<PageTransition
                                       key={location.pathname}><TemplateDetail/></PageTransition>}/>
                            <Route path="optimizer"
                                   element={<PageTransition key={location.pathname}><CVResult/></PageTransition>}/>
                            <Route path="cv-analyzing"
                                   element={<PageTransition key={location.pathname}><CVAnalyzing/></PageTransition>}/>
                            <Route path="builder"
                                   element={<PageTransition key={location.pathname}><CVBuilder/></PageTransition>}/>
                            <Route path="analysis"
                                   element={<PageTransition key={location.pathname}><CVResult/></PageTransition>}/>
                            <Route path="editor"
                                   element={<PageTransition key={location.pathname}><CVEditor/></PageTransition>}/>
                            <Route path="payment"
                                   element={<PageTransition key={location.pathname}><PaymentPage/></PageTransition>}/>
                            <Route path="audio-setup"
                                   element={<PageTransition key={location.pathname}><AudioSetup/></PageTransition>}/>
                            <Route path="video-setup"
                                   element={<PageTransition key={location.pathname}><VideoSetup/></PageTransition>}/>
                            <Route path="interview/room"
                                   element={<PageTransition key={location.pathname}><RoomGuard
                                       children={<InterviewRoom/>}/></PageTransition>}/>
                            <Route path="interview/review"
                                   element={<PageTransition key={location.pathname}><VideoReview/></PageTransition>}/>
                            <Route path="interview/result"
                                   element={<PageTransition
                                       key={location.pathname}><ResultGuard><InterviewResults/></ResultGuard></PageTransition>}/>
                            <Route path="interview/job-selection"
                                   element={<PageTransition key={location.pathname}><JobSelection/></PageTransition>}/>
                            <Route path="interview/cv-status"
                                   element={<PageTransition key={location.pathname}><CVStatus/></PageTransition>}/>
                            <Route path="interview/experience-level"
                                   element={<PageTransition
                                       key={location.pathname}><ExperienceLevel/></PageTransition>}/>
                            <Route path="interview/career-goal"
                                   element={<PageTransition key={location.pathname}><CareerGoal/></PageTransition>}/>
                            <Route path="interview/setup"
                                   element={<PageTransition key={location.pathname}><InterviewSetup/></PageTransition>}/>

                            {/* ZONE B shell: Sidebar + Header stay mounted */}
                            <Route path="*" element={
                                <ProtectedRoute isLoggedIn={isLoggedIn}>
                                    <div className="flex flex-col min-h-screen">
                                        <div className="flex bg-background text-on-surface font-sans antialiased flex-1">
                                            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <Header
                                                    profile={profile}
                                                    notificationsCount={notificationsCount}
                                                    onHelpClick={() => showToast('Trung tâm trợ giúp Smartfolio đang tải dữ liệu.', 'info')}
                                                    onMenuClick={() => setIsSidebarOpen(true)}
                                                />
                                                <main
                                                    className="flex-1 p-4 md:p-8 overflow-y-auto max-w-5xl w-full mx-auto">
                                                    <AnimatePresence mode="wait">
                                                        <PageTransition key={location.pathname}>
                                                            <Routes location={location}>
                                                                <Route path="personal-info"
                                                                        element={<PersonalInfoPage/>}/>
                                                                <Route path="security"
                                                                        element={<SecurityPage/>}/>
                                                                <Route path="pricing"
                                                                        element={<PricingPage/>}/>
                                                                <Route path="my-cvs"
                                                                        element={<MyCVsPage/>}/>
                                                                <Route path="history"
                                                                        element={<HistoryPage/>}/>
                                                            </Routes>
                                                        </PageTransition>
                                                    </AnimatePresence>
                                                </main>
                                            </div >
                                        </div >
                                        <Footer />
                                    </div >
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
                    <span className="min-w-0 break-words text-sm font-medium leading-normal whitespace-normal flex-1">
            {toast.message}
          </span>
                </div>
            )}
            {/* Global feedback widget — available on every page */}
        </div>
    );
}

export default AppLayout;
