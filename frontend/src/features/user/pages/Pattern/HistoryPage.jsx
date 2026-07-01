import React from 'react';
import { Card, Badge, Button } from '../components/ui/core';
import { Video, Sparkles, Edit3, Download, PlusCircle, LogIn, ChevronDown, FileText } from 'lucide-react';

export const HistoryPage = () => {
    const filters = ['Tất cả', 'Tạo CV', 'AI Tối ưu', 'Tải xuống', 'Phỏng vấn'];

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Lịch sử hoạt động</h1>
            </div>

            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4 bg-[#E2E8F0] p-1.5 rounded-xl flex-1">
                    <span className="text-sm text-[#0F172A] font-medium ml-3">Lọc theo:</span>
                    <div className="flex flex-wrap gap-2">
                        {filters.map((filter, index) => (
                            <button
                                key={index}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                    index === 0
                                        ? 'bg-[#10B981] text-white shadow-sm'
                                        : 'bg-white text-[#475569] hover:bg-gray-50'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[#E2E8F0] p-2 px-4 rounded-xl flex items-center justify-between gap-8 h-12">
                    <span className="text-xs text-[#475569]">Tổng hoạt động</span>
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#10B981]">
                        <FileText size={16} />
                    </div>
                </div>
            </div>

            {/* Timeline Container */}
            <div className="bg-[#E2E8F0] rounded-2xl p-6 sm:p-8 relative">
                {/* Continuous vertical line */}
                <div className="absolute left-12 sm:left-14 top-12 bottom-12 w-[2px] bg-white"></div>

                {/* Today Header */}
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-10 sm:w-12 h-0 border-t-2 border-white"></div>
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider bg-[#E2E8F0] px-2">HÔM NAY</span>
                    <div className="flex-1 border-t-2 border-white"></div>
                </div>

                <div className="space-y-6 mb-8 pl-4 sm:pl-6">
                    {/* Item 1: Mock Interview */}
                    <div className="relative flex gap-6 group">
                        <div className="absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full bg-white border-4 border-[#E2E8F0] flex items-center justify-center z-10 shadow-sm">
                            <Video size={18} className="text-[#10B981]" />
                        </div>
                        <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-[#10B981]">Phỏng vấn giả lập: UI/UX Designer</h3>
                                <span className="text-[#64748B] text-sm font-medium">15:45</span>
                            </div>
                            <div className="bg-[#F1F5F9] rounded-lg p-3 mb-4">
                                <p className="text-sm text-[#0F172A]">
                                    <span className="font-bold text-[#10B981]">Điểm: 8.5/10</span> - AI nhận xét: Giao tiếp tốt, cần cải thiện ngôn ngữ cơ thể và cách giải thích quy trình thiết kế.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="success" className="bg-[#10B981] text-white">Mock Interview</Badge>
                                <a href="#" className="text-xs text-[#10B981] hover:underline transition-colors">Xem chi tiết ›</a>
                            </div>
                        </Card>
                    </div>

                    {/* Item 2: AI Opt */}
                    <div className="relative flex gap-6 group">
                        <div className="absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full bg-[#7D5BE2] border-4 border-[#E2E8F0] flex items-center justify-center z-10 shadow-sm">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-[#7D5BE2]">AI tối ưu hóa hồ sơ</h3>
                                <span className="text-[#64748B] text-sm font-medium">14:30</span>
                            </div>
                            <p className="text-[#475569] text-sm mb-4">Hệ thống AI đã tự động tối ưu hóa phần "Kỹ năng chuyên môn" cho CV "Frontend Developer_2024".</p>
                            <div className="flex items-center gap-3">
                                <Badge variant="purple" className="bg-[#EDE9FE] text-[#7D5BE2]">AI Suggestion</Badge>
                                <a href="#" className="text-xs text-[#10B981] hover:underline transition-colors">Xem chi tiết ›</a>
                            </div>
                        </Card>
                    </div>

                    {/* Item 3: Edit CV */}
                    <div className="relative flex gap-6 group">
                        <div className="absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full bg-white border-4 border-[#E2E8F0] flex items-center justify-center z-10 shadow-sm">
                            <Edit3 size={18} className="text-[#64748B]" />
                        </div>
                        <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-[#0F172A]">Chỉnh sửa CV</h3>
                                <span className="text-[#64748B] text-sm font-medium">10:15</span>
                            </div>
                            <p className="text-[#475569] text-sm">Bạn đã cập nhật thông tin tại mục "Kinh nghiệm làm việc" trong hồ sơ "Marketing Manager".</p>
                        </Card>
                    </div>
                </div>

                {/* Yesterday Header */}
                <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-10 sm:w-12 h-0 border-t-2 border-white"></div>
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider bg-[#E2E8F0] px-2">HÔM QUA</span>
                    <div className="flex-1 border-t-2 border-white"></div>
                </div>

                <div className="space-y-6 pl-4 sm:pl-6">
                    {/* Item 4: Mock Interview */}
                    <div className="relative flex gap-6 group">
                        <div className="absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full bg-white border-4 border-[#E2E8F0] flex items-center justify-center z-10 shadow-sm">
                            <Video size={18} className="text-[#10B981]" />
                        </div>
                        <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-[#10B981]">Phỏng vấn giả lập: Frontend Developer</h3>
                                <span className="text-[#64748B] text-sm font-medium">14:20</span>
                            </div>
                            <div className="bg-[#F1F5F9] rounded-lg p-3 mb-4">
                                <p className="text-sm text-[#0F172A]">
                                    <span className="font-bold text-[#10B981]">Điểm: 7.8/10</span> - AI nhận xét: Kiến thức kỹ thuật vững, tuy nhiên cần tự tin hơn khi trả lời các câu hỏi về xử lý tình huống.
                                </p>
                                <p className="text-sm text-[#0F172A] mt-2 font-medium">Lý tình huống.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="success" className="bg-[#10B981] text-white">Mock Interview</Badge>
                                <a href="#" className="text-xs text-[#10B981] hover:underline transition-colors">Xem chi tiết ›</a>
                            </div>
                        </Card>
                    </div>

                    {/* Item 5: Download */}
                    <div className="relative flex gap-6 group">
                        <div className="absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full bg-[#10B981] border-4 border-[#E2E8F0] flex items-center justify-center z-10 shadow-sm">
                            <Download size={18} className="text-white" />
                        </div>
                        <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-[#0F172A]">Tải xuống PDF</h3>
                                <span className="text-[#64748B] text-sm font-medium">16:45</span>
                            </div>
                            <p className="text-[#475569] text-sm mb-2">Đã xuất file PDF thành công cho CV</p>
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-[#64748B]"/> <span className="text-xs text-[#64748B]">2.4 MB • Hoàn tất</span>
                            </div>
                        </Card>
                    </div>

                    {/* Item 6: Create */}
                    <div className="relative flex gap-6 group">
                        <div className="absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full bg-white border-4 border-[#E2E8F0] flex items-center justify-center z-10 shadow-sm">
                            <PlusCircle size={18} className="text-[#10B981]" />
                        </div>
                        <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-[#0F172A]">Tạo CV mới</h3>
                                <span className="text-[#64748B] text-sm font-medium">09:00</span>
                            </div>
                            <p className="text-[#475569] text-sm">Bắt đầu khởi tạo CV mới với template</p>
                        </Card>
                    </div>

                    {/* Item 7: Login */}
                    <div className="relative flex gap-6 group">
                        <div className="absolute -left-[45px] sm:-left-[53px] mt-1 w-10 h-10 rounded-full bg-white border-4 border-[#E2E8F0] flex items-center justify-center z-10 shadow-sm">
                            <LogIn size={18} className="text-[#64748B]" />
                        </div>
                        <Card className="flex-1 p-5 bg-white border-none shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-[#10B981]">Smartfolio</h3>
                                <span className="text-[#64748B] text-sm font-medium">08:55</span>
                            </div>
                            <p className="text-[#475569] text-sm">Đăng nhập từ trình duyệt Chrome trên thiết bị MacOS (IP: 114.xxx.xxx.xx).</p>
                        </Card>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Button variant="outline" className="rounded-full px-6 flex items-center gap-2 bg-white text-[#0F172A] border-none shadow-sm">
                        Tải thêm hoạt động <ChevronDown size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};
