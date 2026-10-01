import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    HelpCircle,
    CheckCircle,
    Gift,
    FileText,
    Mic,
    Download,
    HeartHandshake
} from 'lucide-react';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import {Card, Button, Badge} from '../components/Layout.jsx';

const PricingPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [comparisonType, setComparisonType] = useState(null); // 'cv' | 'interview' | null
    const {showToast} = useApp();
    const navigate = useNavigate();

    const toggleFaq = (idx) => {
        setActiveFaq((prev) => (prev === idx ? null : idx));
    };

    const invoices = [
        {date: '15/11/2026', id: '#INV-2941', amount: '39.000'},
        {date: '23/10/2026', id: '#INV-2812', amount: '59.000'},
        {date: '02/09/2026', id: '#INV-2655', amount: '39.000'},
    ];

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Gói dịch vụ & Thanh toán</h1>
            </div>

            <div className="grid grid-cols-1 lg:gridg-cols-3 gap-6 mb-12">
                <Card className="lg:col-span-2 p-6 bg-[#B5C2BC] border-none shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="light" className="text-[10px] !text-[#1E293B] font-bold">Đang sử dụng</Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-3xl font-bold text-[#065F46]">Gói CV Middle</h3>
                                    <Badge variant="default"
                                           className="!bg-[#539A8C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        ★ Phổ biến
                                    </Badge>
                                </div>
                                <p className="text-[#334155] text-sm font-medium">Gói CV x5 lần</p>
                            </div>
                            <div className="text-right">
                                <span
                                    className="text-xs font-semibold text-[#1E293B] block">Ngày gia hạn tiếp theo</span>
                                <span
                                    className="text-xs font-semibold text-[#475569] block mt-0.5">31 Tháng 12, 2026</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#1E293B]">Đã dùng: 4/5 CV</span>
                            <span className="text-xs font-bold text-[#1E293B]">Hết hạn: 27/2/2027</span>
                        </div>

                        <div className="w-full bg-slate-300 h-2 rounded-full overflow-hidden mb-6">
                            <div className="bg-[#065F46] h-full rounded-full" style={{width: '80%'}}></div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 pt-4 border-t border-[#065F46]/20">
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => navigate('/payment?serviceId=550e8400-e29b-41d4-a716-446655440000')}
                                className="bg-[#065F46] hover:bg-[#044d3a] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors border-none"
                            >
                                Gia hạn ngay
                            </Button>
                        </div>

                        <div className="text-right">
                            <span className="text-[11px] font-medium text-[#475569]">
                                ✓ Tự động gia hạn qua thẻ
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-[#B5C2BC] border-none shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-[#475569]">
                            Lịch sử thanh toán
                        </h4>
                        <button
                            onClick={() => showToast('Lịch sử thanh toán chi tiết sẽ được tải về dưới dạng PDF.', 'info')}
                            className="text-xs font-bold text-[#10B981] hover:underline transition-colors"
                        >
                            Xem tất cả
                        </button>
                    </div>
                    <div className="space-y-4">
                        {invoices.map((inv, i) => (
                            <div key={i}
                                 className="flex justify-between items-center py-3 border-b border-slate-300 last:border-0">
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-[#0F172A]">{inv.date}</span>
                                    <span className="text-sm text-[#64748B]">{inv.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#065F46]">{inv.amount}</span>
                                    <Download size={16}
                                              className="text-[#065F46] cursor-pointer hover:text-[#044d3a] transition-colors"/>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Chọn gói dịch vụ phù hợp với bạn</h2>
                <p className="text-[#64748B]">Bạn có thể mua gói CV hoặc Interview riêng lẻ, hoặc chọn gói combo tiết kiệm.</p>
            </div>

            {/* Combo Plans */}
            <Card className="mb-8 p-6 bg-[#B5C2BC] border-none shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Gift className="text-orange-500" size={24}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#0F172A]">Gói combo tiết kiệm</h3>
                        <p className="text-[#475569] text-sm">Tiết kiệm hơn khi mua CV và Interview</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Combo 1 */}
                    <Card className="mb-8 p-6 bg-[#DFE6E2] border-none shadow-sm flex flex-col h-full">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Middle All</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#9333EA]">89.000 VNĐ</span>
                            <span className="text-[#94A3B8] text-sm line-through mb-1">98.000 VNĐ</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#8B5CF6]"/> CV Middle (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#8B5CF6]"/> Interview Middle</li>
                        </ul>
                        <Button
                            className="w-full mt-auto !bg-transparent border-2 !border-[#8B5CF6] !text-[#8B5CF6] hover:!bg-[#8B5CF6] hover:!text-white transition-colors"
                            onClick={() => navigate('/payment?serviceId=550e8400-e29b-41d4-a716-446655440000')}
                        >
                            Chọn gói
                        </Button>
                    </Card>

                    {/* Combo 2 */}
                    <Card className="mb-8 p-6 bg-[#DFE6E2] border-none shadow-sm flex flex-col h-full">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Enhance All</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#10B981]">167.000 VNĐ</span>
                            <span className="text-[#94A3B8] text-sm line-through mb-1">188.000 VNĐ</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> CV Enhance (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Interview Enhance</li>
                        </ul>
                        <Button
                            variant="primary"
                            className="w-full mt-auto !bg-transparent border-2 !border-[#10B981] !text-[#10B981] hover:!bg-[#10B981] hover:!text-white transition-colors"
                            onClick={() => navigate('/payment?serviceId=660f9501-f30c-52e5-b827-557766551111')}
                        >
                            Chọn gói
                        </Button>
                    </Card>

                    {/* Combo 3 */}
                    <Card className="mb-8 p-6 bg-[#DFE6E2] border-none shadow-sm flex flex-col h-full">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Thực chiến</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#EF4444]">145.000 VNĐ</span>
                            <span className="text-[#94A3B8] text-sm line-through mb-1">168.000 VNĐ</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#EF4444]"/> CV Middle</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#EF4444]"/> Interview Enhance</li>
                            <li className="text-xs text-[#94A3B8] mt-2 italic">Dành cho ứng viên tự tin vào CV của mình, cần tập dượt phỏng vấn kỹ.</li>
                        </ul>
                        <Button
                            className="w-full mt-auto !bg-transparent border-2  !border-[#EF4444] !text-[#EF4444] hover:!bg-[#EF4444] hover:!text-white transition-colors"
                            onClick={() => navigate('/payment?serviceId=550e8400-e29b-41d4-a716-446655440000')}
                        >
                            Chọn gói
                        </Button>
                    </Card>
                </div>
            </Card>

            {/* CV Plans */}
            <Card className="mb-8 p-6 bg-[#B5C2BC] border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="text-blue-500" size={24}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A]">Gói CV</h3>
                            <p className="text-[#475569] text-sm">Tất cả để có 1 CV chuẩn ATS</p>
                        </div>
                    </div>
                    <Button variant="outline"
                            className="!bg-transparent !border-[#065F46] !text-[#065F46] text-xs h-8 rounded flex items-center gap-2 hover:!bg-[#065F46] hover:!text-white transition-colors"
                            onClick={() => setComparisonType(prev => prev === 'cv' ? null : 'cv')}>
                        × Xem so sánh tính năng</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic */}
                    <div className="p-5 border-none rounded-xl bg-[#DFE6E2] relative mt-4 md:mt-0 flex flex-col h-full">
                        <h4 className="font-bold text-[#0F172A] mb-1">Cơ bản</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">0 VNĐ <span
                            className="text-sm font-normal text-[#475569]">/ vĩnh viễn</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={16}
                                                                                 className="!text-[#065F46] shrink-0 mt-0.5"/> Tạo
                                1 bản CV
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={16}
                                                                                 className="!text-[#065F46] shrink-0 mt-0.5"/> Truy
                                cập Template cơ bản
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={16}
                                                                                 className="!text-[#065F46] shrink-0 mt-0.5"/> Phân
                                tích CV 1 lần (Chấm điểm tổng quan)
                            </li>
                        </ul>
                        <Button variant="outline"
                                className="w-full mt-auto !bg-transparent !border-[#065F46] !text-[#065F46] hover:!bg-[#065F46] hover:!text-white transition-colors">
                            Đang dùng miễn phí
                        </Button>
                    </div>

                    {/* Middle */}
                    <div className="p-5 border-none rounded-xl bg-[#DFE6E2] relative mt-4 md:mt-0 flex flex-col h-full">
                        <div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9333EA] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">🌟
                            Phổ biến
                        </div>
                        <h4 className="font-bold text-[#9333EA] mb-1">Middle</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">39.000 VNĐ <span
                            className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#7C3AED]"/> Tạo
                                tối
                                đa 5 CV / tháng
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#7C3AED]"/> Mở
                                khóa
                                kho Template cao cấp
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#7C3AED]"/> 5
                                lượt
                                Phân tích AI (Chấm điểm, gợi ý kỹ năng & tối ưu ngữ nghĩa)
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#7C3AED]"/> Hỗ
                                trợ CV
                                song ngữ (2 ngôn ngữ)
                            </li>
                        </ul>
                        <Button
                            className="w-full mt-auto bg-[#9333EA]  hover:bg-[#7E22CE] text-white"
                            onClick={() => navigate('/payment?serviceId=550e8400-e29b-41d4-a716-446655440000')}
                        >
                            Nâng cấp
                        </Button>
                    </div>

                    {/* Enhance */}
                    <div className="p-5 border-none rounded-xl bg-[#DFE6E2] relative mt-4 md:mt-0 flex flex-col h-full">
                        <h4 className="font-bold text-[#2563EB] mb-1">Enhance</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">59.000 VNĐ <span
                            className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#2563EB]"/>Toàn
                                bộ tính năng của gói Middle
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#2563EB]"/>Nâng
                                cấp: Tạo tối đa 10 CV / tháng
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#2563EB]"/>Tính
                                năng đặc quyền: Hiển thị dự báo tỉ lệ đậu của từng Template
                            </li>
                            <li className="flex items-center gap-2"><CheckCircle size={14}
                                                                                 className="shrink-0 !text-[#2563EB]"/>Nâng
                                cấp: 10 lượt Phân tích AI & Mở khóa quyền Chỉnh sửa nội dung
                            </li>
                        </ul>
                        <Button
                            variant="primary"
                            className="w-full mt-auto"
                            onClick={() => navigate('/payment?serviceId=660f9501-f30c-52e5-b827-557766551111')}
                        >
                            Nâng cấp
                        </Button>
                    </div>
                </div>
            </Card>

            {comparisonType === 'cv' && (
                <Card className="bg-[#B5C2BC] rounded-xl overflow-hidden mb-8 border-none">
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 md:table w-full text-left text-sm text-[#475569]">
                            <div className="bg-[#0F172A] text-white md:table-header-group">
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 font-semibold md:min-w-[200px] border-r border-slate-700 md:table-cell bg-[#0F172A]">TÍNH
                                    NĂNG
                                </div>
                                <div colSpan={3}
                                    className="py-4 px-6 text-center bg-white/5 font-bold text-[#10B981] md:table-cell">GÓI CV
                                </div>
                            </div>
                            <div className="bg-[#CBD5E1] text-[#0F172A] text-center font-bold grid grid-cols-1 md:table-row">
                                <div className="py-3 px-6 text-left border-r border-slate-300 md:table-cell"></div>
                                <div className="py-3 px-4 w-28 border-b border-slate-300 md:table-cell">Cơ bản</div>
                                <div className="py-3 px-4 w-28 text-[#9333EA] border-b border-slate-300 md:table-cell">Middle</div>
                                <div className="py-3 px-4 w-28 text-[#2563EB] border-b border-slate-300 md:table-cell">Enhance</div>
                            </div>
                            </div>
                            <div className="divide-y divide-slate-300 text-center bg-[#E2E8F0] md:table-tbody">
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Số
                                    lượng CV
                                </div>
                                <div className="md:table-cell">1 CV</div>
                                <div className="md:table-cell">5 CV</div>
                                <div className="md:table-cell">10 CV</div>
                            </div>
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Template</div>
                                <div className="md:table-cell">Cơ bản</div>
                                <div className="md:table-cell">Cao cấp</div>
                                <div className="md:table-cell">Cao cấp (% đậu)</div>
                            </div>
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Phân
                                    tích CV
                                </div>
                                <div className="md:table-cell">1 lần (không sửa)</div>
                                <div className="md:table-cell">5 lần (Chấm điểm, kỹ năng, ngữ nghĩa)</div>
                                <div className="md:table-cell">10 lần (Chấm điểm, kỹ năng, chỉnh sửa)</div>
                            </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Interview Plans */}
            <Card className="mb-8 p-6 bg-[#B5C2BC] border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <Mic className="text-[#10B981]" size={24}/>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#0F172A]">Gói Interview</h3>
                            <p className="text-[#475569] text-sm">Luyện phỏng vấn và nhận phản hồi chuyên sâu</p>
                        </div>
                    </div>
                    <Button variant="outline"
                            className="!bg-transparent !border-[#065F46] !text-[#065F46] text-xs h-8 rounded flex items-center gap-2 hover:!bg-[#065F46] hover:!text-white transition-colors"
                            onClick={() => setComparisonType(prev => prev === 'interview' ? null : 'interview')}>
                        × Xem so sánh tính năng
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Basic */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-[#DFE6E2] relative flex flex-col h-full">
                        <h4 className="font-bold text-[#0F172A] mb-1">Cơ bản</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">0 VNĐ <span
                            className="text-sm font-normal text-[#475569]">/ vĩnh viễn</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#065F46] shrink-0 mt-0.5"/>Truy
                                cập bộ câu hỏi mẫu không giới hạn (Cấp độ Intern)
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#065F46] shrink-0 mt-0.5"/> Chưa
                                hỗ trợ nhận xét (Feedback)
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#065F46] shrink-0 mt-0.5"/> Chưa
                                hỗ trợ ghi hình phỏng vấn
                            </li>
                        </ul>
                        <Button variant="outline"
                                className="w-full mt-auto !bg-transparent !border-[#065F46] !text-[#065F46] hover:!bg-[#065F46] hover:!text-white transition-colors">Dùng
                            thử miễn phí</Button>
                    </div>

                    {/* Middle */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-[#DFE6E2] relative flex flex-col h-full">
                        <div
                            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9333EA] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">★
                            Phổ biến
                        </div>
                        <h4 className="font-bold text-[#9333EA] mb-1">Middle</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">69.000 VNĐ <span
                            className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#7C3AED] shrink-0 mt-0.5"/> Bộ
                                câu hỏi chuyên sâu theo ngành nghề (Cấp độ Fresher)
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#7C3AED] shrink-0 mt-0.5"/> Thời
                                lượng phỏng vấn: 10 phút/lần
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#7C3AED] shrink-0 mt-0.5"/> Chưa
                                hỗ trợ nhận xét (Feedback) chung
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#7C3AED] shrink-0 mt-0.5"/>Hỗ
                                trợ Ghi hình (3 lượt)
                            </li>
                        </ul>
                        <Button
                            className="w-full mt-auto !bg-[#7C3AED] hover:!bg-[#7E22CE]  !text-white"
                            onClick={() => navigate('/payment?serviceId=550e8400-e29b-41d4-a716-446655440000')}
                        >
                            Nâng cấp
                        </Button>
                    </div>

                    {/* Enhance */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-[#DFE6E2] relative flex flex-col h-full">
                        <h4 className="font-bold text-[#2563EB] mb-1">Enhance</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">129.000 VNĐ <span
                            className="text-sm font-normal text-[#475569]">/ tháng</span></div>
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#2563EB] shrink-0 mt-0.5"/> Kế
                                thừa toàn bộ tính năng của gói Middle
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#2563EB] shrink-0 mt-0.5"/> Nâng
                                cấp thời lượng phỏng vấn lên 15 phút/lần
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#2563EB] shrink-0 mt-0.5"/> Tùy
                                chỉnh câu hỏi bám sát Văn hóa doanh nghiệp ứng tuyển
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#2563EB] shrink-0 mt-0.5"/>Báo
                                cáo nhận xét (Feedback) chuyên sâu
                            </li>
                            <li className="flex items-start gap-2"><CheckCircle size={16}
                                                                                className="!text-[#2563EB] shrink-0 mt-0.5"/> Hỗ
                                trợ Ghi hình đánh giá (6 lượt)
                            </li>
                        </ul>
                        <Button
                            className="w-full mt-auto bg-[#10B981] hover:bg-[#059669] text-white"
                            onClick={() => navigate('/payment?serviceId=660f9501-f30c-52e5-b827-557766551111')}
                        >
                            Nâng cấp
                        </Button>
                    </div>
                </div>
            </Card>

            {comparisonType === 'interview' && (
                <Card className="bg-[#B5C2BC] rounded-xl overflow-hidden mb-8 border-none">
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-1 md:table w-full text-left text-sm text-[#475569]">
                            <div className="bg-[#0F172A] text-white md:table-header-group">
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 font-semibold md:min-w-[200px] border-r border-slate-700 md:table-cell bg-[#0F172A]">TÍNH
                                    NĂNG
                                </div>
                                <div colSpan={3}
                                    className="py-4 px-6 text-center bg-white/5 font-bold text-[#10B981] md:table-cell">GÓI INTERVIEW
                                </div>
                            </div>
                            <div className="bg-[#CBD5E1] text-[#0F172A] text-center font-bold grid grid-cols-1 md:table-row">
                                <div className="py-3 px-6 text-left border-r border-slate-300 md:table-cell"></div>
                                <div className="py-3 px-4 w-28 border-b border-slate-300 md:table-cell">Cơ bản</div>
                                <div className="py-3 px-4 w-28 text-[#9333EA] border-b border-slate-300 md:table-cell">Middle</div>
                                <div className="py-3 px-4 w-28 text-[#2563EB] border-b border-slate-300 md:table-cell">Enhance</div>
                            </div>
                            </div>
                            <div className="divide-y divide-slate-300 text-center bg-[#E2E8F0] md:table-tbody">
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Số
                                    phút phỏng vấn
                                </div>
                                <div className="md:table-cell">–</div>
                                <div className="md:table-cell">10 phút</div>
                                <div className="md:table-cell">15 phút</div>
                            </div>
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Câu
                                    hỏi mẫu
                                </div>
                                <div className="md:table-cell">Unlimited/Intern</div>
                                <div className="md:table-cell">Cơ bản (Vị trí/Fresher)</div>
                                <div className="md:table-cell">Nâng cao (Vị trí/Junior</div>
                            </div>
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Văn
                                    hóa doanh nghiệp
                                </div>
                                <div className="md:table-cell">–</div>
                                <div className="md:table-cell">–</div>
                                <div className="text-[#10B981] md:table-cell"><CheckCircle size={18} className="mx-auto"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Feedback
                                    chuyên sâu
                                </div>
                                <div className="md:table-cell">–</div>
                                <div className="md:table-cell">–</div>
                                <div className="text-[#10B981] md:table-cell"><CheckCircle size={18} className="mx-auto"/></div>
                            </div>
                            <div className="grid grid-cols-1 md:table-row">
                                <div className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A] bg-slate-100 md:bg-transparent md:table-cell">Ghi
                                    hình
                                </div>
                                <div className="md:table-cell">–</div>
                                <div className="md:table-cell">3 lần</div>
                                <div className="md:table-cell">6 lần</div>
                            </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="bg-[#DFE6E2] rounded-2xl p-6 space-y-4 shadow-sm border-none mb-8">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                        <HelpCircle size={20} className="text-[#10B981]"/>
                        <h3 className="font-bold text-[#0F172A]">Câu hỏi thường gặp</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => toggleFaq(1)}
                                className="w-full px-4 py-3 text-left font-bold text-sm text-[#475569] flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <span>Tôi có thể hủy gói dịch vụ bất cứ lúc nào không?</span>
                                <span className="transition-transform duration-200"
                                      style={{transform: activeFaq === 1 ? 'rotate(180deg)' : 'none'}}>▼</span>
                            </button>
                            {activeFaq === 1 && (
                                <p className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                                    Bạn hoàn toàn có thể tự hủy đăng ký hoặc hạ cấp bất kỳ thời gian nào từ bảng đăng ký
                                    tài
                                    khoản. Quyền hạn của gói hiện có sẽ tiếp tục duy trì hoạt động đến hạn kế tiếp của
                                    bạn.
                                </p>
                            )}
                        </div>
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => toggleFaq(2)}
                                className="w-full px-4 py-3 text-left font-bold text-sm text-[#475569] flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <span>Hóa đơn của tôi sẽ được gửi như thế nào?</span>
                                <span className="transition-transform duration-200"
                                      style={{transform: activeFaq === 2 ? 'rotate(180deg)' : 'none'}}>▼</span>
                            </button>
                            {activeFaq === 2 && (
                                <p className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                                    Hệ thống Smartfolio sẽ xuất hóa đơn PDF điện tử VAT tự động gửi thẳng vào địa chỉ
                                    hòm
                                    thư điện tử cá nhân của bạn ngay sau mỗi chu kỳ giao dịch thành công.
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                <Card
                    className="bg-gradient-to-r from-[#34D399] to-[#10B981] p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm border-none text-white">
                    <div className="flex items-start space-x-3">
                        <HeartHandshake size={32} className="shrink-0 mt-0.5"/>
                        <div className="space-y-1">
                            <h4 className="text-base font-bold">Cần hỗ trợ thêm?</h4>
                            <p className="text-xs opacity-90 max-w-3xl leading-relaxed">
                                Bạn có câu hỏi doanh nghiệp hoặc cần thiết kế layout mẫu CV cá nhân hóa biệt lập? Bộ
                                phận hỗ
                                trợ 24/7 của Smartfolio luôn sẵn sàng giúp bạn.
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="dark"
                        onClick={() => showToast('Đã mở hộp thoại trò chuyện cùng tư vấn viên!', 'success')}
                        className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all whitespace-nowrap"
                    >
                        Liên hệ tư vấn
                    </Button>
                </Card>

        </div>
);
};

export default PricingPage;
