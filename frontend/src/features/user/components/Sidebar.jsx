import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Shield, CreditCard, Clock, FileText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';

const Sidebar = () => {
    const { handleLogout, is2faEnabled } = useAuth();
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
            className="w-64 bg-background border-r border-surface-container flex flex-col justify-between h-screen sticky top-0 left-0 text-on-surface select-none pb-6 z-20">
            <div className="flex flex-col">
                {/* Brand/Logo */}
                <div className="px-6 py-6 border-b border-surface-container flex items-center space-x-2">
                    <div
                        className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-lg">
                        S
                    </div>
                    <span className="text-xl font-extrabold text-primary tracking-tight cursor-pointer"
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
                                            ? 'bg-primary text-on-primary shadow-primary/10'
                                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                                    }`
                                }
                            >
                                {({isActive}) => (
                                    <>
                                        <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-on-primary' : 'text-on-surface-variant'}`}/>
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
            <div className="px-4 space-y-1.5 pt-4 border-t border-surface-container">
                <NavLink
                    to="/personal-info"
                    className={({isActive}) =>
                        `w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                            isActive
                                ? 'bg-primary text-on-primary'
                                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`
                    }
                >
                    <Settings className="w-4.5 h-4.5 text-on-surface-variant"/>
                    <span>Cài đặt</span>
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-rose-600 hover:bg-surface-container hover:text-rose-700 text-sm font-medium transition-colors cursor-pointer"
                >
                    <LogOut className="w-4.5 h-4.5 text-rose-500"/>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
