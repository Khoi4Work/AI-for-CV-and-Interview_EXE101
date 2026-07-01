import React, { useState } from 'react';
import { Card, Button, Input, Toggle, Badge, SectionHeader } from '../components/ui/core';
import { User, Share2, Globe, Code, Shield, FileText, Package, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface ProfilePageProps {
    setActiveTab: (tab: TabType) => void;
}

export const ProfilePage = ({ setActiveTab }: ProfilePageProps) => {
    const [twoFactor, setTwoFactor] = useState(true);

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#10B981] mb-2">Cài đặt tài khoản</h1>
                <p className="text-[#94A3B8] text-sm">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
            </div>

            {/* User Banner */}
            <Card className="mb-8 p-6 bg-[#CBD5E1]">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 border-[#10B981] flex items-center justify-center bg-transparent">
                            <User size={32} className="text-[#10B981]" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-[#10B981] p-1 rounded-full border-2 border-[#CBD5E1]">
                            <User size={12} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#0F172A]">User</h2>
                        <p className="text-[#475569] text-sm mb-3">@example.com</p>
                        <div className="flex gap-2">
                            <Badge variant="light">THÀNH VIÊN</Badge>
                            <Badge variant="success">Thành viên từ 2026</Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Personal Info */}
            <div className="mb-8">
                <SectionHeader title="Thông tin cá nhân" icon={<User size={18} />} titleClassName="text-white" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Họ và tên" defaultValue="Họ và tên" labelClassName="text-white" />
                    <Input label="Địa chỉ Email" defaultValue="User@example.com" labelClassName="text-white" />
                    <Input label="Số điện thoại" defaultValue="0123 355 7890" labelClassName="text-white" />
                    <Input label="Vị trí" defaultValue="Thành viên" labelClassName="text-white" />
                    <div className="md:col-span-2">
                        <Input label="Nghề nghiệp" defaultValue="Nghề nghiệp" labelClassName="text-white" />
                    </div>
                </div>
            </div>

            {/* Career Links */}
            <div className="mb-8">
                <SectionHeader title="Liên kết sự nghiệp" icon={<Share2 size={18} />} titleClassName="text-white" />
                <div className="space-y-4">
                    <Input label="URL LinkedIn" icon={<Share2 size={16} />} placeholder="https://url.linkedtie.com/" defaultValue="https://url.linkedtie.com/" labelClassName="text-white" />
                    <Input label="URL Portfolio" icon={<Globe size={16} />} placeholder="https://www.portfolio.com/" defaultValue="https://www.portfolio.com/" labelClassName="text-white" />
                    <Input label="URL GitHub" icon={<Code size={16} />} placeholder="https://url.github.com/" defaultValue="https://url.github.com/" labelClassName="text-white" />
                </div>
            </div>

            {/* Account Settings Summary */}
            <div className="mb-8">
                <SectionHeader title="Cài đặt tài khoản" icon={<Shield size={18} />} titleClassName="text-white" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-5 flex flex-col justify-center">
                        <h4 className="text-[#0F172A] font-medium mb-1">Quản lý mật khẩu</h4>
                        <p className="text-[#475569] text-sm mb-3">Cập nhật lần cuối 3 tháng trước.</p>
                        <button onClick={() => setActiveTab('security')} className="text-[#0F766E] text-sm font-medium hover:underline text-left">Đổi mật khẩu ›</button>
                    </Card>
                    <Card className="p-5 flex items-center justify-between">
                        <div>
                            <h4 className="text-[#0F172A] font-medium mb-1">Xác thực hai yếu tố</h4>
                            <p className="text-[#475569] text-sm">Tăng cường bảo vệ tài khoản.</p>
                        </div>
                        <Toggle checked={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
                    </Card>
                </div>
            </div>

            {/* My CVs Summary */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <SectionHeader title="CV của tôi" icon={<FileText size={18} />} className="mb-0" titleClassName="text-white" />
                    <button onClick={() => setActiveTab('my-cvs')} className="text-[#10B981] text-sm font-medium hover:underline">Xem tất cả</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-[#0F172A] font-medium">IT helpdesk</h4>
                            <p className="text-[#475569] text-xs">Hoàn thành • Cập nhật 2 ngày trước</p>
                        </div>
                        <Button variant="secondary" size="sm">Chỉnh sửa</Button>
                    </Card>
                    <Card className="p-4 flex items-center justify-between">
                        <div>
                            <h4 className="text-[#0F172A] font-medium">IT leader</h4>
                            <p className="text-[#475569] text-xs">Bản nháp • Cập nhật 5 giờ trước</p>
                        </div>
                        <Button variant="secondary" size="sm">Chỉnh sửa</Button>
                    </Card>
                </div>
            </div>

            {/* Subscription Summary */}
            <div className="mb-8">
                <SectionHeader title="Gói dịch vụ" icon={<Package size={18} />} titleClassName="text-white" />
                <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#115E59]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#042F2E] rounded-full">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Gói Pro</h4>
                            <p className="text-[#CCFBF1] text-sm">Thanh toán hằng năm • Gia hạn vào 12 thg 12, 2026</p>
                        </div>
                    </div>
                    <Button variant="dark" onClick={() => setActiveTab('subscription')}>Quản lý gói dịch vụ</Button>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mb-8">
                <Button variant="outline">Hủy</Button>
                <Button variant="primary">Lưu thay đổi</Button>
            </div>

            {/* AI Suggestion Banner */}
            <Card className="p-4 bg-gradient-to-r from-[#34D399] to-[#10B981] border-none flex items-center gap-3">
                <Sparkles size={18} className="text-white" />
                <span className="text-white font-medium text-sm">Gợi ý từ AI</span>
            </Card>
        </div>
    );
};
