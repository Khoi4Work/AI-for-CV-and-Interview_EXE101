import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {useApp} from '../../contexts/AppContext.jsx';

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
    <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-10 w-full select-none">
      <h1 className="text-xl font-bold text-slate-800 tracking-tight">{getTabTitle(location.pathname)}</h1>

      <div className="flex items-center space-x-6">
        {/* Notifications Icon with Red Dot */}
        <button
          className="relative text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
        >
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* Help Circle Button */}
        <button
          onClick={onHelpClick}
          className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Vertical divider */}
        <div className="h-4 w-px bg-slate-200"></div>

        {/* User Profile Mini Block */}
        <button
          onClick={() => navigate('/personal-info')}
          className="flex items-center space-x-3.5 group text-left"
        >
          <div className="w-9 h-9 rounded-full bg-[#0b3c8f]/10 text-[#0b3c8f] hover:bg-[#0b3c8f]/15 border border-[#0b3c8f]/10 shadow-sm flex items-center justify-center font-bold text-xs tracking-tight transition-all">
            {getInitials(profile?.fullName)}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-700 leading-none group-hover:text-slate-900 transition-colors">
              {profile?.fullName}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{profile?.membershipType}</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
