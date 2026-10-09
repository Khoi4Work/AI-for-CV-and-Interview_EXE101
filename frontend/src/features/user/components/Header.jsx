import React, {useEffect, useRef, useState} from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Bell, HelpCircle, Menu, User, Shield, CreditCard, Clock, FileText, Briefcase, LogOut, ChevronDown } from 'lucide-react';
import {createPortal} from 'react-dom';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';

const Header = ({ onHelpClick, onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, handleLogout, isLoggingOut } = useAuth();
  const { notificationsCount } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const profileRef = useRef(null);
  const dropdownRef = useRef(null);

  const menuItems = [
    {path: '/personal-info', label: 'Thông tin cá nhân', icon: User},
    {path: '/security', label: 'Bảo mật', icon: Shield},
    {path: '/pricing', label: 'Gói dịch vụ', icon: CreditCard},
    {path: '/history', label: 'Lịch sử', icon: Clock},
    {path: '/my-cvs', label: 'CV của tôi', icon: FileText},
    {path: '/my-jds', label: 'JD của tôi', icon: Briefcase},
  ];

  const getTabTitle = (path) => {
    switch (path) {
      case '/personal-info':
        return 'Thông tin cá nhân';
      case '/security':
        return 'Bảo mật';
      case '/pricing':
        return 'Gói dịch vụ';
      case '/history':
        return 'Lịch sử';
      case '/my-cvs':
        return 'CV của tôi';
      case '/my-jds':
        return 'JD của tôi';
      default:
        return 'Thông tin';
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!profileRef.current?.contains(event.target) && !dropdownRef.current?.contains(event.target)) {
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
      const anchor = profileRef.current?.getBoundingClientRect();
      if (!anchor) return;
      const top = Math.max(8, Math.min(anchor.bottom + 8, window.innerHeight - 180));
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
  };

  return (
    <header className="h-16 border-b border-outline-variant glass-panel px-4 md:px-8 flex items-center justify-between sticky top-0 z-10 w-full select-none">
      <div className="flex items-center gap-4 md:space-x-8">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <Link to="/" className="text-lg md:text-xl font-bold text-on-surface tracking-tight hover:text-primary transition-colors">
          {getTabTitle(location.pathname)}
        </Link>
        <nav className="hidden md:flex items-center gap-4">
        </nav>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Notifications Icon with Red Dot */}
        <button
          className="relative text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container"
        >
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* Help Circle Button */}
        <button
          onClick={onHelpClick}
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1.5 rounded-lg hover:bg-surface-container"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Vertical divider */}
        <div className="h-4 w-px bg-outline-variant"></div>

        {/* User Profile Mini Block */}
        <button
          ref={profileRef}
          type="button"
          onClick={() => setDropdownOpen((open) => !open)}
          aria-label="Mở menu tài khoản"
          aria-haspopup="menu"
          aria-expanded={dropdownOpen}
          className="flex items-center space-x-3.5 group text-left"
        >
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/15 border border-primary/10 shadow-sm flex items-center justify-center font-bold text-xs tracking-tight transition-all">
            {getInitials(profile?.fullName)}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-on-surface leading-none group-hover:text-primary transition-colors">
              {profile?.fullName}
            </p>
            <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{profile?.membershipType}</p>
          </div>
          <ChevronDown size={16} className={`hidden md:block text-on-surface-variant transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        {dropdownOpen && dropdownPosition && createPortal(
          <div
            ref={dropdownRef}
            role="menu"
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              maxHeight: `calc(100dvh - ${dropdownPosition.top}px - 16px)`,
            }}
            className="z-[1000] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-outline-variant bg-surface-container/95 py-2 shadow-2xl backdrop-blur-lg animate-fade-in"
          >
            <div className="mb-2 border-b border-outline-variant/50 px-4 py-2">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">Tài khoản của tôi</p>
            </div>
            <div className="flex flex-col px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="group flex items-center space-x-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-all hover:bg-primary hover:text-on-primary"
                >
                  <item.icon className="h-4 w-4 text-outline group-hover:text-on-primary" />
                  <span>{item.label}</span>
                </Link>
              ))}
              <div className="my-2 border-t border-outline-variant/50" />
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                disabled={isLoggingOut}
                className="group flex w-full items-center space-x-3 rounded-xl px-3 py-2.5 text-rose-600 transition-all hover:bg-rose-500/10 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 text-rose-500 group-hover:text-rose-700" />
                <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
              </button>
            </div>
          </div>,
          document.body,
        )}
      </div>
    </header>
  );
};

export default Header;
