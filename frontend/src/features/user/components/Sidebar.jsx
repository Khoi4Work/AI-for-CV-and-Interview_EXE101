import React from 'react';
import {NavLink, useNavigate} from 'react-router-dom';
import {User, Shield, CreditCard, Clock, FileText, Settings, LogOut, HelpCircle} from 'lucide-react';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import logo from '../../../assets/logo.jpg';

const Sidebar = () => {
    const {handleLogout, is2faEnabled} = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {path: '/personal-info', label: 'Thông tin cá nhân', icon: User},
        {path: '/security', label: 'Bảo mật', icon: Shield},
        {path: '/pricing', label: 'Gói dịch vụ', icon: CreditCard},
        {path: '/history', label: 'Lịch sử', icon: Clock},
        {path: '/my-cvs', label: 'CV của tôi', icon: FileText},
        // {path: '/help', label: 'Trợ giúp', icon: HelpCircle},
        {onClick: handleLogout, label: 'Đăng xuất', icon: LogOut, variant: 'danger'}
    ];

    const handleBackHome = () => {
        navigate('/home');
    }

    return (
        <aside
            className="w-64 min-h-screen border-r border-[#1E2E42]  flex flex-col pt-8 sticky top-0 left-0 text-white select-none z-20">
            <div className="px-6 mb-8">
                <div
                    className="flex items-center space-x-2 cursor-pointer"
                    onClick={handleBackHome}
                >
                    <img src={logo} alt="Smartfolio Logo" className="w-8 h-8 rounded-lg object-cover select-none" />
                    <span className="text-xl font-extrabold text-white tracking-tight">Smartfolio</span>
                </div>
            </div>

            <nav className="flex-1 px-3">
                <h2 className="px-3 text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">Menu chính</h2>
                <ul className="space-y-1">
                    {menuItems.map((item, idx) => {
                        const Icon = item.icon;
                        if (item.path) {
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
                                                <Icon size={18}
                                                      className={`${isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}/>
                                                <span>{item.label}</span>
                                                {item.path === '/security' && is2faEnabled && (
                                                    <span
                                                        className="w-1.5 h-1.5 rounded-full bg-[#10B981] ml-auto"></span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                </li>
                            );
                        }
                        return (
                            <li key={idx}>
                                <button
                                    onClick={item.onClick}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                                        item.variant === 'danger'
                                            ? 'text-red-500 hover:bg-red-500/10'
                                            : 'text-[#94A3B8] hover:bg-[#1E2E42] hover:text-white'
                                    }`}
                                >
                                    <Icon size={18}
                                          className={item.variant === 'danger' ? 'text-red-500' : 'text-[#94A3B8]'}/>
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>


        </aside>
    );
};

export default Sidebar;