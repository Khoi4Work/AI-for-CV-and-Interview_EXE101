import React from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import {User, Shield, CreditCard, Clock, FileText, Settings, LogOut} from 'lucide-react';

const Sidebar = ({onLogout, is2faEnabled}) => {
    const navigate = useNavigate();
    const menuItems = [
        {path: '/personal-info', label: 'Thông tin cá nhân', icon: User},
        {path: '/security', label: 'Bảo mật', icon: Shield},
        {path: '/pricing', label: 'Gói dịch vụ', icon: CreditCard},
        {path: '/history', label: 'Lịch sử', icon: Clock},
        {path: '/my-cvs', label: 'CV của tôi', icon: FileText},
    ];
    const handleBackHome = () => {
        navigate('/home');
    }
    return (
        <aside
            className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 left-0 text-slate-800 select-none pb-6 z-20">
            <div className="flex flex-col">
                {/* Brand/Logo */}
                <div className="px-6 py-6 border-b border-slate-100 flex items-center space-x-2">
                    <div
                        className="w-8 h-8 rounded-lg bg-[#0b3c8f] flex items-center justify-center text-white font-bold text-lg">
                        S
                    </div>
                    <span className="text-xl font-extrabold text-[#0b3c8f] tracking-tight"
                          onClick={handleBackHome}>Smartfolio</span>
                </div>

                {/* Menu Navigation */}
                <nav className="mt-8 px-4 space-y-1.5 flex-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({isActive}) =>
                                    `w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-all duration-150 text-sm font-medium ${
                                        isActive
                                            ? 'bg-[#0b3c8f] text-white shadow-md shadow-[#0b3c8f]/10'
                                            : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                                    }`
                                }
                            >
                                {({isActive}) => (
                                    <>
                                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white' : 'text-slate-400'}`}/>
                                        <span>{item.label}</span>
                                        {item.path === '/security' && is2faEnabled && (
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-auto"></span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Footer Side Actions */}
            <div className="px-4 space-y-1.5 pt-4 border-t border-slate-200/60">
                <NavLink
                    to="/personal-info"
                    className={({isActive}) =>
                        `w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                            isActive
                                ? 'bg-[#0b3c8f] text-white'
                                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
                        }`
                    }
                >
                    <Settings className="w-4.5 h-4.5 text-slate-400"/>
                    <span>Cài đặt</span>
                </NavLink>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-sm font-medium transition-colors"
                >
                    <LogOut className="w-4.5 h-4.5 text-rose-500"/>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
