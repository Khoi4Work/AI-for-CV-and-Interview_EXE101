import React, { useState } from 'react';
import { CreditCard, Calendar, BarChart3, HelpCircle, Check, ArrowRight, Star, HeartHandshake, Lock } from 'lucide-react';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { Card, Button, Badge } from './Pattern/core';

const PricingPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [paymentModal, setPaymentModal] = useState({ open: false, type: 'renew' });
    const [isProcessing, setIsProcessing] = useState(false);
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
        { date: '15/11/2024', id: '#INV-2941', amount: '79.000 đ' },
        { date: '15/10/2024', id: '#INV-2812', amount: '79.000 đ' },
        { date: '15/09/2024', id: '#INV-2655', amount: '79.000 đ' },
    ];

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-[#10B981]">Gói dịch vụ & Thanh toán</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                <Card className="lg:col-span-2 p-6 bg-[#E2E8F0] border-none shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-[10px] bg-white text-[#475569]">GÓI HIỆN TẠI</Badge>
                                <span className="text-xs text-[#64748B] font-medium">Bảo trì kế tiếp</span>
                            </div>
                            <h3 className="text-2xl font-bold text-[#0F172A]">{profile.membershipType} Plan</h3>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-[#64748B] font-bold uppercase block">Ngày gia hạn tiếp theo</span>
                            <span className="text-xs font-semibold text-[#475569] block mt-0.5">31 Tháng 12, 2026</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                        <Button
                            onClick={() => setPaymentModal({ open: true, type: 'renew' })}
                            className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                        >
                            Gia hạn ngay
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setPaymentModal({ open: true, type: 'manage' })}
                            className="bg-white text-[#475569] border-slate-200 text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Quản lý thanh toán
                        </Button>
                    </div>
                </Card>

                <Card className="p-6 bg-[#E2E8F0] border-none shadow-sm">
                    <h4 className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase pb-2 border-b border-slate-300 mb-3">
                        LỊCH SỬ THANH TOÁN
                    </h4>
                    <div className="space-y-3">
                        {invoices.map((inv, i) => (
                            <div key={i} className="flex justify-between items-center py-2 text-xs border-b border-slate-200 last:border-0">
                                <span className="text-[#64748B] font-mono">{inv.date}</span>
                                <span className="text-[#64748B]">{inv.id}</span>
                                <span className="font-bold text-[#10B981]">{inv.amount}</span>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => showToast('Lịch sử thanh toán chi tiết sẽ được tải về dưới dạng PDF.', 'info')}
                        className="text-center w-full text-[10px] font-bold text-[#64748B] hover:text-[#10B981] transition-colors mt-4 block"
                    >
                        Xem tất cả lịch sử
                    </button>
                </Card>
            </div>

            <div className="text-center mb-8">
                <h3 className="text-lg font-bold text-[#0F172A]">Chọn gói dịch vụ phù hợp với bạn</h3>
            </div>

            <Card className="mb-12 p-6 bg-[#E2E8F0] border-none shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-300 items-stretch">
                    {/* Features Column */}
                    <div className="p-6 flex flex-col justify-between bg-slate-100/50">
                        <div className="pb-6 min-h-[96px] flex flex-col justify-center">
                            <span className="text-base font-bold text-[#0F172A] uppercase tracking-wide">Tính năng</span>
                        </div>
                        <div className="space-y-5 text-[#475569] text-xs font-semibold py-4 flex-1">
                            <div className="py-2.5 border-b border-slate-200">Số lượng CV tối đa</div>
                            <div className="py-2.5 border-b border-slate-200">AI Optimizer (Gợi ý từ khoá)</div>
                            <div className="py-2.5 border-b border-slate-200">Xuất PDF cao cấp</div>
                            <div className="py-2.5 border-b border-slate-200">Phân tích chuyên sâu</div>
                            <div className="py-2.5">Phỏng vấn với AI</div>
                        </div>
                        <div className="pt-4 h-10"></div>
                    </div>

                    {/* Free Plan */}
                    <div className="p-6 flex flex-col justify-between text-center min-h-[360px]">
                        <div className="space-y-3 pb-6 min-h-[96px] flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] text-[#64748B] font-bold uppercase block">MIỄN PHÍ</span>
                                <h4 className="text-xl font-bold text-[#0F172A] mt-1">Free</h4>
                            </div>
                            <div className="text-sm font-semibold text-[#10B981]">0đ / tháng</div>
                        </div>
                        <div className="space-y-5 text-xs text-[#64748B] font-medium py-4 flex-1">
                            <div className="py-2.5 border-b border-slate-200">3 bản CV</div>
                            <div className="py-2.5 border-b border-slate-200">✗</div>
                            <div className="py-2.5 border-b border-slate-200">✗</div>
                            <div className="py-2.5 border-b border-slate-200">✗</div>
                            <div className="py-2.5">✗</div>
                        </div>
                        <div className="pt-4">
                            <button
                                disabled={profile.membershipType === 'Free'}
                                className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors ${
                                    profile.membershipType === 'Free'
                                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                                        : 'border border-slate-300 hover:bg-slate-50 text-[#475569]'
                                }`}
                            >
                                {profile.membershipType === 'Free' ? 'Đang sử dụng' : 'Chuyển đổi'}
                            </button>
                        </div>
                    </div>

                    {/* Premium Plan */}
                    <div className="p-6 flex flex-col justify-between text-center min-h-[360px] relative">
                        <div className="space-y-3 pb-6 min-h-[96px] flex flex-col justify-between">
                            <div>
                                <span className="text-[10px] text-[#64748B] font-bold uppercase block">CHUYÊN GIA</span>
                                <h4 className="text-xl font-bold text-[#0F172A] mt-1">Premium</h4>
                            </div>
                            <div className="text-sm font-semibold text-[#10B981]">99.000đ / tháng</div>
                        </div>
                        <div className="space-y-5 text-xs text-[#64748B] font-medium py-4 flex-1">
                            <div className="py-2.5 border-b border-slate-200">Vô hạn CV</div>
                            <div className="py-2.5 border-b border-slate-200 text-[#10B981]">✓</div>
                            <div className="py-2.5 border-b border-slate-200 text-[#10B981]">✓</div>
                            <div className="py-2.5 border-b border-slate-200 text-[#10B981]">✓</div>
                            <div className="py-2.5 text-[#10B981]">✓</div>
                        </div>
                        <div className="pt-4 space-y-2">
                            <Button
                                onClick={() => handleSelectPlan('Premium')}
                                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-[#10B981] hover:bg-[#059669] text-white transition-colors flex items-center justify-center gap-1"
                            >
                                <Star size={14} className="fill-amber-400 text-amber-500" />
                                <span>Nâng cấp ngay</span>
                            </Button>
                            <button
                                onClick={() => showToast('Bạn đã bắt đầu dùng thử Premium 7 ngày miễn phí!', 'success')}
                                className="w-full py-2 px-4 rounded-lg text-[10px] font-bold text-[#10B981] hover:bg-emerald-50 transition-colors"
                            >
                                Dùng thử 7 ngày miễn phí
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-6 mt-10">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-[#0F172A]">Mua lượt sử dụng lẻ</h3>
                    <p className="text-xs text-[#64748B]">Không cần đăng ký gói tháng, dùng bao nhiêu trả bấy nhiêu</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-6 rounded-2xl border-none shadow-sm flex flex-col items-center text-center space-y-4 bg-white">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#10B981]">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0F172A]">Đánh giá CV</h4>
                            <span className="text-sm font-semibold text-[#10B981]">20.000đ / lượt</span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => showToast('Đang chuyển hướng thanh toán cho Đánh giá CV...', 'info')}
                            className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-[#475569]"
                        >
                            Mua ngay
                        </Button>
                    </Card>
                    <Card className="p-6 rounded-2xl border-none shadow-sm flex flex-col items-center text-center space-y-4 bg-white">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#10B981]">
                            <Star size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0F172A]">Tạo CV</h4>
                            <span className="text-sm font-semibold text-[#10B981]">50.000đ / lượt</span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => showToast('Đang chuyển hướng thanh toán cho Tạo CV...', 'info')}
                            className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-[#475569]"
                        >
                            Mua ngay
                        </Button>
                    </Card>
                    <Card className="p-6 rounded-2xl border-none shadow-sm flex flex-col items-center text-center space-y-4 bg-white">
                        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-[#10B981]">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-[#0F172A]">Interview AI</h4>
                            <span className="text-sm font-semibold text-[#10B981]">79.000đ / lượt</span>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => showToast('Đang chuyển hướng thanh toán cho Interview AI...', 'info')}
                            className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-[#475569]"
                        >
                            Mua ngay
                        </Button>
                    </Card>
                </div>
            </div>

            <Card className="bg-[#E2E8F0] rounded-2xl p-6 space-y-4 shadow-sm border-none">
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
                            <span className="transition-transform duration-200" style={{transform: activeFaq === 1 ? 'rotate(180deg)' : 'none'}}>▼</span>
                        </button>
                        {activeFaq === 1 && (
                            <p className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                                Bạn hoàn toàn có thể tự hủy đăng ký hoặc hạ cấp bất kỳ thời gian nào từ bảng đăng ký
                                tài khoản. Quyền hạn của gói hiện có sẽ tiếp tục duy trì hoạt động đến hạn kế tiếp
                                của bạn.
                            </p>
                        )}
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                            onClick={() => toggleFaq(2)}
                            className="w-full px-4 py-3 text-left font-bold text-sm text-[#475569] flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <span>Hóa đơn của tôi sẽ được gửi như thế nào?</span>
                            <span className="transition-transform duration-200" style={{transform: activeFaq === 2 ? 'rotate(180deg)' : 'none'}}>▼</span>
                        </button>
                        {activeFaq === 2 && (
                            <p className="px-4 pb-4 text-xs text-[#64748B] leading-relaxed border-t border-slate-100 pt-3">
                                Hệ thống Smartfolio sẽ xuất hóa đơn PDF điện tử VAT tự động gửi thẳng vào địa chỉ
                                hòm thư điện tử cá nhân của bạn ngay sau mỗi chu kỳ giao dịch thành công.
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            <Card className="bg-gradient-to-r from-[#34D399] to-[#10B981] p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm border-none text-white">
                <div className="flex items-start space-x-3">
                    <HeartHandshake size={32} className="shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <h4 className="text-base font-bold">Cần hỗ trợ thêm?</h4>
                        <p className="text-xs opacity-90 max-w-md leading-relaxed">
                            Bạn có câu hỏi doanh nghiệp hoặc cần thiết kế layout mẫu CV cá nhân hóa biệt lập? Bộ
                            phận hỗ trợ 24/7 của Smartfolio luôn sẵn sàng giúp bạn.
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
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-[#0F172A] block">Thanh toán gói Premium</span>
                                        <span className="text-[10px] text-[#64748B]">Visa ending in 4242</span>
                                    </div>
                                </div>
                                <span className="text-sm font-extrabold text-[#10B981]">79.000 đ</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-xs text-[#64748B] bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    <Lock size={14} className="text-[#10B981]" />
                                    <span>Thanh toán được bảo mật qua Stripe SSL Encryption.</span>
                                </div>
                                <Button
                                    onClick={processPayment}
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                                        isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#10B981] hover:bg-[#059669]'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center space-x-2">
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Đang xử lý...</span>
                                        </span>
                                    ) : (
                                        <span>Xác nhận thanh toán</span>
                                    )}
                                </Button>
                            </div>
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
                                    <span>Thay đổi thẻ tín dụng</span>
                                    <ArrowRight size={14} className="text-[#64748B]" />
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentModal({ open: false, type: 'renew' });
                                        showToast('Đang tải lịch sử hóa đơn...', 'info');
                                    }}
                                    className="w-full p-3 rounded-xl border border-slate-200 text-left text-xs font-bold text-[#64748B] hover:bg-slate-50 transition-colors flex justify-between items-center"
                                >
                                    <span>Tải tất cả hóa đơn (PDF)</span>
                                    <ArrowRight size={14} className="text-[#64748B]" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default PricingPage;
