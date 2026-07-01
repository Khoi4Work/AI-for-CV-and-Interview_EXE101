import React, { useState } from 'react';
import { Card, Button, Input, Toggle, Badge, SectionHeader } from '../components/ui/core';
import { ShieldCheck, Smartphone, MessageSquare, Monitor, Clock, LogIn, Key, AlertCircle, ArrowRight } from 'lucide-react';

export const SecurityPage = () => {
    const [appAuth, setAppAuth] = useState(true);
    const [smsAuth, setSmsAuth] = useState(false);

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#10B981] mb-2">Bảo mật</h1>
                <p className="text-[#94A3B8] text-sm">Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.</p>
            </div>

            {/* Change Password */}
            <Card className="mb-8 p-6 bg-[#CBD5E1]">
                <SectionHeader title="Đổi mật khẩu" titleClassName="text-[#0F172A]" icon={<Clock size={18} className="transform -scale-x-100" />} />
                <div className="space-y-4 mb-4">
                    <Input label="Mật khẩu hiện tại" type="password" defaultValue="••••••••" labelClassName="text-[#0F172A]" inputClassName="bg-[#E2E8F0] text-[#0F172A]" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Mật khẩu mới" type="password" defaultValue="••••••••" labelClassName="text-[#0F172A]" inputClassName="bg-[#E2E8F0] text-[#0F172A]" />
                        <Input label="Nhập lại mật khẩu mới" type="password" defaultValue="••••••••" labelClassName="text-[#0F172A]" inputClassName="bg-[#E2E8F0] text-[#0F172A]" />
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <Button variant="primary" className="bg-[#34D399] text-[#064E3B] hover:bg-[#10B981]">Cập nhật mật khẩu</Button>
                </div>
            </Card>

            {/* 2FA */}
            <Card className="mb-8 p-6 bg-[#D1FAE5]">
                <SectionHeader title="Xác thực 2 lớp (2FA)" titleClassName="text-[#0F172A]" icon={<ShieldCheck size={18} />} />
                <p className="text-[#475569] text-sm mb-6">Thêm một lớp bảo mật cho tài khoản của bạn để ngăn chặn truy cập trái phép.</p>

                <div className="space-y-4">
                    <Card className="p-5 border-none bg-white">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="mt-1"><Smartphone size={24} className="text-[#0F172A]" /></div>
                                <div>
                                    <h4 className="text-[#0F172A] font-medium text-lg">Authenticator App</h4>
                                    <p className="text-[#475569] text-sm">Khuyên dùng</p>
                                </div>
                            </div>
                            <button className="text-[#475569]"><ArrowRight size={20} /></button>
                        </div>
                    </Card>

                    <Card className="p-5 border-none bg-white">
                        <div className="flex items-start justify-between">
                            <div className="flex gap-4">
                                <div className="mt-1"><MessageSquare size={24} className="text-[#0F172A]" /></div>
                                <div>
                                    <h4 className="text-[#0F172A] font-medium text-lg">Tin nhắn SMS</h4>
                                    <p className="text-[#475569] text-sm">Qua số điện thoại</p>
                                </div>
                            </div>
                            <button className="text-[#475569]"><ArrowRight size={20} /></button>
                        </div>
                    </Card>

                    <div className="bg-[#A7F3D0]/30 rounded-lg p-4 flex gap-2 items-start mt-4">
                        <AlertCircle size={18} className="text-[#059669] shrink-0 mt-0.5" />
                        <p className="text-sm text-[#059669]">2FA hiện đang Tắt. Chúng tôi khuyên bạn nên kích hoạt ngay để bảo vệ dữ liệu CV.</p>
                    </div>
                </div>
            </Card>

            {/* Logged in Devices */}
            <Card className="mb-8 p-6">
                <div className="flex items-center justify-between mb-6">
                    <SectionHeader title="Thiết bị đã đăng nhập" titleClassName="text-[#0F172A]" icon={<Monitor size={18} />} className="mb-0" />
                    <button className="text-[#10B981] text-sm font-medium hover:underline">Đăng xuất tất cả</button>
                </div>
                <p className="text-[#475569] text-sm mb-6 -mt-4">Quản lý các trình duyệt và thiết bị đang truy cập tài khoản của bạn.</p>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#F1F5F9] rounded-xl">
                        <div className="flex items-center gap-4">
                            <Monitor size={24} className="text-[#475569]" />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="text-[#0F172A] font-medium">MacBook Pro - Chrome</h4>
                                    <Badge variant="success" className="text-[10px]">THIẾT BỊ NÀY</Badge>
                                </div>
                                <p className="text-[#64748B] text-sm">TP. Hồ Chí Minh, Việt Nam • Đang hoạt động</p>
                            </div>
                        </div>
                        <button className="text-[#94A3B8] hover:text-[#0F172A]"><ArrowRight size={20} /></button>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-[#F1F5F9] rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <Smartphone size={24} className="text-[#475569]" />
                            <div>
                                <h4 className="text-[#0F172A] font-medium">iPhone 15 Pro - Safari</h4>
                                <p className="text-[#64748B] text-sm">Hà Nội, Việt Nam • 2 giờ trước</p>
                            </div>
                        </div>
                        <button className="text-[#94A3B8] hover:text-[#0F172A]"><ArrowRight size={20} /></button>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-[#F1F5F9] rounded-xl transition-colors">
                        <div className="flex items-center gap-4">
                            <Monitor size={24} className="text-[#475569]" />
                            <div>
                                <h4 className="text-[#0F172A] font-medium">Windows PC - Edge</h4>
                                <p className="text-[#64748B] text-sm">Đà Nẵng, Việt Nam • 3 ngày trước</p>
                            </div>
                        </div>
                        <button className="text-[#94A3B8] hover:text-[#0F172A]"><ArrowRight size={20} /></button>
                    </div>
                </div>
            </Card>

            {/* Security History */}
            <Card className="p-6">
                <SectionHeader title="Lịch sử hoạt động bảo mật" titleClassName="text-[#0F172A]" icon={<Clock size={18} className="transform -scale-x-100" />} />

                <div className="mt-6 space-y-6">
                    <div className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <LogIn size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-[#0F172A] font-medium">Đăng nhập thành công</h4>
                                <span className="text-[#64748B] text-sm">Hôm nay, 08:45</span>
                            </div>
                            <p className="text-[#475569] text-sm">Trình duyệt Chrome trên macOS (IP: 113.161.xx.xx)</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <Key size={16} className="text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-[#0F172A] font-medium">Thay đổi mật khẩu</h4>
                                <span className="text-[#64748B] text-sm">15 thg 10, 2026</span>
                            </div>
                            <p className="text-[#475569] text-sm">Mật khẩu tài khoản đã được cập nhật thành công.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                            <ShieldCheck size={16} className="text-red-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-[#0F172A] font-medium">Cố gắng đăng nhập thất bại</h4>
                                <span className="text-[#64748B] text-sm">12 thg 10, 2026</span>
                            </div>
                            <p className="text-[#475569] text-sm">Có 3 lần thử đăng nhập sai từ một vị trí lạ (Campuchia).</p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 text-center">
                    <Button variant="outline" className="w-full max-w-xs mx-auto border-[#94A3B8] text-[#0F172A] hover:bg-[#CBD5E1]">Xem tất cả hoạt động</Button>
                </div>
            </Card>
        </div>
    );
};
