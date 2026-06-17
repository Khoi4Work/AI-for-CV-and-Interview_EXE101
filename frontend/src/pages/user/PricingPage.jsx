import React, {useState} from 'react';
import {CreditCard, Calendar, BarChart3, HelpCircle, Check, ArrowRight, Star, HeartHandshake, Lock} from 'lucide-react';
import {useAuth} from '../../contexts/AuthContext.jsx';
import {useApp} from '../../contexts/AppContext.jsx';
import Modal from '../../components/ui/Modal.jsx';

const PricingPage = () => {
    const [activeFaq, setActiveFaq] = useState(null);
    const [paymentModal, setPaymentModal] = useState({ open: false, type: 'renew' });
    const [isProcessing, setIsProcessing] = useState(false);
    const {profile, handleUpgradePlan} = useAuth();
    const {showToast} = useApp();

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
        {date: '15/11/2024', id: '#INV-2941', amount: '79.000 đ'},
        {date: '15/10/2024', id: '#INV-2812', amount: '79.000 đ'},
        {date: '15/09/2024', id: '#INV-2655', amount: '79.000 đ'},
    ];

    return (
        <div className="space-y-10 pb-16 text-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div
                    className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span
                                        className="text-[10px] font-bold font-mono bg-blue-50 text-blue-600 border border-blue-150 px-2 py-0.5 rounded-md">
                                        GÓI HIỆN TẠI
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">Bảo trì kế tiếp</span>
                                </div>
                                <h3 className="text-2xl font-bold text-[#0b3c8f]">{profile.membershipType} Plan</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 font-bold block uppercase">Ngày gia hạn tiếp theo</span>
                                <span
                                    className="text-xs font-semibold text-slate-700 block mt-0.5">31 Tháng 12, 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-6">
                        <button
                            id="pricing-renew-now-btn"
                            onClick={() => setPaymentModal({ open: true, type: 'renew' })}
                            className="bg-[#0b3c8f] hover:bg-[#093278] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                            Gia hạn ngay
                        </button>
                        <button
                            id="pricing-manage-billing-btn"
                            onClick={() => setPaymentModal({ open: true, type: 'manage' })}
                            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            Quản lý thanh toán
                        </button>
                    </div>
                </div>

                <div
                    className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
                    <div>
                        <h4 className="text-[10px] font-bold tracking-wider text-slate-400 uppercase pb-2 border-b border-slate-100">
                            LỊCH SỬ THANH TOÁN
                        </h4>

                        <div className="divide-y divide-slate-100 mt-2">
                            {invoices.map((inv, i) => (
                                <div key={i} className="flex justify-between items-center py-2 text-xs">
                                    <span className="text-slate-500 font-mono">{inv.date}</span>
                                    <span className="text-slate-400">{inv.id}</span>
                                    <span className="font-bold text-[#0b3c8f]">{inv.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        id="pricing-view-billing-history"
                        onClick={() => showToast('Lịch sử thanh toán chi tiết sẽ được tải về dưới dạng PDF.', 'info')}
                        className="text-center text-[10px] font-bold text-slate-400 hover:text-[#0b3c8f] transition-colors mt-4 self-center block"
                    >
                        Xem tất cả lịch sử
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-slate-900">Chọn gói dịch vụ phù hợp với bạn</h3>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div
                        className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 items-stretch">
                        {/* CỘT 1: TÍNH NĂNG */}
                        <div className="p-6 flex flex-col justify-between bg-slate-50/40">
                            <div className="pb-6 min-h-[96px] flex flex-col justify-center">
                                <span className="text-base font-bold text-slate-800 uppercase tracking-wide">Tính năng</span>
                            </div>

                            <div className="space-y-5 text-slate-500 text-xs font-semibold select-none py-4 flex-1">
                                <div className="py-2.5 border-b border-slate-100">Số lượng CV tối đa</div>
                                <div className="py-2.5 border-b border-slate-100">AI Optimizer (Gợi ý từ khoá)</div>
                                <div className="py-2.5 border-b border-slate-100">Xuất PDF cao cấp</div>
                                <div className="py-2.5 border-b border-slate-100">Phân tích chuyên sâu</div>
                                <div className="py-2.5">Phỏng vấn với AI</div>
                            </div>

                            <div className="pt-4 opacity-0 pointer-events-none select-none aria-hidden">
                                <button className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold border border-transparent">
                                    Nút tàng hình
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col justify-between text-center min-h-[360px] relative">
                            <div className="space-y-3 pb-6 min-h-[96px] flex flex-col justify-between">
                                <div>
                                    <span
                                        className="text-[10px] text-slate-400 font-bold uppercase block">MIỄN PHÍ</span>
                                    <h4 className="text-xl font-bold text-slate-800 mt-1">Free</h4>
                                </div>
                                <div className="text-sm font-semibold text-[#0b3c8f]">
                                    0đ / tháng
                                </div>
                            </div>
                            <div className="space-y-5 text-xs text-slate-600 font-medium py-4 flex-1">
                                <div className="py-2.5 border-b border-slate-100">3 bản CV</div>
                                <div className="py-2.5 border-b border-slate-100 text-slate-400">✗</div>
                                <div className="py-2.5 border-b border-slate-100">✗</div>
                                <div className="py-2.5 border-b border-slate-100 text-slate-400">✗</div>
                                <div className="py-2.5 text-slate-400">✗</div>
                            </div>
                            <div className="pt-4">
                                <button
                                    id="pricing-pkg-free-btn"
                                    disabled={profile.membershipType === 'Free'}
                                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                                        profile.membershipType === 'Free'
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                            : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {profile.membershipType === 'Free' ? 'Đang sử dụng' : 'Chuyển đổi'}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 flex flex-col justify-between text-center min-h-[360px] relative">
                            <div className="space-y-3 pb-6 min-h-[96px] flex flex-col justify-between">
                                <div>
                                    <span
                                        className="text-[10px] text-slate-400 font-bold uppercase block">CHUYÊN GIA</span>
                                    <h4 className="text-xl font-bold text-slate-800 mt-1">Premium</h4>
                                </div>
                                <div className="text-sm font-semibold text-[#0b3c8f]">
                                    79.000đ / tháng
                                </div>
                            </div>
                            <div className="space-y-5 text-xs text-slate-600 font-medium py-4 flex-1">
                                <div className="py-2.5 border-b border-slate-100">Vô hạn CV</div>
                                <div className="py-2.5 border-b border-slate-100 text-emerald-600">✓</div>
                                <div className="py-2.5 border-b border-slate-100 text-emerald-600">✓</div>
                                <div className="py-2.5 border-b border-slate-100 text-emerald-600">✓</div>
                                <div className="py-2.5 text-emerald-600">✓</div>
                            </div>
                            <div className="pt-4">
                                <button
                                    id="pricing-pkg-premium-btn"
                                    onClick={() => handleSelectPlan('Premium')}
                                    className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-indigo-900 hover:bg-slate-900 border border-indigo-950 text-white transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                                >
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0"/>
                                    <span>Nâng cấp ngay</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
                    <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                        <HelpCircle className="w-5 h-5 text-[#0b3c8f]"/>
                        <h3 className="font-bold text-slate-800">Câu hỏi thường gặp</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
                            <button
                                onClick={() => toggleFaq(1)}
                                className="w-full px-4 py-3 text-left font-bold text-xs sm:text-sm text-slate-700 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <span>Tôi có thể hủy gói dịch vụ bất cứ lúc nào không?</span>
                                <span className="text-slate-400 font-bold transition-transform duration-200"
                                      style={{transform: activeFaq === 1 ? 'rotate(180deg)' : 'none'}}>
                                    ▼
                                </span>
                            </button>
                            {activeFaq === 1 && (
                                <p className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                                    Bạn hoàn toàn có thể tự hủy đăng ký hoặc hạ cấp bất kỳ thời gian nào từ bảng đăng ký
                                    tài khoản. Quyền hạn của gói hiện có sẽ tiếp tục duy trì hoạt động đến hạn kế tiếp
                                    của bạn.
                                </p>
                            )}
                        </div>

                        <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
                            <button
                                onClick={() => toggleFaq(2)}
                                className="w-full px-4 py-3 text-left font-bold text-xs sm:text-sm text-slate-700 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <span>Hóa đơn của tôi sẽ được gửi như thế nào?</span>
                                <span className="text-slate-400 font-bold transition-transform duration-200"
                                      style={{transform: activeFaq === 2 ? 'rotate(180deg)' : 'none'}}>
                                    ▼
                                </span>
                            </button>
                            {activeFaq === 2 && (
                                <p className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-3">
                                    Hệ thống Smartfolio sẽ xuất hóa đơn PDF điện tử VAT tự động gửi thẳng vào địa chỉ
                                    hòm thư điện tử cá nhân của bạn ngay sau mỗi chu kỳ giao dịch thành công.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 rounded-2xl border border-blue-100/50 p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
                    <div className="flex items-start space-x-3 text-slate-700">
                        <HeartHandshake className="w-8 h-8 text-[#0b3c8f] shrink-0 mt-0.5"/>
                        <div className="space-y-1">
                            <h4 className="text-base font-bold text-[#0b3c8f]">Cần hỗ trợ thêm?</h4>
                            <p className="text-xs text-slate-500 max-w-max leading-relaxed">
                                Bạn có câu hỏi doanh nghiệp hoặc cần thiết kế layout mẫu CV cá nhân hóa biệt lập? Bộ
                                phận hỗ trợ 24/7 của Smartfolio luôn sẵn sàng giúp bạn.
                            </p>
                        </div>
                    </div>
                    <button
                        id="pricing-contact-support-btn"
                        onClick={() => showToast('Đã mở hộp thoại trò chuyện cùng tư vấn viên!', 'success')}
                        className="bg-[#0b3c8f] hover:bg-[#093278] hover:shadow-md text-white text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
                    >
                        Liên hệ tư vấn
                    </button>
                </div>
            </div>

            <Modal
                isOpen={paymentModal.open}
                onClose={() => setPaymentModal({ open: false, type: 'renew' })}
                title={paymentModal.type === 'renew' ? 'Gia hạn gói dịch vụ' : 'Quản lý thanh toán'}
            >
                <div className="space-y-6">
                    {paymentModal.type === 'renew' ? (
                        <>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 block">Thanh toán gói Premium</span>
                                        <span className="text-[10px] text-slate-400">Visa ending in 4242</span>
                                    </div>
                                </div>
                                <span className="text-sm font-extrabold text-[#0b3c8f]">79.000 đ</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-xs text-slate-500 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Thanh toán được bảo mật qua Stripe SSL Encryption.</span>
                                </div>
                                <button
                                    onClick={processPayment}
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center space-x-2 ${
                                        isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0b3c8f] hover:bg-[#093278]'
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
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Bạn có thể quản lý phương thức thanh toán, xem hóa đơn chi tiết và thay đổi chu kỳ thanh toán (Hàng tháng / Hàng năm).
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => {
                                        setPaymentModal({ open: false, type: 'renew' });
                                        showToast('Đang chuyển hướng đến cổng Stripe...', 'info');
                                    }}
                                    className="w-full p-3 rounded-xl border border-slate-200 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex justify-between items-center"
                                >
                                    <span>Thay đổi thẻ tín dụng</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentModal({ open: false, type: 'renew' });
                                        showToast('Đang tải lịch sử hóa đơn...', 'info');
                                    }}
                                    className="w-full p-3 rounded-xl border border-slate-200 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex justify-between items-center"
                                >
                                    <span>Tải tất cả hóa đơn (PDF)</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
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
