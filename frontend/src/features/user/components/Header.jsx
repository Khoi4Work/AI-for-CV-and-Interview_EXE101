import React from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Bell, HelpCircle, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';

const Header = ({ onHelpClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { notificationsCount } = useApp();

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

  return (
    <header className="h-16 border-b border-outline-variant glass-panel px-8 flex items-center justify-between sticky top-0 z-10 w-full select-none">
      <div className="flex items-center space-x-8">
        <h1 className="text-xl font-bold text-on-surface tracking-tight">{getTabTitle(location.pathname)}</h1>
        <nav className="hidden md:flex items-center gap-4">
        </nav>
      </div>

      <div className="flex items-center space-x-6">
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
          onClick={() => navigate('/personal-info')}
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
        </button>
      </div>
    </header>
  );
};

export default Header;
