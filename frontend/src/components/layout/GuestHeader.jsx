import React, {useState} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {Menu, X} from 'lucide-react';
import logo from '../../assets/logo.jpg';
import './GuestHeader.css';

const GuestHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const isHome = location.pathname === '/home' || location.pathname === '/';
    const isInterview = location.pathname === '/interview';
    const isTemplates = location.pathname === '/templates';
    const isEvaluation = location.pathname === '/cv-evaluation';
    const bgClass = isHome || isInterview || isTemplates || isEvaluation ? 'glass-panel' : 'bg-surface';
    const maxW = 'max-w-full';
    return (
        <header
            className={`home-guest-header flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop lg:px-gutter h-[72px] sticky top-0 z-50 ${maxW} mx-auto ${bgClass}`}>
            <div className="flex items-center space-x-2">
                <img src={logo} alt="Smartfolio Logo" className="w-8 h-8 rounded-lg object-cover select-none" />
                <Link to="/" className="text-xl font-bold text-primary tracking-tight font-sans">Smartfolio</Link>
            </div>

            {/* Navigation Links */}
            <button
                type="button"
                className="home-guest-header__toggle md:hidden"
                aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
                aria-expanded={menuOpen}
                aria-controls="guest-navigation"
                onClick={() => setMenuOpen((open) => !open)}
            >
                {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
            <nav id="guest-navigation" className={`home-guest-header__nav ${menuOpen ? 'is-open' : ''}`}>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isHome ? 'text-primary dark:text-on-primary-fixed border-b-2 border-primary dark:border-on-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isInterview ? 'text-primary dark:text-on-primary-fixed border-b-2 border-primary dark:border-on-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/interview" onClick={() => setMenuOpen(false)}>Phỏng vấn</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isTemplates ? 'text-primary dark:text-on-primary-fixed border-b-2 border-primary dark:border-on-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/templates" onClick={() => setMenuOpen(false)}>Mẫu CV</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isEvaluation ? 'text-primary dark:text-on-primary-fixed border-b-2 border-primary dark:border-on-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/cv-evaluation" onClick={() => setMenuOpen(false)}>So khớp CV với JD</Link>
            </nav>

            {/* Auth Actions */}
            <div className="flex items-center space-x-4">
                {location.pathname !== '/register' && (
                    <button
                        onClick={() => navigate('/register')}
                        className="text-sm font-semibold text-on-surface-variant hover:text-on-surface px-3 py-1.5 transition-colors"
                    >
                        Đăng ký
                    </button>
                )}
                <button
                    onClick={() => navigate('/login')}
                    className="bg-primary hover:bg-primary-container text-on-primary text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-all active:scale-[0.98]"
                >
                    Đăng nhập
                </button>
            </div>
        </header>
    );
};

export default GuestHeader;
