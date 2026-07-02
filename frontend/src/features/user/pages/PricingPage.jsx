import React, { useState } from 'react';
import { CreditCard, Calendar, BarChart3, HelpCircle, Check, ArrowRight, Star, HeartHandshake, Lock, CheckCircle, Gift, FileText, Mic, Download } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { Card, Button, Badge } from '../components/Layout.jsx';

const PricingPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [paymentModal, setPaymentModal] = useState({ open: false, type: 'renew' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const { profile, handleUpgradePlan } = useAuth();
    const { showToast } = useApp();

    const handleSelectPlan = (planName) => {
        handleUpgradePlan(planName);
        showToast(`Chúc mừng! Tài khoản đã được chuyển sang gói ${planName} thành công.`, 'success');
    };

    const toggleFaq = (idx) => {
        setActiveFaq((prev) => (prev === idx ? null : idx));
    };

    const processPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentModal({ open: false, type: 'renew' });
            showToast('Giao dịch thanh toán thành công!', 'success');
        }, 2000);
    };

    const invoices = [
        { date: '15/11/2026', id: '#INV-2941', amount: '39.000' },
        { date: '23/10/2026', id: '#INV-2812', amount: '59.000' },
        { date: '02/09/2026', id: '#INV-2655', amount: '39.000' },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Gói dịch vụ & Thanh toán</h1>
            </div >

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <Card className="lg:col-span-2 p-6 bg-[#B5C2BC] border-none shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="light" className="text-[10px] !text-[#1E293B] font-bold">Đang sử dụng</Badge>
                            </div >
                            <div className="flex items-center gap-2">
                                <h3 className="text-3xl font-bold text-[#065F46]">Gói CV Middle</h3>
                                <Badge variant="default" className="bg-[#34D399] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">★ Phổ biến</Badge>
                            </div >
                            <p className="text-[#334155] text-sm font-medium">Gói CV x5 lần</p>
                        </div >
                        <div className="text-right">
                            <span className="text-xs font-semibold text-[#1E293B] block">Ngày gia hạn tiếp theo</span>
                            <span className="text-xs font-semibold text-[#475569] block mt-0.5">31 Tháng 12, 2026</span>
                        </div >
                    </div >
                    <div className="flex items-center justify-between mb-6">
                        <div className="w-3/4 bg-slate-300 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#065F46] h-full rounded-full" style={{ width: '80%' }}></div>
                        </div >
                        <span className="text-xs font-bold text-[#1E293B] ml-4 whitespace-nowrap">Hết hạn: 27/2/2027</span>
                    </div >
                    <div className="flex items-center gap-3 mt-6">
                        <Button
                            onClick={() => setPaymentModal({ open: true, type: 'renew' })}
                            className="bg-[#065F46] hover:bg-[#044d3a] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors border-none"
                        >
                            Gia hạn ngay
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPaymentModal({ open: true, type: 'manage' })}
                            className="bg-transparent text-[#065F46] border border-[#065F46] text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            Quản lý thanh toán
                        </Button>
                    </div >
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
                    </div >
                    <div className="space-y-4">
                        {invoices.map((inv, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-300 last:border-0">
                                <div className="flex flex-col">
                                    <span className="text-lg font-bold text-[#0F172A]">{inv.date}</span>
                                    <span className="text-sm text-[#64748B]">{inv.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#065F46]">{inv.amount}</span>
                                    <Download size={16} className="text-[#065F46] cursor-pointer hover:text-[#044d3a] transition-colors" />
                                </div>
                            </div >
                        ))}
                    </div >
                </Card>
            </div >

            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Chọn gói dịch vụ phù hợp với bạn</h2>
                <p className="text-[#64748B]">Bạn có thể mua gói CV hoặc Interview riêng lẻ, hoặc chọn gói combo tiết kiệm.</p>
            </div >

            {/* Combo Plans */}
            <Card className="mb-8 p-6 bg-[#B5C2BC] border-none shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Gift className="text-orange-500" size={24} />
                    </div >
                    <div >
                        <h3 className="text-xl font-bold text-[#0F172A]">Gói combo tiết kiệm</h3>
                        <p className="text-[#475569] text-sm">Tiết kiệm hơn khi mua CV và Interview</p>
                    </div >
                </div >

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Combo 1 */}
                    <Card className="mb-8 p-6 bg-[#DFE6E2] border-none shadow-sm flex flex-col h-full">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Middle All</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#9333EA]">49.000 VNĐ</span>
                            <span className="text-[#94A3B8] text-sm line-through mb-1">98.000 VNĐ</span>
                        </div >
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#8B5CF6]"/> CV Middle (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#8B5CF6]"/> Interview Middle</li>
                        </ul >
                        <Button
                            className="w-full mt-auto !bg-transparent border-2 !border-[#8B5CF6] !text-[#8B5CF6] hover:!bg-[#8B5CF6] hover:!text-white transition-colors"
                            onClick={() => handleSelectPlan('Middle All')}
                        >
                            Chọn gói
                        </Button>
                    </Card>

                    {/* Combo 2 */}
                    <Card className="mb-8 p-6 bg-[#DFE6E2] border-none shadow-sm flex flex-col h-full">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Enhance All</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#10B981]">157.000 VNĐ</span>
                            <span className="text-[#94A3B8] text-sm line-through mb-1">188.000 VNĐ</span>
                        </div >
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> CV Enhance (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-[#10B981]"/> Interview Enhance</li>
                        </ul >
                        <Button
                            variant="primary"
                            className="w-full mt-auto !bg-transparent border-2 !border-[#10B981] !text-[#10B981] hover:!bg-[#10B981] hover:!text-white transition-colors"
                            onClick={() => handleSelectPlan('Enhance All')}
                        >
                            Chọn gói
                        </Button>
                    </Card>

                    {/* Combo 3 */}
                    <Card className="mb-8 p-6 bg-[#DFE6E2] border-none shadow-sm flex flex-col h-full">
                        <h4 className="text-lg font-bold text-[#0F172A] mb-1">Thực chiến</h4>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-2xl font-bold text-[#EF4444]">149.000 VNĐ</span>
                        </div >
                        <ul className="space-y-2 mb-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#EF4444]"/> CV Middle (All)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#EF4444]"/> Interview Enhance</li>
                            <li className="text-xs text-[#94A3B8] mt-2 italic">Dành cho ứng viên tự tin vào CV của mình, cần tập dượt phỏng vấn kỹ.</li>
                        </ul >
                        <Button
                            className="w-full mt-auto !bg-transparent border-2  !border-[#EF4444] !text-[#EF4444] hover:!bg-[#EF4444] hover:!text-white transition-colors"
                            onClick={() => handleSelectPlan('Thực chiến')}
                        >
                            Chọn gói
                        </Button>
                    </Card>
                </div >
            </Card>

            {/* CV Plans */}
            <Card className="mb-8 p-6 bg-[#B5C2BC] border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="text-blue-500" size={24} />
                        </div >
                        <div >
                            <h3 className="text-xl font-bold text-[#0F172A]">Gói CV</h3>
                            <p className="text-[#475569] text-sm">Tất cả để có 1 CV chuẩn ATS</p>
                        </div >
                    </div >
                    <Button variant="outline" className="!bg-transparent !border-[#065F46] !text-[#065F46] text-xs h-8 rounded flex items-center gap-2 hover:!bg-[#065F46] hover:!text-white transition-colors">× Xem so sánh tính năng</Button>
                </div >

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Basic */}
                    <div className="p-5 border-none rounded-xl bg-[#DFE6E2] relative mt-4 md:mt-0 flex flex-col h-full">
                        <h4 className="font-bold text-[#0F172A] mb-1">Cơ bản</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">0 VNĐ <span className="text-sm font-normal text-[#475569]">/ vĩnh viễn</span></div >
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="!text-[#065F46] shrink-0 mt-0.5"/> 1 CV</li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="!text-[#065F46] shrink-0 mt-0.5"/> Template cơ bản</li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="!text-[#065F46] shrink-0 mt-0.5"/> Phân tích CV 1 lần (có bảng điểm)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="!text-[#065F46] shrink-0 mt-0.5"/> Gợi ý kĩ năng</li>
                        </ul >
                        <Button variant="outline" className="w-full mt-auto !bg-transparent !border-[#065F46] !text-[#065F46] hover:!bg-[#065F46] hover:!text-white transition-colors">
                            Đang dùng miễn phí
                        </Button>
                    </div >

                    {/* Middle */}
                    <div className="p-5 border-none rounded-xl bg-[#DFE6E2] relative mt-4 md:mt-0 flex flex-col h-full">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9333EA] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">🌟 Phổ biến</div >
                        <h4 className="font-bold text-[#9333EA] mb-1">Middle</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">39.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div >
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#7C3AED]"/> 10 CV / tháng</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#7C3AED]"/> Template cao cấp</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#7C3AED]"/> Phân tích CV 5 lần (có bảng điểm)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#7C3AED]"/> Gợi ý AI từ ngữ</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#7C3AED]"/> Hỗ trợ 2 ngôn ngữ</li>
                        </ul >
                        <Button
                            className="w-full mt-auto bg-[#9333EA]  hover:bg-[#7E22CE] text-white"
                            onClick={() => handleSelectPlan('CV Middle')}
                        >
                            Nâng cấp
                        </Button>
                    </div >

                    {/* Enhance */}
                    <div className="p-5 border-none rounded-xl bg-[#DFE6E2] relative mt-4 md:mt-0 flex flex-col h-full">
                        <h4 className="font-bold text-[#2563EB] mb-1">Enhance</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">59.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div >
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#2563EB]"/> Vô hạn CV / tháng</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#2563EB]"/> Template cao cấp +</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#2563EB]"/> Phân tích CV Vô hạn (có bảng điểm)</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#2563EB]"/> Gợi ý AI AI viết lại đoạn văn</li>
                            <li className="flex items-center gap-2"><CheckCircle size={14} className="!text-[#2563EB]"/> AI tối ưu theo Job JD</li>
                        </ul >
                        <Button
                            variant="primary"
                            className="w-full mt-auto"
                            onClick={() => handleSelectPlan('CV Enhance')}
                        >
                            Nâng cấp
                        </Button>
                    </div >
                </div >
            </Card>

            {/* Interview Plans */}
            <Card className="mb-8 p-6 bg-[#B5C2BC] border-none shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full">
                            <Mic className="text-[#10B981]" size={24} />
                        </div >
                        <div >
                            <h3 className="text-xl font-bold text-[#0F172A]">Gói Interview</h3>
                            <p className="text-[#475569] text-sm">Luyện phỏng vấn và nhận phản hồi chuyên sâu</p>
                        </div >
                    </div >
                    <Button variant="outline" className="!bg-transparent !border-[#065F46] !text-[#065F46] text-xs h-8 rounded flex items-center gap-2 hover:!bg-[#065F46] hover:!text-white transition-colors">
                        × Xem so sánh tính năng
                    </Button>
                </div >

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Basic */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-[#DFE6E2] relative flex flex-col h-full">
                        <h4 className="font-bold text-[#0F172A] mb-1">Cơ bản</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">0 VNĐ <span className="text-sm font-normal text-[#475569]">/ vĩnh viễn</span></div >
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#065F46] shrink-0 mt-0.5"/> Bộ câu hỏi mẫu</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#065F46] shrink-0 mt-0.5"/> Dựa trên vị trí</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#065F46] shrink-0 mt-0.5"/> Không có feedback</li>
                        </ul >
                        <Button variant="outline" className="w-full mt-auto !bg-transparent !border-[#065F46] !text-[#065F46] hover:!bg-[#065F46] hover:!text-white transition-colors">Dùng thử miễn phí</Button>
                    </div >

                    {/* Middle */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-[#DFE6E2] relative flex flex-col h-full">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#9333EA] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">★ Phổ biến</div >
                        <h4 className="font-bold text-[#9333EA] mb-1">Middle</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">69.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div >
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#7C3AED] shrink-0 mt-0.5"/> Mở khóa 10 phút</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#7C3AED] shrink-0 mt-0.5"/> Bộ câu hỏi cơ bản</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#7C3AED] shrink-0 mt-0.5"/> Fresher, chuyên hóa theo ngành nghề</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#7C3AED] shrink-0 mt-0.5"/> Không có feedback chung</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#7C3AED] shrink-0 mt-0.5"/> Ghi hình + 3 lần</li>
                        </ul >
                        <Button
                            className="w-full mt-auto !bg-[#7C3AED] hover:!bg-[#7E22CE]  !text-white"
                            onClick={() => handleSelectPlan('Interview Middle')}
                        >
                            Nâng cấp
                        </Button>
                    </div >

                    {/* Enhance */}
                    <div className="p-5 border border-slate-200 rounded-xl bg-[#DFE6E2] relative flex flex-col h-full">
                        <h4 className="font-bold text-[#2563EB] mb-1">Enhance</h4>
                        <div className="text-2xl font-bold text-[#0F172A] mb-1">129.000 VNĐ <span className="text-sm font-normal text-[#475569]">/ tháng</span></div >
                        <ul className="space-y-2 my-6 text-sm text-[#475569]">
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#2563EB] shrink-0 mt-0.5"/> Mở khóa 15 phút</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#2563EB] shrink-0 mt-0.5"/> Bộ câu hỏi nâng cao</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#2563EB] shrink-0 mt-0.5"/> Phản hồi và chấm điểm chi tiết</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#2563EB] shrink-0 mt-0.5"/> Feedback chuyên sâu</li>
                            <li className="flex items-start gap-2"><CheckCircle size={16} className="!text-[#2563EB] shrink-0 mt-0.5"/> Ghi hình + 6 lần</li>
                        </ul >
                        <Button
                            className="w-full mt-auto bg-[#10B981] hover:bg-[#059669] text-white"
                            onClick={() => handleSelectPlan('Interview Enhance')}
                        >
                            Nâng cấp
                        </Button>
                    </div >
                </div >
            </Card>

            {/* Comparison Header */}
            <div className="flex justify-center mb-6">
                <Card className="bg-[#E2E8F0] p-6 text-center max-w-3xl rounded-xl border-none">
                    <h3 className="text-[#0F172A] font-bold text-lg mb-1">So sánh chi tiết tính năng</h3>
                    <p className="text-[#475569] text-xs mb-3">Xem và so sánh tất cả tính năng của các gói</p>
                    <Button
                        className="bg-[#0F172A] hover:bg-[#334155] text-white text-xs h-8 rounded-full px-4 flex items-center justify-center mx-auto gap-2"
                        onClick={() => setShowComparison(!showComparison)}
                    >
                        {showComparison ? '× Đóng bảng so sánh' : '× Xem bảng so sánh'}
                    </Button>
                </Card>
            </div >

            {showComparison && (
                <Card className="bg-[#E2E8F0] rounded-xl overflow-hidden mb-12 border-none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[#475569]">
                            <thead className="bg-[#0F172A] text-white">
                            <tr >
                                <th className="py-4 px-6 font-semibold min-w-[200px] border-r border-slate-700">TÍNH NĂNG</th>
                                <th colSpan={3} className="py-4 px-6 text-center bg-white/5 font-bold text-[#10B981] border-r border-slate-700">GÓI CV</th>
                                <th colSpan={3} className="py-4 px-6 text-center bg-white/5 font-bold text-[#10B981]">GÓI INTERVIEW</th>
                            </tr >
                            <tr className="bg-[#CBD5E1] text-[#0F172A] text-center font-bold">
                                <th className="py-3 px-6 text-left border-r border-slate-300"></th >
                                <th className="py-3 px-4 w-28 border-b border-slate-300">Cơ bản</th>
                                <th className="py-3 px-4 w-28 text-[#9333EA] border-b border-slate-300">Middle</th>
                                <th className="py-3 px-4 w-28 text-[#10B981] border-r border-slate-300 border-b border-slate-300">Enhance</th>
                                <th className="py-3 px-4 w-28 border-b border-slate-300">Cơ bản</th>
                                <th className="py-3 px-4 w-28 text-[#9333EA] border-b border-slate-300">Middle</th>
                                <th className="py-3 px-4 w-28 text-[#10B981] border-b border-slate-300">Enhance</th>
                            </tr >
                            </thead>
                            <tbody className="divide-y divide-slate-300 text-center bg-[#E2E8F0]">
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Số lượng CV</td>
                                    <td>1 CV</td>
                                    <td>5 CV / tháng</td>
                                    <td className="border-r border-slate-300">10 CV / tháng</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td>–</td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Template</td>
                                    <td>Cơ bản</td>
                                    <td>Cao cấp</td>
                                    <td className="border-r border-slate-300">Cao cấp +</td>
                                    <td>–</td>
                                    <td>Cơ bản</td>
                                    <td>Nâng cao</td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Phân tích CV (Có bảng điểm)</td>
                                    <td>1 lần</td>
                                    <td>5 lần</td>
                                    <td className="border-r border-slate-300">10 lần</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Gợi ý kỹ năng</td>
                                    <td>–</td>
                                    <td><CheckCircle size={18} className="mx-auto text-[#9333EA]" /></td>
                                    <td className="border-r border-slate-300"><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td>–</td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Gợi ý ngữ nghĩa, câu từ</td>
                                    <td>–</td>
                                    <td><CheckCircle size={18} className="mx-auto text-[#9333EA]" /></td>
                                    <td className="border-r border-slate-300"><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td>–</td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">AI chỉnh sửa / Tối ưu CV</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td className="border-r border-slate-300"><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td>–</td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Số phút phỏng vấn</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td className="border-r border-slate-300">–</td>
                                    <td>–</td>
                                    <td>10 phút</td>
                                    <td>15 phút</td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Feedback và chấm điểm</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td className="border-r border-slate-300">–</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td>–</td>
                                </tr>
                                <tr >
                                    <td className="py-4 px-6 text-left font-medium border-r border-slate-300 text-[#0F172A]">Feedback chuyên sâu</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td className="border-r border-slate-300">–</td>
                                    <td>–</td>
                                    <td>–</td>
                                    <td><CheckCircle size={18} className="mx-auto text-[#10B981]" /></td>
                                </tr>
                                <tr >
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
            )}



            <Card className="bg-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-sm border-none mb-8">
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-200">
                    <HelpCircle size={20} className="text-[#10B981]"/>
                    <h3 className="font-bold text-[#0F172A]">Câu hỏi thường gặp</h3>
                </div >
                <div className="space-y-3">
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={() => toggleFaq(1)}
                            className="w-full px-4 py-3 text-left font-bold text-sm text-[#475569] flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <span >Tôi có thể hủy gói dịch vụ bất cứ lúc nào không?</span>
                            <span className="transition-transform duration-200" style={{transform: activeFaq === 1 ? 'rotate(180deg)' : 'none'}}>▼</span>
                        </button>
                        {activeFaq === 1 && (
                            <p className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                                Bạn hoàn toàn có thể tự hủy đăng ký hoặc hạ cấp bất kỳ thời gian nào từ bảng đăng ký
                                tài khoản. Quyền hạn của gói hiện có sẽ tiếp tục duy trì hoạt động đến hạn kế tiếp
                                của bạn.
                            </p>
                        )}
                    </div >
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={() => toggleFaq(2)}
                            className="w-full px-4 py-3 text-left font-bold text-sm text-[#475569] flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <span >Hóa đơn của tôi sẽ được gửi như thế nào?</span>
                            <span className="transition-transform duration-200" style={{transform: activeFaq === 2 ? 'rotate(180deg)' : 'none'}}>▼</span>
                        </button>
                        {activeFaq === 2 && (
                            <p className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                                Hệ thống Smartfolio sẽ xuất hóa đơn PDF điện tử VAT tự động gửi thẳng vào địa chỉ
                                hòm thư điện tử cá nhân của bạn ngay sau mỗi chu kỳ giao dịch thành công.
                            </p>
                        )}
                    </div >
                </div >
            </Card>

            <Card className="bg-gradient-to-r from-[#34D399] to-[#10B981] p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm border-none text-white">
                <div className="flex items-start space-x-3">
                    <HeartHandshake size={32} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-base font-bold">Cần hỗ trợ thêm?</h4>
                        <p className="text-xs opacity-90 max-w-3xl leading-relaxed">
                            Bạn có câu hỏi doanh nghiệp hoặc cần thiết kế layout mẫu CV cá nhân hóa biệt lập? Bộ
                            phận hỗ trợ 24/7 của Smartfolio luôn sẵn sàng giúp bạn.
                        </p>
                    </div >
                </div >
                <Button
                    variant="dark"
                    onClick={() => showToast('Đã mở hộp thoại trò chuyện cùng tư vấn viên!', 'success')}
                    className="bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all whitespace-nowrap"
                >
                    Liên hệ tư vấn
                </Button>
            </Card>

            <Modal
                isOpen={paymentModal.open}
                onClose={() => setPaymentModal({ open: false, type: 'renew' })}
                title={paymentModal.type === 'renew' ? 'Gia hạn gói dịch vụ' : 'Quản lý thanh toán'}
            >
                <div className="space-y-6">
                    {paymentModal.type === 'renew' ? (
                        <>
                            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#10B981]">
                                        <CreditCard size={20} />
                                    </div >
                                    <div >
                                        <span className="text-xs font-bold text-[#0F172A] block">Thanh toán gói Premium</span>
                                        <span className="text-[10px] text-[#64748B]">Visa ending in 4242</span>
                                    </div >
                                </div >
                                <span className="text-sm font-extrabold text-[#10B981]">79.000 đ</span>
                            </div >
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-xs text-[#64748B] bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    <Lock size={14} className="text-[#10B981]" />
                                    <span >Thanh toán được bảo mật qua Stripe SSL Encryption.</span>
                                </div >
                                <Button
                                    onClick={processPayment}
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                                        isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#10B981] hover:bg-[#059669]'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center space-x-2">
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div >
                                            <span >Đang xử lý...</span>
                                        </span >
                                    ) : (
                                        <span >Xác nhận thanh toán</span>
                                    )}
                                </Button>
                            </div >
                        </>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-[#64748B] leading-relaxed">
                                Bạn có thể quản lý phương thức thanh toán, xem hóa đơn chi tiết và thay đổi chu kỳ thanh toán (Hàng tháng / Hàng năm).
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => {
                                        setPaymentModal({ open: false, type: 'renew' });
                                        showToast('Đang chuyển hướng đến cổng Stripe...', 'info');
                                    }}
                                    className="w-full p-3 rounded-xl border border-slate-200 text-left text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors flex justify-between items-center"
                                >
                                    <span >Thay đổi thẻ tín dụng</span>
                                    <ArrowRight size={14} className="text-[#64748B]" />
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentModal({ open: false, type: 'renew' });
                                        showToast('Đang tải lịch sử hóa đơn...', 'info');
                                    }}
                                    className="w-full p-3 rounded-xl border border-slate-200 text-left text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors flex justify-between items-center"
                                >
                                    <span >Tải tất cả hóa đơn (PDF)</span>
                                    <ArrowRight size={14} className="text-[#64748B]" />
                                </button>
                            </div >
                        </div >
                    )}
                </div >
            </Modal>
        </div >
    );
};

export default PricingPage;
