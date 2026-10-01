import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Smartphone,
    Shield,
    ArrowRight,
    MessageSquare,
    ShieldCheck,
    AlertCircle,
    Laptop,
    LogOut,
    RefreshCw,
    KeyRound,
    CheckCircle2,
    AlertTriangle,
    Key
} from 'lucide-react';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import {Card, Button, Input, Badge, SectionHeader} from '../components/Layout.jsx';

const SecurityPage = () => {
    const navigate = useNavigate();
    const {
        is2faEnabled,
        handle2faToggle,
        devices,
        removeDevice,
        logoutAllDevices,
        securityLogs,
        addSecurityLog,
        changePassword,
        isLoading
    } = useAuth();
    const {showToast} = useApp();
    const [state, setState] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        const {currentPassword, newPassword, confirmPassword} = state;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('Vui lòng điền đầy đủ các thông tin mật khẩu!', 'info');
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast('Mật khẩu xác nhận không khớp!', 'info');
            return;
        }
        if (newPassword.length < 8) {
            showToast('Mật khẩu mới phải dài từ 8 ký tự trở lên!', 'info');
            return;
        }

        try {
            await changePassword({
                oldPassword: currentPassword,
                newPassword
            });
            showToast('Cập nhật mật khẩu thành công!', 'success');

            addSecurityLog({
                id: `log-${Date.now()}`,
                action: 'thay_doi_mat_khau',
                title: 'Thay đổi mật khẩu',
                details: 'Mật khẩu tài khoản vừa mới được cập nhật trên thiết bị này.',
                timeLabel: 'Hôm nay, vừa mới đây',
            });

            setState({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (err) {
            showToast(getApiErrorMessage(err), 'error');
        }
    };

    const handleLogoutDevice = (id, deviceName) => {
        removeDevice(id);
        showToast(`Đã thu hồi phiên đăng nhập trên: ${deviceName}`, 'info');
    };

    const handleLogoutAll = () => {
        logoutAllDevices();
        showToast('Đã đăng xuất khỏi tất cả các thiết bị phụ khác thành công!', 'success');
    };

    const getLogDetails = (action) => {
        switch (action) {
            case 'dang_nhap_thanh_cong':
                return {icon: <CheckCircle2 size={16}/>, color: 'bg-emerald-100 text-emerald-600 border-emerald-200'};
            case 'thay_doi_mat_khau':
                return {icon: <Key size={16}/>, color: 'bg-purple-100 text-purple-600 border-purple-200'};
            case 'co_gang_dang_nhap_that_bai':
                return {icon: <AlertTriangle size={16}/>, color: 'bg-red-100 text-red-600 border-red-200'};
            default:
                return {icon: <Shield size={16}/>, color: 'bg-slate-100 text-slate-600 border-slate-200'};
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto pb-12 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#64748B] animate-pulse">Đang tải cài đặt bảo mật...</p>
                </div>
            </div>
        );
    }

    return (
            <div className="max-w-4xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#10B981] mb-2">Bảo mật tài khoản</h1>
                    <p className="text-[#94A3B8] text-sm">Quản lý mật khẩu, xác thực hai lớp và kiểm soát các thiết bị đang
                        truy cập.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Password Section */}
                <Card className="p-6 bg-[#C2CFCD] border-none shadow-sm rounded-xl">
                    <SectionHeader title="Đổi mật khẩu" icon={<KeyRound size={18}/>} titleClassName="text-black"/>
                    <form onSubmit={handleUpdatePassword} className="space-y-4 mt-6">
                        <Input
                            label="Mật khẩu hiện tại"
                            type="password"
                            value={state.currentPassword || ''}
                            onChange={(e) => setState({...state, currentPassword: e.target.value})}
                            placeholder="••••••••"
                            className="bg-[#DEE6E5] rounded-md border-none"
                            labelClassName="text-black"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Mật khẩu mới"
                                type="password"
                                value={state.newPassword || ''}
                                onChange={(e) => setState({...state, newPassword: e.target.value})}
                                placeholder="••••••••"
                                className="bg-[#DEE6E5] rounded-md border-none"
                                labelClassName="text-black"
                            />
                            <Input
                                label="Xác nhận mật khẩu"
                                type="password"
                                value={state.confirmPassword || ''}
                                onChange={(e) => setState({...state, confirmPassword: e.target.value})}
                                placeholder="••••••••"
                                className="bg-[#DEE6E5] rounded-md border-none"
                                labelClassName="text-black"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                variant="primary"
                                className="bg-[#75B6A3] hover:bg-[#66a38f] text-white px-6 py-2.5 rounded-md"
                            >
                                Cập nhật mật khẩu
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* 2FA Section */}
                <Card className="p-6 bg-[#E1F4EE] border-none shadow-sm rounded-xl">
                    <SectionHeader title="Xác thực 2 lớp (2FA) " icon={<ShieldCheck size={18}/>}
                                   titleClassName="text-black"/>
                    <p className="text-[#475569] text-sm mb-6">Thêm một lớp bảo mật để ngăn chặn truy cập trái phép.</p>

                    <div className="space-y-4">
                        <Card
                            className="p-4 border-none bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex gap-4 items-center">
                                <div
                                    className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                    <Smartphone size={20} className="text-[#0F172A] group-hover:text-[#10B981]"/>
                                </div>
                                <div>
                                    <h4 className="text-[#0F172A] font-medium text-sm">Authenticator App</h4>
                                    <p className="text-[#64748B] text-xs">Khuyên dùng</p>
                                </div>
                            </div>
                            <button onClick={() => {
                                handle2faToggle(!is2faEnabled);
                                showToast(!is2faEnabled ? 'Đã bật Authenticator 2FA!' : 'Đã tắt Authenticator 2FA!', 'success');
                            }} className="p-2 text-[#64748B] hover:text-[#10B981]">
                                <ArrowRight size={18}/>
                            </button>
                        </Card>

                        <Card
                            className="p-4 border-none bg-white rounded-lg shadow-sm flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                            <div className="flex gap-4 items-center">
                                <div
                                    className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                    <MessageSquare size={20} className="text-[#0F172A] group-hover:text-[#10B981]"/>
                                </div>
                                <div>
                                    <h4 className="text-[#0F172A] font-medium text-sm">Tin nhắn SMS</h4>
                                    <p className="text-[#64748B] text-xs">Qua số điện thoại</p>
                                </div>
                            </div>
                            <button onClick={() => {
                                handle2faToggle(!is2faEnabled);
                                showToast(!is2faEnabled ? 'Đã cấu hình xác minh mã qua SMS!' : 'Đã tắt SMS OTP!', 'success');
                            }} className="p-2 text-[#64748B] hover:text-[#10B981]">
                                <ArrowRight size={18}/>
                            </button>
                        </Card>

                        <div className={`p-4 rounded-xl flex gap-3 items-start mt-4 transition-colors ${
                            is2faEnabled ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                            <AlertCircle size={18}
                                         className={`${is2faEnabled ? 'text-emerald-600' : 'text-amber-500'} shrink-0 mt-0.5`}/>
                            <p className="text-xs leading-relaxed">
                                2FA hiện
                                đang <b>{is2faEnabled ? 'Bật' : 'Tắt'}</b>. {is2faEnabled ? 'Tài khoản đang được bảo vệ.' : 'Chúng tôi khuyên bạn nên kích hoạt ngay.'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Devices Section */}
            <Card className="mb-8 p-6 bg-[#D3DDDB] border-none shadow-sm rounded-xl">
                <div className="flex items-center justify-between mb-6">
                    <SectionHeader title="Thiết bị đã đăng nhập" icon={<Laptop size={18}/>} titleClassName="text-black"
                                   className="mb-0"/>
                    {devices.length > 1 && (
                        <button
                            onClick={handleLogoutAll}
                            className="text-xs font-medium text-[#75B6A3] hover:underline"
                        >
                            Đăng xuất tất cả
                        </button>
                    )}
                </div>
                <p className="text-[#64748B] text-sm mb-6 -mt-4">Quản lý các trình duyệt và thiết bị đang truy cập tài
                    khoản.</p>

                <div className="flex flex-col divide-y divide-[#B2C0BF]">
                    {devices.map((dev) => (
                        <div key={dev.id}
                             className="flex items-center justify-between p-4 hover:bg-slate-200/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white rounded-full text-[#64748B] shadow-sm">
                                    {dev.device.toLowerCase().includes('mac') || dev.device.toLowerCase().includes('pc') ?
                                        <Laptop size={20}/> : <Smartphone size={20}/>}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-[#0F172A] font-medium text-sm">{dev.device} - {dev.browser}</h4>
                                        {dev.isCurrent && (
                                            <Badge variant="success"
                                                   className="text-[10px] bg-[#75B6A3] text-white px-2 py-0.5 rounded-full border-none">THIẾT
                                                BỊ NÀY</Badge>
                                        )}
                                    </div>
                                    <p className="text-[#64748B] text-xs">{dev.location} • {dev.status}</p>
                                </div>
                            </div>
                            {!dev.isCurrent && (
                                <button
                                    onClick={() => handleLogoutDevice(dev.id, dev.device)}
                                    className="p-2 text-[#94A3B8] hover:text-rose-600 transition-colors"
                                    title="Thoát thiết bị này"
                                >
                                    <LogOut size={18}/>
                                </button>
                            )}
                        </div>
                    ))}
                    {devices.length === 0 && (
                        <p className="text-center text-xs text-[#64748B] py-4">Không có thiết bị nào đang đăng nhập.</p>
                    )}
                </div>
                <div className="mt-6 pt-4 text-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/history')}
                        className="w-full max-w-2xl mx-auto border-slate-300 !text-black hover:bg-slate-50"
                    >
                        Xem tất cả hoạt động
                    </Button>
                </div>
            </Card>

            {/* Security Logs Section */}
            <Card className="p-6 bg-[#D3DDDB] border-none shadow-sm rounded-xl">
                <SectionHeader title="Lịch sử hoạt động bảo mật" icon={<RefreshCw size={18}/>} titleClassName="text-black"/>
                <div className="mt-6 flex flex-col divide-y divide-[#B2C0BF]">
                    {securityLogs.map((log) => {
                        const style = getLogDetails(log.action);
                        return (
                            <div key={log.id} className="flex gap-4 p-4 hover:bg-slate-50 transition-colors group">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${style.color}`}>
                                    {style.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-sm font-bold text-[#0F172A] group-hover:text-[#10B981] transition-colors">{log.title}</h4>
                                        <span className="text-[10px] text-[#64748B] font-mono">{log.timeLabel}</span>
                                    </div>
                                    <p className="text-xs text-[#64748B] leading-relaxed">{log.details}</p>
                                </div>
                            </div>
                        );
                    })}
                    {securityLogs.length === 0 && (
                        <p className="text-center text-xs text-[#64748B] py-4">Không có hoạt động bảo mật nào gần
                            đây.</p>
                    )}
                </div>
                <div className="mt-6 pt-4 text-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/history')}
                        className="w-full max-w-2xl mx-auto border-slate-300 !text-black hover:bg-slate-50"
                    >
                        Xem tất cả hoạt động
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default SecurityPage;
