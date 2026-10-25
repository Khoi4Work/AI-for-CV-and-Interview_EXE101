import {useState, useEffect, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {Package, Camera, Link, Globe, Code, Sparkles, Shield, User, LoaderCircle} from 'lucide-react';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {Card, Button, Input, Badge, SectionHeader} from '../components/Layout.jsx';
import apiClient, { getApiErrorMessage } from '../../../service/apiClient.js';
import { validateProfile } from '../../../utils/inputValidation.js';

const PersonalInfoPage = () => {
    const navigate = useNavigate();
    const {profile, updateProfile, isLoading} = useAuth();
    const {showToast} = useApp();

    const [draft, setDraft] = useState(null);
    const formData = draft?.source === profile ? draft.data : profile;
    const setFormData = update => setDraft(previous => ({
        source: profile,
        data: typeof update === 'function' ? update(previous?.source === profile ? previous.data : profile) : update,
    }));
    const [isSaving, setIsSaving] = useState(false);
    const savingRef = useRef(false);
    const [usageQuota, setUsageQuota] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        let active = true;
        apiClient.get('/v1/payments/quota')
            .then((response) => {
                if (active) setUsageQuota(response.data?.result || response.data?.data);
            })
            .catch(() => { if (active) setUsageQuota(null); });
        return () => { active = false; };
    }, []);

    const handleChange = (e) => {
        if (savingRef.current) return;
        const {name, value} = e.target;
        setValidationErrors((previous) => ({ ...previous, [name]: undefined }));
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (savingRef.current) return;
        const errors = validateProfile(formData);
        setValidationErrors(errors);
        if (Object.keys(errors).length) {
            showToast('Vui lòng kiểm tra lại các trường thông tin được đánh dấu.', 'error');
            return;
        }
        savingRef.current = true;
        setIsSaving(true);
        try {
            await updateProfile({ ...formData, fullName: formData.fullName.trim() });
            showToast('Đã lưu các thay đổi thông tin cá nhân thành công!', 'success');
        } catch (err) {
            showToast(getApiErrorMessage(err), 'error');
        } finally {
            savingRef.current = false;
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setFormData({...profile});
        setValidationErrors({});
        showToast('Đã khôi phục thông tin ban đầu.', 'info');
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

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto pb-12 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#64748B] animate-pulse">Đang tải thông tin cá nhân...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#10B981] mb-2">Cài đặt tài khoản</h1>
                <p className="text-[#94A3B8] text-sm">Quản lý các thông tin cá nhân cốt lõi và các quyền hạn mật thiết
                    của tài khoản bạn.</p>
            </div>

            {/* User Banner */}
            <Card className="mb-8 p-6 bg-[#CBD5E1] border-none">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div
                            className="w-20 h-20 rounded-full border-2 border-[#10B981] flex items-center justify-center bg-white text-[#10B981] font-bold text-2xl shadow-sm">
                            {getInitials(formData.fullName)}
                        </div>
                        <button
                            disabled
                            aria-label="Đổi ảnh đại diện — đang cập nhật"
                            title="Đổi ảnh đại diện đang cập nhật"
                            className="absolute bottom-0 right-0 bg-slate-400 p-1.5 rounded-full border-2 border-[#CBD5E1] text-white cursor-not-allowed"
                        >
                            <Camera size={14}/>
                        </button>
                    </div>
                    <div className="flex-1 ">
                        <h2 className="text-xl font-bold text-[#0F172A]">{formData.fullName || 'Đang tải...'}</h2>
                        <p className="text-[#475569] text-sm mb-3">{formData.email || '...'}</p>
                        <div className="flex gap-2">
                            <Badge variant="light" className="bg-white text-[#475569]">{formData.membershipType || 'Free'}</Badge>
                            <Badge variant="success" className="bg-emerald-500/20 text-emerald-600">Thành viên
                                từ {formData.memberSince || '...'}</Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Subscription Summary */}
            <div className="mb-8">
                <SectionHeader title="Gói dịch vụ" icon={<Package size={18}/>}/>
                <Card className="p-5 bg-[#28615F] border-none">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-[#042F2E] rounded-full"><Shield size={20} className="text-white"/></div>
                            <div>
                                <h4 className="text-white font-medium">CV · {usageQuota?.cvPlan || '—'}</h4>
                                <p className="text-[#CCFBF1] text-sm">Còn {usageQuota?.remainingCvCount ?? '—'} lượt tạo • quota không hết hạn</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="p-3 bg-[#042F2E] rounded-full"><Shield size={20} className="text-white"/></div>
                            <div>
                                <h4 className="text-white font-medium">Interview · {usageQuota?.interviewPlan || '—'}</h4>
                                <p className="text-[#CCFBF1] text-sm">Còn {usageQuota?.remainingInterviewMinutes ?? '—'} phút • quota không hết hạn</p>
                            </div>
                        </div>
                    </div>
                    <Button variant="dark" onClick={() => navigate('/pricing')}>Quản lý gói dịch vụ</Button>
                </Card>
            </div>

            {/* Personal Info Section */}
            <div className="mb-8">
                <SectionHeader title="Thông tin cá nhân" icon={<User size={18}/>}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        disabled={isSaving}
                        label="Họ và tên"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleChange}
                        maxLength={255}
                        aria-invalid={Boolean(validationErrors.fullName)}
                        placeholder="Nhập họ và tên..."
                    />
                    {validationErrors.fullName && <p role="alert" className="text-sm text-red-600">{validationErrors.fullName}</p>}
                    <Input
                        disabled={isSaving}
                        label="Địa chỉ Email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        readOnly
                        maxLength={254}
                        placeholder="Nhập địa chỉ email..."
                    />
                    <p className="text-xs text-slate-500">Email tài khoản không thể thay đổi tại đây.</p>
                    <Input
                        disabled={isSaving}
                        label="Số điện thoại"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        maxLength={24}
                        aria-invalid={Boolean(validationErrors.phone)}
                        placeholder="Nhập số điện thoại..."
                    />
                    {validationErrors.phone && <p role="alert" className="text-sm text-red-600">{validationErrors.phone}</p>}
                    <Input
                        disabled={isSaving}
                        label="Vị trí"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        maxLength={255}
                        placeholder="Thành phố, Quốc gia..."
                    />
                    <div className="md:col-span-2">
                        <Input
                        disabled={isSaving}
                            label="Nghề nghiệp"
                            name="profession"
                            value={formData.profession || ''}
                            onChange={handleChange}
                            maxLength={255}
                            placeholder="Nhập ngành nghề của bạn..."
                        />
                    </div>
                </div>
            </div>

            {/* Career Links Section */}
            <div className="mb-8">
                <SectionHeader title="Liên kết sự nghiệp" icon={<Globe size={18}/>}/>
                <div className="space-y-4">
                    <Input
                        disabled={isSaving}
                        label="URL LinkedIn"
                        name="linkedin"
                        icon={<Link size={16}/>}
                        value={formData.linkedin || ''}
                        onChange={handleChange}
                        maxLength={255}
                        aria-invalid={Boolean(validationErrors.linkedin)}
                        placeholder="https://linkedin.com/in/username"
                    />
                    {validationErrors.linkedin && <p role="alert" className="text-sm text-red-600">{validationErrors.linkedin}</p>}
                    <Input
                        disabled={isSaving}
                        label="URL Portfolio"
                        name="portfolio"
                        icon={<Globe size={16}/>}
                        value={formData.portfolio || ''}
                        onChange={handleChange}
                        maxLength={255}
                        aria-invalid={Boolean(validationErrors.portfolio)}
                        placeholder="https://myportfolio.com"
                    />
                    {validationErrors.portfolio && <p role="alert" className="text-sm text-red-600">{validationErrors.portfolio}</p>}
                    <Input
                        disabled={isSaving}
                        label="URL GitHub"
                        name="github"
                        icon={<Code size={16}/>}
                        value={formData.github || ''}
                        onChange={handleChange}
                        maxLength={255}
                        aria-invalid={Boolean(validationErrors.github)}
                        placeholder="https://github.com/username"
                    />
                    {validationErrors.github && <p role="alert" className="text-sm text-red-600">{validationErrors.github}</p>}
                </div>
            </div>

            {/* Account Settings Summary */}
            <div className="mb-8">
                <SectionHeader title="Cài đặt tài khoản" icon={<Shield size={18}/>}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-5 flex flex-col justify-between bg-[#CBD5E1] border-none shadow-sm ">
                        <h4 className="text-[#0F172A] font-medium mb-1">Quản lý mật khẩu</h4>
                        <p className="text-[#475569] text-sm mb-3">Quản lý mật khẩu và phương thức đăng nhập.</p>
                        <button
                            onClick={() => navigate('/security')}
                            className="text-[#10B981] text-sm font-medium hover:underline text-left"
                        >
                            Đổi mật khẩu ›
                        </button>
                    </Card>
                    <Card className="p-5 flex items-center justify-between gap-3 bg-slate-200 border border-slate-300 shadow-sm">
                        <div>
                            <h4 className="text-[#0F172A] font-medium mb-1">Xác thực hai yếu tố</h4>
                            <p className="text-[#475569] text-sm">Chưa hỗ trợ bật xác thực hai yếu tố.</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Đang cập nhật</span>
                    </Card>
                </div>
            </div>

            {/* AI Suggestion Banner */}
            <Card className="p-4 bg-gradient-to-r from-[#34D399] to-[#10B981] border-none flex items-center gap-3 mb-8">
                <Sparkles size={18} className="text-white"/>
                <span className="text-white font-medium text-sm">
          "Hồ sơ của bạn đang được tối ưu hóa. Hãy bổ sung các dự án thực tế để thu hút nhà tuyển dụng."
        </span>
            </Card>

            {/* Save Action Buttons */}
            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isSaving}
                    className="disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    aria-busy={isSaving}
                    className="gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isSaving && <LoaderCircle size={16} className="animate-spin" aria-hidden="true"/>}
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
            </div>
        </div>
    );
};

export default PersonalInfoPage;
