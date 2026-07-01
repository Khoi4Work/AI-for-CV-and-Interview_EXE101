import React from 'react';
import { Card, Button, Badge } from '../components/ui/core';
import { CheckCircle, Gift, FileText, Mic } from 'lucide-react';

export const SubscriptionPage = () => {
    return (
        <div className="max-w-5xl mx-auto pb-12">

            {/* Current Plan Headers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-12">
                <Card className="lg:col-span-2 p-5 bg-[#E2E8F0]">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="default" className="text-[10px] bg-white text-[#475569]">Đang sử dụng</Badge>
                                <Badge variant="success" className="text-[10px]">🌟 Phổ biến</Badge>
                            </div>
                            <h2 className="text-xl font-bold text-[#0F172A]">Gói CV Middle</h2>
                            <p className="text-[#475569] text-sm">Gói CV 1 lần</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[#475569] text-sm">Hết hạn: 27/2/2027</p>
                        </div>
                    </div>
                    <div className="w-full bg-white rounded-full h-1.5 mb-4">
                        <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="primary" size="sm">Gia hạn ngay</Button>
                        <Button variant="outline" size="sm" className="bg-white">Quản lý thanh toán</Button>
                    </div>
                </Card>

                <Card className="p-5 bg-[#E2E8F0]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-[#0F172A] font-medium">Lịch sử thanh toán</h3>
                        <a href="#" className="text-[#475569] text-xs hover:text-[#0F172A]">Xem tất cả</a>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[#0F172A] text-sm font-medium">15/11/2026</p>
                                <p className="text-[#475569] text-xs">Hóa đơn #00372941</p>
                            </div>
                            <span className="text-[#10B981] text-sm font-bold">39.000 ₫</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[#0F172A] text-sm font-medium">23/10/2026</p>
                                <p className="text-[#475569] text-xs">Hóa đơn #39840072</p>
                            </div>
                            <span className="text-[#10B981] text-sm font-bold">59.000 ₫</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[#0F172A] text-sm font-medium">02/09/2025</p>
                                <p className="text-[#475569] text-xs">Hóa đơn #04542035</p>
                            </div>
                            <span className="text-[#10B981] text-sm font-bold">39.000 ₫</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Chọn gói dịch vụ phù hợp với bạn</h2>
                <p className="text-[#94A3B8]">Bạn có thể mua gói CV hoặc Interview riêng lẻ, hoặc chọn gói combo tiết kiệm.</p>
            </div>

            {/* Combo Plans */}
            <Card className="mb-12 p-6 bg-[#E2E8F0] border-none shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Gift className="text-orange-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#0F172A]">Gói combo tiết kiệm</h3>
                        <p className="text-[#475569] text-sm">Tiết kiệm hơn khi mua CV và Interview</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Combo 1 */}
                    <Card className="p-5 border border-purple-200 bg-white">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Middle All</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#9333EA]">49.000 VNĐ</span>
                            <span className="text-[#94A3B8] text-sm line-through mb-1">98.000 VNĐ</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#9333EA]"/> CV Middle (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#9333EA]"/> Interview Middle</li>
                        </ul>
                        <Button className="w-full bg-[#9333EA] hover:bg-[#7E22CE] text-white">Chọn gói</Button>
                    </Card>

                    {/* Combo 2 */}
                    <Card className="p-5 border border-emerald-500 bg-emerald-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#10B981] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">PHỔ BIẾN NHẤT</div>
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Enhance All</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#10B981]">157.000 VNĐ</span>
                            <span className="text-[#94A3B8] text-sm line-through mb-1">188.000 VNĐ</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> CV Enhance (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Interview Enhance</li>
                        </ul>
                        <Button variant="primary" className="w-full">Chọn gói</Button>
                    </Card>

                    {/* Combo 3 */}
                    <Card className="p-5 border border-orange-200 bg-white">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Thực chiến</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#F97316]">149.000 VNĐ</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#F97316]"/> CV Middle (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#F97316]"/> Interview Enhance</li>
                            <li className="text-xs text-[#94A3B8] mt-2 italic">Dành cho ứng viên tự tin vào CV của mình, cần tập dượt phỏng vấn kỹ.</li>
                        </ul>
                        <Button className="w-full bg-orange-50 text-orange-500 hover:bg-orange-100 border border-orange-200">Chọn gói</Button>
                    </Card>
                </div>
            </Card>

            {/* CV Plans */}
            <Card className="mb-8 p-6 bg-[#E2E8F0] border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A]">Gói CV</h3>
                            <p className="text-[#475569] text-sm">Tất cả để có 1 CV chuẩn ATS</p>
                        </div>
                    </div>
                    <Badge variant="default" className="bg-white text-[#475569]">Đã đổi 0/3 CV</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-white">
                        <h4 className="font-bold text-[#0F172A] mb-1">Cơ bản</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">0 VNĐ <span className="text-sm font-normal text-[#475569]">/ vĩnh viễn</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-300"/> 1 CV</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-300"/> Template cơ bản</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-300"/> Phân tích CV 1 lần (có bảng điểm)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-slate-300"/> Gợi ý kĩ năng</li>
                        </ul>
                        <Button variant="outline" className="w-full bg-slate-50 text-slate-500 border-slate-200">Đang dùng miễn phí</Button>
                    </div>

                    {/* Middle */}
                    <div className="p-5 border border-purple-500 rounded-xl bg-purple-50 relative mt-4 md:mt-0">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9333EA] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">🌟 Phổ biến</div>
                        <h4 className="font-bold text-[#9333EA] mb-1">Middle</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">39.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#9333EA]"/> 10 CV / tháng</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#9333EA]"/> Template cao cấp</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#9333EA]"/> Phân tích CV 5 lần (có bảng điểm)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#9333EA]"/> Gợi ý AI từ ngữ</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#9333EA]"/> Hỗ trợ 2 ngôn ngữ</li>
                        </ul>
                        <Button className="w-full bg-[#9333EA] hover:bg-[#7E22CE] text-white">Nâng cấp</Button>
                    </div>

                    {/* Enhance */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-white">
                        <h4 className="font-bold text-[#0F172A] mb-1">Enhance</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">59.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Vô hạn CV / tháng</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Template cao cấp +</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Phân tích CV Vô hạn (có bảng điểm)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Gợi ý AI AI viết lại đoạn văn</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> AI tối ưu theo Job JD</li>
                        </ul>
                        <Button variant="primary" className="w-full">Nâng cấp</Button>
                    </div>
                </div>
            </Card>

            {/* Interview Plans */}
            <Card className="mb-12 p-6 bg-[#E2E8F0] border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <Mic className="text-[#10B981]" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A]">Gói Interview</h3>
                            <p className="text-[#475569] text-sm">Luyện phỏng vấn và nhận phản hồi chuyên sâu</p>
                        </div>
                    </div>
                    <Button variant="outline" className="text-[#475569] bg-white border-slate-200 hover:bg-slate-50 text-xs h-8 rounded flex items-center gap-2">
                        × Xem so sánh tính năng
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Basic */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-white">
                        <h4 className="font-bold text-[#0F172A] mb-1">Cơ bản</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">0 VNĐ <span className="text-sm font-normal text-[#475569]">/ vĩnh viễn</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-slate-300 shrink-0 mt-0.5"/> Bộ câu hỏi mẫu</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-slate-300 shrink-0 mt-0.5"/> Dựa trên vị trí</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-slate-300 shrink-0 mt-0.5"/> Không có feedback</li>
                        </ul>
                        <Button variant="outline" className="w-full text-slate-500 bg-slate-50 border-slate-200">Dùng thử miễn phí</Button>
                    </div>

                    {/* Middle */}
                    <div className="p-5 border border-purple-500 rounded-xl bg-purple-50 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9333EA] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">★ Phổ biến</div>
                        <h4 className="font-bold text-[#9333EA] mb-1">Middle</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">69.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#9333EA] shrink-0 mt-0.5"/> Mở khóa 10 phút</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#9333EA] shrink-0 mt-0.5"/> Bộ câu hỏi cơ bản</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#9333EA] shrink-0 mt-0.5"/> Fresher, chuyên hóa theo ngành nghề</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#9333EA] shrink-0 mt-0.5"/> Không có feedback chung</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#9333EA] shrink-0 mt-0.5"/> Ghi hình + 3 lần</li>
                        </ul>
                        <Button className="w-full bg-[#9333EA] hover:bg-[#7E22CE] text-white">Nâng cấp</Button>
                    </div>

                    {/* Enhance */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-white">
                        <h4 className="font-bold text-[#0F172A] mb-1">Enhance</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">129.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#10B981] shrink-0 mt-0.5"/> Mở khóa 15 phút</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#10B981] shrink-0 mt-0.5"/> Bộ câu hỏi nâng cao</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#10B981] shrink-0 mt-0.5"/> Phản hồi và chấm điểm chi tiết</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#10B981] shrink-0 mt-0.5"/> Feedback chuyên sâu</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="text-[#10B981] shrink-0 mt-0.5"/> Ghi hình + 6 lần</li>
                        </ul>
                        <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white">Nâng cấp</Button>
                    </div>
                </div>
            </Card>

            {/* Comparison Header */}
            <div className="flex justify-center mb-6">
                <Card className="bg-[#E2E8F0] p-6 text-center max-w-sm rounded-xl border-none">
                    <h3 className="text-[#0F172A] font-bold text-lg mb-1">So sánh chi tiết tính năng</h3>
                    <p className="text-[#475569] text-xs mb-3">Xem và so sánh tất cả tính năng của các gói</p>
                    <Button className="bg-[#0F172A] hover:bg-[#334155] text-white text-xs h-8 rounded-full px-4 flex items-center justify-center mx-auto gap-2">
                        × Xem bảng so sánh
                    </Button>
                </Card>
            </div>

            {/* Comparison Table */}
            <Card className="bg-[#E2E8F0] rounded-xl overflow-hidden mb-12 border-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-[#475569]">
                        <thead className="bg-[#0F172A] text-white">
                        <tr>
                            <th className="py-4 px-6 font-semibold min-w-[200px] border-r border-slate-700">TÍNH NĂNG</th>
                            <th colSpan={3} className="py-4 px-6 text-center bg-white/5 font-bold text-[#10B981] border-r border-slate-700">GÓI CV</th>
                            <th colSpan={3} className="py-4 px-6 text-center bg-white/5 font-bold text-[#10B981]">GÓI INTERVIEW</th>
                        </tr>
                        <tr className="bg-[#CBD5E1] text-[#0F172A] text-center font-bold">
                            <th className="py-3 px-6 text-left border-r border-slate-300"></th>

                            {/* CV Columns */}
                            <th className="py-3 px-4 w-28 border-b border-slate-300">Cơ bản</th>
                            <th className="py-3 px-4 w-28 text-[#9333EA] border-b border-slate-300">Middle</th>
                            <th className="py-3 px-4 w-28 text-[#10B981] border-r border-slate-300 border-b border-slate-300">Enhance</th>

                            {/* Interview Columns */}
                            <th className="py-3 px-4 w-28 border-b border-slate-300">Cơ bản</th>
                            <th className="py-3 px-4 w-28 text-[#9333EA] border-b border-slate-300">Middle</th>
                            <th className="py-3 px-4 w-28 text-[#10B981] border-b border-slate-300">Enhance</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300 text-center bg-[#E2E8F0]">
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Số lượng CV</td>
                            <td>1 CV</td>
                            <td>5 CV / tháng</td>
                            <td className="border-r border-slate-300">10 CV / tháng</td>
                            <td>–</td>
                            <td>–</td>
                            <td>–</td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Template</td>
                            <td>Cơ bản</td>
                            <td>Cao cấp</td>
                            <td className="border-r border-slate-300">Cao cấp +</td>
                            <td>–</td>
                            <td>Cơ bản</td>
                            <td>Nâng cao</td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Phân tích CV (Có bảng điểm)</td>
                            <td>1 lần</td>
                            <td>5 lần</td>
                            <td className="border-r border-slate-300">10 lần</td>
                            <td>–</td>
                            <td>–</td>
                            <td><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Gợi ý kỹ năng</td>
                            <td>–</td>
                            <td><CheckCircle size={18} className="mx-auto text-[#9333EA]" /></td>
                            <td className="border-r border-slate-300"><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                            <td>–</td>
                            <td>–</td>
                            <td>–</td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Gợi ý ngữ nghĩa, câu từ</td>
                            <td>–</td>
                            <td><CheckCircle size={18} className="mx-auto text-[#9333EA]" /></td>
                            <td className="border-r border-slate-300"><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                            <td>–</td>
                            <td>–</td>
                            <td>–</td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">AI chỉnh sửa / Tối ưu CV</td>
                            <td>–</td>
                            <td>–</td>
                            <td className="border-r border-slate-300"><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                            <td>–</td>
                            <td>–</td>
                            <td>–</td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Số phút phỏng vấn</td>
                            <td>–</td>
                            <td>–</td>
                            <td className="border-r border-slate-300">–</td>
                            <td>–</td>
                            <td>10 phút</td>
                            <td>15 phút</td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Feedback và chấm điểm</td>
                            <td>–</td>
                            <td>–</td>
                            <td className="border-r border-slate-300">–</td>
                            <td>–</td>
                            <td>–</td>
                            <td>–</td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Feedback chuyên sâu</td>
                            <td>–</td>
                            <td>–</td>
                            <td className="border-r border-slate-300">–</td>
                            <td>–</td>
                            <td>–</td>
                            <td><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                        </tr>
                        <tr>
                            <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Ghi hình</td>
                            <td>–</td>
                            <td>–</td>
                            <td className="border-r border-slate-300">–</td>
                            <td>–</td>
                            <td>3 lần</td>
                            <td>6 lần</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

        </div>
    );
};
