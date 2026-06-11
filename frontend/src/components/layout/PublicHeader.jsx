import {useState, useEffect, useRef} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {User, Shield, CreditCard, Clock, FileText, LogOut} from 'lucide-react';
import {useAuth} from "../../contexts/AuthContext.jsx";

export function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const isHome = location.pathname === '/home' || location.pathname === '/';
    const {handleLogout} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const logout = () => {
        handleLogout();
        navigate('/');
    }
    const maxW = 'max-w-full';
    const bgClass = isHome ? 'bg-white/80 backdrop-blur-md' : 'bg-surface';

    const menuItems = [
        {path: '/personal-info', label: 'Thông tin cá nhân', icon: User},
        {path: '/security', label: 'Bảo mật', icon: Shield},
        {path: '/pricing', label: 'Gói dịch vụ', icon: CreditCard},
        {path: '/history', label: 'Lịch sử', icon: Clock},
        {path: '/my-cvs', label: 'CV của tôi', icon: FileText},
    ];

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

            <nav className="hidden md:flex gap-md items-center">
                <Link
                    className={`font-label-md text-label-md transition-colors ${isHome ? 'text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1' : 'text-secondary dark:text-outline hover:text-primary'}`}
                    to="/">Home</Link>
                <Link
                    className="font-label-md text-label-md text-secondary dark:text-outline hover:text-primary transition-colors"
                    to="/interview">Interview</Link>
                <Link
                    className="font-label-md text-label-md text-secondary dark:text-outline hover:text-primary transition-colors"
                    to="/templates">Templates</Link>
            </nav>

            <div className="flex items-center gap-md relative">
                <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors p-xs"
                        aria-label="Notifications">notifications
                </button>
                <button onClick={() => navigate('/templates')}
                        className="bg-primary-container text-on-primary-container px-sm py-xs rounded-lg font-label-md text-label-md scale-95 active:opacity-80 transition-all hover:bg-primary-fixed">
                    Create New
                </button>

                <div className="relative" ref={dropdownRef}>
                    <div
                        className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-container cursor-pointer hover:ring-2 ring-primary transition-all"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                        <img alt="User avatar" className="w-full h-full object-cover"
                             src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM9XsZ4aWCS5xkVo_8SDk7jd9bdPumI-yvoRQpK2EdyEHINQSVcdliwuZj-2_2FzWV7ZF0uzt8CmMBzxR--3IxLaXuCMRQ_4jLJ5Ilj5xugbOgo4Zp1KQGhkNEvzufFHPMhQ8Mq04qtKbYprDFaH9bBUk37yVPKsH3eYYJ laT9S"/>
                    </div>

                    {dropdownOpen && (
                        <div
                            className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl shadow-2xl border border-white/30 py-2 z-[60] animate-fade-in">
                            <div className="px-4 py-2 mb-2 border-b border-outline-variant/50">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider">Tài khoản của
                                    tôi</p>
                            </div>
                            <div className="flex flex-col px-2">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-secondary hover:bg-primary hover:text-white transition-all group"
                                    >
                                        <item.icon className="w-4 h-4 text-slate-400 group-hover:text-white"/>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                                <div className="my-2 border-t border-outline-variant/50"></div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all group"
                                >
                                    <LogOut className="w-4 h-4 text-rose-500 group-hover:text-rose-700"/>
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
