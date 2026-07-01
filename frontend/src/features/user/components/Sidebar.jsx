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
            className="w-64 min-h-screen border-r border-[#1E2E42] bg-[#0A1118] flex flex-col pt-8 sticky top-0 left-0 text-white select-none z-20">
            <div className="px-6 mb-8">
                <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={handleBackHome}
                >
                    <div className="w-8 h-8 rounded-lg bg-[#10B981] flex items-center justify-center text-white font-bold text-lg">
                        S
                    </div>
                    <span className="text-xl font-extrabold text-white tracking-tight">Smartfolio</span>
                </div>
            </div>

            <nav className="flex-1 px-3">
                <h2 className="px-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">Menu chính</h2>
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    className={({isActive}) =>
                                        `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                                            isActive
                                                ? 'bg-[#10B981]/10 text-[#10B981]'
                                                : 'text-[#94A3B8] hover:bg-[#1E2E42] hover:text-white'
                                        }`
                                    }
                                >
                                    {({isActive}) => (
                                        <>
                                            <Icon size={18} className={`${isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}/>
                                            <span>{item.label}</span>
                                            {item.path === '/security' && is2faEnabled && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] ml-auto"></span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-[#1E2E42] space-y-1">
                <NavLink
                    to="/personal-info"
                    className={({isActive}) =>
                        `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                            isActive
                                ? 'bg-[#10B981]/10 text-[#10B981]'
                                : 'text-[#94A3B8] hover:bg-[#1E2E42] hover:text-white'
                        }`
                    }
                >
                    <Settings size={18} className="text-[#94A3B8]"/>
                    <span>Cài đặt</span>
                </NavLink>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
