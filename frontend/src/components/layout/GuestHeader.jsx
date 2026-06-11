import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const GuestHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-150 px-6 py-4 flex items-center justify-between w-full">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-[#0b3c8f] flex items-center justify-center text-white font-bold text-lg select-none">
          S
        </div>
        <Link to="/" className="text-xl font-bold text-[#0b3c8f] tracking-tight font-sans">Smartfolio</Link>
      </div >

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
        <Link to="/" className="text-[#0b3c8f] border-b-2 border-[#0b3c8f] pb-1">Home</Link>
        <a href="#interview" className="text-slate-500 hover:text-slate-800 transition-colors">Interview</a>
        <a href="#templates" className="text-slate-500 hover:text-slate-800 transition-colors">Templates</a>
      </nav >

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
      </div >
    </header>
  );
};

export default GuestHeader;
