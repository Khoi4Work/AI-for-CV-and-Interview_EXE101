import React from 'react';
import {Routes, Route, Navigate, useLocation} from 'react-router-dom';
import {AnimatePresence} from 'framer-motion';
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
import PageTransition from "../transitions/PageTransition.jsx";
import ScrollToTop from "../transitions/ScrollToTop.jsx";
import RouteProgressBar from "../transitions/RouteProgressBar.jsx";

/**
 * AppLayout
 * ─────────────────────────────────────────────────────────────────
 * Three route zones. Each <PageTransition> uses React's `key` prop
 * (not a custom prop) so AnimatePresence sees a new keyed sibling
 * and framer-motion can run the entry/exit animation.
 *
 *   ZONE A · Public  (no shell)         : /, /login, /register,
 *                                         /interview, /templates
 *                                         — enter animation only
 *                                         (no AnimatePresence; pages
 *                                         unmount instantly on exit)
 *
 *   ZONE B · Dashboard (Sidebar+Header) : home, personal-info,
 *                                         security, pricing, my-cvs,
 *                                         history
 *                                         — full enter+exit because
 *                                         the shell is stable and
 *                                         the user clicks between
 *                                         these pages the most
 *
 *   ZONE C · Interview / CV flow        : optimizer, builder,
 *                                         analysis, editor,
 *                                         audio-setup, video-setup,
 *                                         interview/...
 *                                         — enter animation only
 *                                         (each page renders its own
 *                                         chrome, no shared shell)
 *
 * The outer <Routes> in each zone receives `location` and
 * `key={location.pathname}` so it remounts on route change; the
 * PageTransition inside is keyed on the pathname so framer-motion
 * can pick it up. Shell chrome (Sidebar, Header) lives OUTSIDE the
 * keyed Routes in Zone B, so it never re-mounts when the user
 * clicks between dashboard tabs.
 */

export default function AppLayout() {
    const {isLoggedIn, profile} = useAuth();
    const {notificationsCount, showToast, toast} = useApp();
    const location = useLocation();

    return (
        <div className="relative">
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

                {/* ── Protected block (Zones B + C) ───────────────── */}
                <Route path="/*" element={
                    <ProtectedRoute isLoggedIn={isLoggedIn}>
                        <Routes location={location}>
                            {/* ZONE B · Dashboard (Home + 5 settings pages).
                                Home uses the standalone layout, the 5 settings
                                pages share the Sidebar+Header shell. */}
                            <Route
                                path="home"
                                element={
                                    <PageTransition key={location.pathname}><Home/></PageTransition>
                                }
                            />

                            {/* ZONE C · Interview / CV flow (each page renders its own chrome) */}
                            <Route path="template/:id"
                                   element={<PageTransition key={location.pathname}><TemplateDetail/></PageTransition>}/>
                            <Route path="optimizer"
                                   element={<PageTransition key={location.pathname}><CVOptimizer/></PageTransition>}/>
                            <Route path="builder"
                                   element={<PageTransition key={location.pathname}><CVBuilder/></PageTransition>}/>
                            <Route path="analysis"
                                   element={<PageTransition key={location.pathname}><CvAnalysis/></PageTransition>}/>
                            <Route path="editor"
                                   element={<PageTransition key={location.pathname}><CVEditor/></PageTransition>}/>

                            <Route path="audio-setup"
                                   element={<PageTransition key={location.pathname}><AudioSetup/></PageTransition>}/>
                            <Route path="video-setup"
                                   element={<PageTransition key={location.pathname}><VideoSetup/></PageTransition>}/>
                            <Route path="interview/room"
                                   element={<PageTransition key={location.pathname}><InterviewRoom/></PageTransition>}/>
                            <Route path="interview/review"
                                   element={<PageTransition key={location.pathname}><VideoReview/></PageTransition>}/>
                            <Route path="interview/result"
                                   element={<PageTransition key={location.pathname}><InterviewResults/></PageTransition>}/>
                            <Route path="interview/job-selection"
                                   element={<PageTransition key={location.pathname}><JobSelection/></PageTransition>}/>
                            <Route path="interview/cv-status"
                                   element={<PageTransition key={location.pathname}><CVStatus/></PageTransition>}/>
                            <Route path="interview/experience-level"
                                   element={<PageTransition key={location.pathname}><ExperienceLevel/></PageTransition>}/>
                            <Route path="interview/career-goal"
                                   element={<PageTransition key={location.pathname}><CareerGoal/></PageTransition>}/>
                            <Route path="interview/setup"
                                   element={<PageTransition key={location.pathname}><InterviewSetup/></PageTransition>}/>

                            {/* ZONE B shell: Sidebar + Header stay mounted;
                                only the inner <PageTransition> remounts when
                                the route changes. */}
                            <Route path="*" element={
                                <ProtectedRoute isLoggedIn={isLoggedIn}>
                                    <div
                                        className="flex bg-slate-50 min-h-screen text-slate-800 font-sans antialiased">
                                        <Sidebar/>
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <Header
                                                profile={profile}
                                                notificationsCount={notificationsCount}
                                                onHelpClick={() => showToast('Trung tâm trợ giúp Smartfolio đang tải dữ liệu.', 'info')}
                                            />
                                            <main
                                                className="flex-1 p-8 overflow-y-auto max-w-5xl w-full mx-auto">
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
            <FeedbackWidget/>
        </div>
    );
}
