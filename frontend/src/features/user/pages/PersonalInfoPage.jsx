import React, {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Package, Camera, Link, Globe, Code, Sparkles, Shield, User, FileText, ChevronRight} from 'lucide-react';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {Card, Button, Input, Toggle, Badge, SectionHeader} from '../components/Layout.jsx';
import { Footer } from '../../../components/layout/Footer.jsx';
import apiClient, { getApiErrorMessage } from '../../../service/apiClient.js';

const PersonalInfoPage = () => {
    const navigate = useNavigate();
    const {profile, updateProfile, handle2faToggle, is2faEnabled, isLoading} = useAuth();
    const {cvs, showToast} = useApp();

    const [formData, setFormData] = useState({...profile});
    const [local2fa, setLocal2fa] = useState(is2faEnabled);

    useEffect(() => {
        setFormData({...profile});
    }, [profile]);

    useEffect(() => {
        setLocal2fa(is2faEnabled);
    }, [is2faEnabled]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        try {
            await updateProfile(formData);
            handle2faToggle(local2fa);
            showToast('Đã lưu các thay đổi thông tin cá nhân thành công!', 'success');
        } catch (err) {
            showToast(getApiErrorMessage(err), 'error');
        }
    };

    const handleReset = () => {
        setFormData({...profile});
        setLocal2fa(is2faEnabled);
        showToast('Đã khôi phục thông tin ban đầu.', 'info');
    };

    const handlePhotoUpload = () => {
        showToast('Đang tải ảnh đại diện lên...', 'info');
        setTimeout(() => {
            showToast('Đã cập nhật ảnh đại diện thành công!', 'success');
        }, 1500);
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
                            onClick={handlePhotoUpload}
                            className="absolute bottom-0 right-0 bg-[#10B981] p-1.5 rounded-full border-2 border-[#CBD5E1] text-white hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer"
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

            {/* Personal Info Section */}
            <div className="mb-8">
                <SectionHeader title="Thông tin cá nhân" icon={<User size={18}/>}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Họ và tên"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên..."
                    />
                    <Input
                        label="Địa chỉ Email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        placeholder="Nhập địa chỉ email..."
                    />
                    <Input
                        label="Số điện thoại"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        placeholder="Nhập số điện thoại..."
                    />
                    <Input
                        label="Vị trí"
                        name="location"
                        value={formData.location || ''}
                        onChange={handleChange}
                        placeholder="Thành phố, Quốc gia..."
                    />
                    <div className="md:col-span-2">
                        <Input
                            label="Nghề nghiệp"
                            name="profession"
                            value={formData.profession || ''}
                            onChange={handleChange}
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
                        label="URL LinkedIn"
                        name="linkedin"
                        icon={<Link size={16}/>}
                        value={formData.linkedin || ''}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                    />
                    <Input
                        label="URL Portfolio"
                        name="portfolio"
                        icon={<Globe size={16}/>}
                        value={formData.portfolio || ''}
                        onChange={handleChange}
                        placeholder="https://myportfolio.com"
                    />
                    <Input
                        label="URL GitHub"
                        name="github"
                        icon={<Code size={16}/>}
                        value={formData.github || ''}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                    />
                </div>
            </div>

            {/* Account Settings Summary */}
            <div className="mb-8">
                <SectionHeader title="Cài đặt tài khoản" icon={<Shield size={18}/>}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-5 flex flex-col justify-between bg-[#CBD5E1] border-none shadow-sm ">
                        <h4 className="text-[#0F172A] font-medium mb-1">Quản lý mật khẩu</h4>
                        <p className="text-[#475569] text-sm mb-3">Cập nhật lần cuối 3 tháng trước.</p>
                        <button
                            onClick={() => navigate('/security')}
                            className="text-[#10B981] text-sm font-medium hover:underline text-left"
                        >
                            Đổi mật khẩu ›
                        </button>
                    </Card>
                    <Card className="p-5 flex items-center justify-between bg-[#CBD5E1]  border-none shadow-sm">
                        <div>
                            <h4 className="text-[#0F172A] font-medium mb-1">Xác thực hai yếu tố</h4>
                            <p className="text-[#475569] text-sm">Tăng cường bảo vệ tài khoản.</p>
                        </div>
                        <Toggle
                            checked={local2fa}
                            onChange={(checked) => {
                                setLocal2fa(checked);
                                showToast(
                                    checked ? 'Đã kích hoạt 2FA tạm thời. Hãy nhấp Lưu thay đổi!' : 'Đã ấn tắt 2FA tạm thời. Hãy nhấp Lưu thay đổi!',
                                    'info'
                                );
                            }}
                        />
                    </Card>
                </div>
            </div>

            {/* My CVs Summary */}
            <div className="mb-8 ">
                <div className="flex items-center justify-between mb-4 " >
                    <SectionHeader title="CV của tôi" icon={<FileText size={18}/>}/>
                    <button
                        onClick={() => navigate('/my-cvs')}
                        className="text-[#10B981] text-sm font-medium hover:underline"
                    >
                        Xem tất cả
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(cvs || []).slice(0, 2).map((cv) => (
                        <Card key={cv.id }
                              className="p-4 flex items-center justify-between bg-[#CBD5E1]  border-none shadow-sm">
                            <div>
                                <h4 className="text-[#0F172A] font-medium">{cv.title}</h4>
                                <p className="text-[#475569] text-xs">
                                    {cv.status} • Cập nhật {cv.updatedAt}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate('/my-cvs')}
                            >
                                Chỉnh sửa
                            </Button>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Subscription Summary */}
            <div className="mb-8">
                <SectionHeader title="Gói dịch vụ" icon={<Package size={18}/>}/>
                <Card
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#28615F] border-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#042F2E] rounded-full">
                            <Shield size={20} className="text-white"/>
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Gói {profile.membershipType}</h4>
                            <p className="text-[#CCFBF1] text-sm">Thanh toán hằng năm • Gia hạn vào 12 thg 12, 2026</p>
                        </div>
                    </div>
                    <Button
                        variant="dark"
                        onClick={() => navigate('/pricing')}
                    >
                        Quản lý gói dịch vụ
                    </Button>
                </Card>
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
                >
                    Hủy
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSave}
                >
                    Lưu thay đổi
                </Button>
            </div>
        </div>
    );
};

export default PersonalInfoPage;