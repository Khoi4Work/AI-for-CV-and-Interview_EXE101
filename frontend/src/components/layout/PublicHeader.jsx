import {useState, useEffect, useRef} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {User, Shield, CreditCard, Clock, FileText, LogOut, Menu, X} from 'lucide-react';
import {createPortal} from 'react-dom';
import {useAuth} from "../../features/auth/contexts/AuthContext.jsx";
import logo from '../../assets/logo.jpg';

export function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dropdownMenuRef = useRef(null);
    const avatarRef = useRef(null);
    const location = useLocation();
    const isHome = location.pathname === '/home' || location.pathname === '/';
    const isInterview = location.pathname === '/interview';
    const isTemplates = location.pathname === '/templates';
    const isEvaluation = location.pathname === '/cv-evaluation';
    const {handleLogout, isLoggingOut} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!dropdownRef.current?.contains(event.target)
                && !dropdownMenuRef.current?.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setDropdownOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!dropdownOpen) return undefined;

        const updateDropdownPosition = () => {
            const anchor = avatarRef.current?.getBoundingClientRect();
            if (!anchor) return;
            const top = Math.max(8, Math.min(anchor.bottom + 8, window.innerHeight - 160));
            setDropdownPosition({top, right: Math.max(8, window.innerWidth - anchor.right)});
        };

        updateDropdownPosition();
        window.addEventListener('resize', updateDropdownPosition);
        window.addEventListener('scroll', updateDropdownPosition, true);
        return () => {
            window.removeEventListener('resize', updateDropdownPosition);
            window.removeEventListener('scroll', updateDropdownPosition, true);
        };
    }, [dropdownOpen]);

    const logout = async () => {
        await handleLogout();
        navigate('/');
    }
    const maxW = 'max-w-full';
    const bgClass = isHome || isInterview || isTemplates || isEvaluation ? 'glass-panel' : 'bg-surface';

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
                <img src={logo} alt="Smartfolio Logo" className="w-8 h-8 rounded-lg object-cover select-none" />
                <Link to="/" className="text-xl font-bold text-primary tracking-tight font-sans">Smartfolio</Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
                className="md:hidden p-2 text-on-surface-variant hover:text-primary transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <nav className={`
                fixed md:static top-[72px] left-0 w-full md:w-auto h-screen md:h-auto
                bg-surface md:bg-transparent z-50 md:z-auto
                flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-md p-6 md:p-0
                transition-all duration-300 ease-in-out
                ${menuOpen ? 'translate-x-0 opacity-100' : '-translate-x-full md:translate-x-0 opacity-0 md:opacity-100'}
            `}>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isHome ? 'text-primary border-b-2 border-primary pb-1 md:pb-1' : 'text-on-surface-variant hover:text-primary'} py-2 md:py-0 block w-full md:w-auto`}
                    to="/" onClick={() => setMenuOpen(false)}>Trang chủ</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isInterview ? 'text-primary border-b-2 border-primary pb-1 md:pb-1' : 'text-on-surface-variant hover:text-primary'} py-2 md:py-0 block w-full md:w-auto`}
                    to="/interview" onClick={() => setMenuOpen(false)}>Phỏng vấn</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isTemplates ? 'text-primary border-b-2 border-primary pb-1 md:pb-1' : 'text-on-surface-variant hover:text-primary'} py-2 md:py-0 block w-full md:w-auto`}
                    to="/templates" onClick={() => setMenuOpen(false)}>Templates & Tạo CV</Link>
                <Link
                    className={`font-label-md text-label-md transition-colors ${isEvaluation ? 'text-primary border-b-2 border-primary pb-1 md:pb-1' : 'text-on-surface-variant hover:text-primary'} py-2 md:py-0 block w-full md:w-auto`}
                    to="/cv-evaluation" onClick={() => setMenuOpen(false)}>Đánh giá CV</Link>
            </nav>

            <div className="flex items-center gap-md relative">
                <button className="text-on-surface-variant hover:text-on-surface transition-colors p-xs"
                        aria-label="Notifications">
                    <span className="material-symbols-outlined">notifications</span>
                </button>
                <button onClick={() => navigate('/templates')}
                        className="hidden sm:block bg-primary text-on-primary px-sm py-xs rounded-lg font-label-md text-label-md scale-95 active:opacity-80 transition-all hover:bg-primary-container">
                    Tạo mới CV ngay
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button
                        ref={avatarRef}
                        type="button"
                        aria-label="Mở menu tài khoản"
                        aria-haspopup="menu"
                        aria-expanded={dropdownOpen}
                        className="block w-10 h-10 rounded-full overflow-hidden border border-outline-variant bg-surface-container cursor-pointer hover:ring-2 ring-primary transition-all"
                        onClick={() => setDropdownOpen((open) => !open)}
                    >
                        <img alt="User avatar" className="w-full h-full object-cover"
                             src="https://i.postimg.cc/TPSD2BTv/avatar.avif"/>
                    </button>

                    {dropdownOpen && dropdownPosition && createPortal(
                        <div
                            ref={dropdownMenuRef}
                            role="menu"
                            style={{
                                position: 'fixed',
                                top: dropdownPosition.top,
                                right: dropdownPosition.right,
                                maxHeight: `calc(100dvh - ${dropdownPosition.top}px - 16px)`,
                            }}
                            className="w-64 max-w-[calc(100vw-2rem)] overflow-y-auto bg-surface-container/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-outline-variant py-2 z-[1000] animate-fade-in">
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
                                        role="menuitem"
                                        className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all group"
                                    >
                                        <item.icon className="w-4 h-4 text-outline group-hover:text-on-primary"/>
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                                <div className="my-2 border-t border-outline-variant/50"></div>
                                <button
                                    onClick={logout}
                                    disabled={isLoggingOut}
                                    role="menuitem"
                                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group ${
                                        isLoggingOut
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'text-rose-600 hover:bg-rose-500/10 hover:text-rose-700'
                                    }`}
                                >
                                    <LogOut className={`w-4 h-4 ${isLoggingOut ? 'text-gray-400' : 'text-rose-500 group-hover:text-rose-700'}`}/>
                                    <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
                                </button>
                            </div>
                        </div>,
                        document.body,
                    )}
                </div>
            </div>
        </header>
    );
}
