import {useRef, useState} from 'react';
import {Shield, ShieldCheck, Laptop, RefreshCw, KeyRound, LoaderCircle} from 'lucide-react';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {getApiErrorMessage} from '../../../service/apiClient.js';
import {Card, Button, Input, SectionHeader} from '../components/Layout.jsx';

const upcomingFeatures = [
    {title: 'Xác thực hai lớp (2FA)', icon: ShieldCheck,
        description: 'Xác thực bằng ứng dụng Authenticator và SMS đang được phát triển. Bạn chưa thể bật 2FA tại đây.',
        action: 'Thiết lập 2FA'},
    {title: 'Thiết bị đã đăng nhập', icon: Laptop,
        description: 'Danh sách thiết bị và chức năng thu hồi phiên đăng nhập đang được cập nhật.',
        action: 'Quản lý thiết bị'},
    {title: 'Lịch sử hoạt động bảo mật', icon: RefreshCw,
        description: 'Nhật ký đăng nhập và các thay đổi bảo mật chưa được cung cấp tại đây.',
        action: 'Xem lịch sử bảo mật'},
];

export default function SecurityPage() {
    const {changePassword, isLoading, profile} = useAuth();
    const {showToast} = useApp();
    const [state, setState] = useState({currentPassword: '', newPassword: '', confirmPassword: ''});
    const [saving, setSaving] = useState(false);
    const savingRef = useRef(false);

    const handleUpdatePassword = async event => {
        event.preventDefault();
        if (savingRef.current) return;
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
        savingRef.current = true;
        setSaving(true);
        try {
            await changePassword({oldPassword: currentPassword, newPassword});
            showToast('Cập nhật mật khẩu thành công!', 'success');
            setState({currentPassword: '', newPassword: '', confirmPassword: ''});
        } catch (error) {
            showToast(getApiErrorMessage(error), 'error');
        } finally {
            savingRef.current = false;
            setSaving(false);
        }
    };

    if (isLoading) return <div role="status" className="flex min-h-[60vh] items-center justify-center gap-3 text-slate-400">
        <LoaderCircle className="animate-spin" aria-hidden="true"/>Đang tải cài đặt bảo mật...
    </div>;

    return <div className="mx-auto max-w-4xl pb-12">
        <div className="mb-8">
            <h1 className="mb-2 text-2xl font-bold text-[#10B981]">Bảo mật tài khoản</h1>
            <p className="text-sm text-slate-400">Quản lý mật khẩu. Các tính năng bảo mật bổ sung đang được cập nhật.</p>
        </div>
        {profile?.provider !== 'GOOGLE' ? <Card className="mb-8 rounded-2xl border-none bg-[#C2CFCD] p-6 shadow-sm">
            <SectionHeader title="Đổi mật khẩu" icon={<KeyRound size={18}/>} titleClassName="text-slate-900"/>
            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-4" aria-busy={saving}>
                <fieldset disabled={saving} className="min-w-0 space-y-4">
                    <Input label="Mật khẩu hiện tại" type="password" autoComplete="current-password"
                        value={state.currentPassword} onChange={event => setState({...state, currentPassword: event.target.value})}
                        placeholder="••••••••" labelClassName="text-slate-900"/>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Input label="Mật khẩu mới" type="password" autoComplete="new-password"
                            value={state.newPassword} onChange={event => setState({...state, newPassword: event.target.value})}
                            placeholder="••••••••" labelClassName="text-slate-900"/>
                        <Input label="Xác nhận mật khẩu" type="password" autoComplete="new-password"
                            value={state.confirmPassword} onChange={event => setState({...state, confirmPassword: event.target.value})}
                            placeholder="••••••••" labelClassName="text-slate-900"/>
                    </div>
                    <div className="flex justify-end pt-2"><Button type="submit" disabled={saving}
                        className="gap-2 disabled:cursor-not-allowed disabled:opacity-60">
                        {saving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true"/>}
                        {saving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                    </Button></div>
                </fieldset>
            </form>
        </Card> : <Card className="mb-8 flex items-start gap-4 rounded-2xl bg-slate-100 p-6">
            <Shield size={28} className="shrink-0 text-emerald-700"/>
            <div><h2 className="mb-2 font-semibold text-slate-900">Đăng nhập qua Google</h2>
                <p className="text-sm text-slate-600">Bạn đang sử dụng tài khoản Google để đăng nhập. Vui lòng quản lý mật khẩu trực tiếp trong cài đặt tài khoản Google.</p></div>
        </Card>}
        <div className="grid gap-4 sm:grid-cols-2">
            {upcomingFeatures.map(({title, icon: Icon, description, action}) => <Card key={title}
                className="rounded-2xl border border-slate-300 bg-slate-200 p-5 shadow-none">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <Icon size={20} className="text-slate-500" aria-hidden="true"/>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Đang cập nhật</span>
                </div>
                <h2 className="mb-2 font-semibold text-slate-700">{title}</h2>
                <p className="mb-4 text-sm leading-relaxed text-slate-600">{description}</p>
                <button type="button" disabled aria-label={`${action} — đang cập nhật`}
                    className="cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500">{action}</button>
            </Card>)}
        </div>
    </div>;
}
