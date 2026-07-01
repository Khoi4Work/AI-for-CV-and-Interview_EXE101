// import React from 'react';
// import { User, ShieldCheck, Package, Clock, FileText, HelpCircle, LogOut } from 'lucide-react';
// import { TabType } from '../types';
//
// interface SidebarProps {
//     activeTab: TabType;
//     setActiveTab: (tab: TabType) => void;
// }
//
// export const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
//     const navItems = [
//         { id: 'profile' as TabType, label: 'Thông tin cá nhân', icon: <User size={18} /> },
//         { id: 'security' as TabType, label: 'Bảo mật', icon: <ShieldCheck size={18} /> },
//         { id: 'subscription' as TabType, label: 'Gói dịch vụ', icon: <Package size={18} /> },
//         { id: 'history' as TabType, label: 'Lịch sử', icon: <Clock size={18} /> },
//         { id: 'my-cvs' as TabType, label: 'CV của tôi', icon: <FileText size={18} /> },
//     ];
//
//     return (
//         <div className="w-64 min-h-screen border-r border-[#1E2E42] bg-[#0A1118] flex flex-col pt-8">
//             <div className="px-6 mb-4">
//                 <h2 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">Cài đặt cá nhân</h2>
//             </div>
//
//             <nav className="flex-1">
//                 <ul className="space-y-1 px-3">
//                     {navItems.map((item) => (
//                         <li key={item.id}>
//                             <button
//                                 onClick={() => setActiveTab(item.id)}
//                                 className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
//                                     activeTab === item.id
//                                         ? 'bg-[#10B981]/10 text-[#10B981]' // Active state: light emerald bg, emerald text
//                                         : 'text-[#94A3B8] hover:bg-[#1E2E42] hover:text-white' // Inactive state
//                                 }`}
//                             >
//                                 {item.icon}
//                                 {item.label}
//                             </button>
//                         </li>
//                     ))}
//                 </ul>
//             </nav>
//
//             <div className="p-4 border-t border-[#1E2E42] space-y-1">
//                 <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#94A3B8] hover:bg-[#1E2E42] hover:text-white transition-colors">
//                     <HelpCircle size={18} />
//                     Trợ giúp
//                 </button>
//                 <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors">
//                     <LogOut size={18} />
//                     Đăng xuất
//                 </button>
//             </div>
//         </div>
//     );
// };
