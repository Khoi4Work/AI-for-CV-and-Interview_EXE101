import React from 'react';
import {Link, useNavigate} from 'react-router-dom';

const GuestHeader = () => {
    const navigate = useNavigate();
    const isHome = location.pathname === '/home' || location.pathname === '/';
    const isInterview = location.pathname === '/interview';
    const isTemplates = location.pathname === '/templates';
    const bgClass = isHome || isInterview || isTemplates ? 'bg-white/80 backdrop-blur-md' : 'bg-surface';
    const maxW = 'max-w-full';
    return (
        <header
            className={`flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop lg:px-gutter h-[72px] sticky top-0 z-50 ${maxW} mx-auto ${bgClass}`}>
            <div className="flex items-center space-x-2">
                <div
                    className="w-8 h-8 rounded-lg bg-[#0b3c8f] flex items-center justify-center text-white font-bold text-lg select-none">
                    S
                </div>
                <Link to="/" className="text-xl font-bold text-[#0b3c8f] tracking-tight font-sans">Smartfolio</Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex gap-md items-center">
                <Link
                    className={`font-label-md text-label-md transition-colors ${isHome ? 'text-primary dark:text-on-primary-fixed border-b-2 border-primary dark:border-on-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/">Home</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isInterview ? 'text-primary dark:text-on-primary-fixed border-b-2 border-primary dark:border-on-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/interview">Interview</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isTemplates ? 'text-primary dark:text-on-primary-fixed border-b-2 border-primary dark:border-on-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/templates">Templates</Link>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => navigate('/register')}
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 transition-colors"
                >
                    Đăng ký
                </button>
                <button
                    onClick={() => navigate('/login')}
                    className="bg-[#0b3c8f] hover:bg-[#093278] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                    Đăng nhập
                </button>
            </div>
        </header>
    );
};

export default GuestHeader;
