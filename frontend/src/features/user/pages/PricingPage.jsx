import React, {useState} from 'react';
import {CreditCard, Calendar, BarChart3, HelpCircle, Check, ArrowRight, Star, HeartHandshake, Lock} from 'lucide-react';
import {useAuth} from '../../auth/contexts/AuthContext.jsx';
import {useApp} from '../../auth/contexts/AppContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';

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
        <div className="space-y-10 pb-16 text-on-surface">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div
                    className="lg:col-span-7 glass-panel rounded-2xl border border-outline-variant p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <span
                                        className="text-[10px] font-bold font-mono bg-primary-container text-primary border border-primary-container px-2 py-0.5 rounded-md">
                                        GÓI HIỆN TẠI
                                    </span>
                                    <span className="text-xs text-on-surface-variant font-medium">Bảo trì kế tiếp</span>
                                </div>
                                <h3 className="text-2xl font-bold text-primary">{profile.membershipType} Plan</h3>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-on-surface-variant font-bold block uppercase">Ngày gia hạn tiếp theo</span>
                                <span
                                    className="text-xs font-semibold text-on-surface-variant block mt-0.5">31 Tháng 12, 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-6">
                        <button
                            id="pricing-renew-now-btn"
                            onClick={() => setPaymentModal({ open: true, type: 'renew' })}
                            className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                        >
                            Gia hạn ngay
                        </button>
                        <button
                            id="pricing-manage-billing-btn"
                            onClick={() => setPaymentModal({ open: true, type: 'manage' })}
                            className="bg-surface-container hover:bg-surface-container-low border border-outline-variant text-on-surface-variant text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                        >
                            Quản lý thanh toán
                        </button>
                    </div>
                </div>

                <div
                    className="lg:col-span-5 glass-panel rounded-2xl border border-outline-variant p-6 flex flex-col justify-between shadow-sm min-h-[220px]">
                    <div>
                        <h4 className="text-[10px] font-bold tracking-wider text-on-surface-variant uppercase pb-2 border-b border-outline-variant">
                            LỊCH SỬ THANH TOÁN
                        </h4>

                        <div className="divide-y divide-outline-variant mt-2">
                            {invoices.map((inv, i) => (
                                <div key={i} className="flex justify-between items-center py-2 text-xs">
                                    <span className="text-on-surface-variant font-mono">{inv.date}</span>
                                    <span className="text-on-surface-variant">{inv.id}</span>
                                    <span className="font-bold text-primary">{inv.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        id="pricing-view-billing-history"
                        onClick={() => showToast('Lịch sử thanh toán chi tiết sẽ được tải về dưới dạng PDF.', 'info')}
                        className="text-center text-[10px] font-bold text-on-surface-variant hover:text-primary transition-colors mt-4 self-center block"
                    >
                        Xem tất cả lịch sử
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-on-surface">Chọn gói dịch vụ phù hợp với bạn</h3>
                </div>

                <div className="glass-panel rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
                    <div
                        className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-outline-variant items-stretch">
                        {/* CỘT 1: TÍNH NĂNG */}
                        <div className="p-6 flex flex-col justify-between bg-surface-container-low/40">
                            <div className="pb-6 min-h-[96px] flex flex-col justify-center">
                                <span className="text-base font-bold text-on-surface uppercase tracking-wide">Tính năng</span>
                            </div>

                            <div className="space-y-5 text-on-surface-variant text-xs font-semibold select-none py-4 flex-1">
                                <div className="py-2.5 border-b border-outline-variant">Số lượng CV tối đa</div>
                                <div className="py-2.5 border-b border-outline-variant">AI Optimizer (Gợi ý từ khoá)</div>
                                <div className="py-2.5 border-b border-outline-variant">Xuất PDF cao cấp</div>
                                <div className="py-2.5 border-b border-outline-variant">Phân tích chuyên sâu</div>
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
                                        className="text-[10px] text-on-surface-variant font-bold uppercase block">MIỄN PHÍ</span>
                                    <h4 className="text-xl font-bold text-on-surface mt-1">Free</h4>
                                </div>
                                <div className="text-sm font-semibold text-primary">
                                    0đ / tháng
                                </div>
                            </div>
                            <div className="space-y-5 text-xs text-on-surface-variant font-medium py-4 flex-1">
                                <div className="py-2.5 border-b border-outline-variant">3 bản CV</div>
                                <div className="py-2.5 border-b border-outline-variant text-on-surface-variant">✗</div>
                                <div className="py-2.5 border-b border-outline-variant">✗</div>
                                <div className="py-2.5 border-b border-outline-variant text-on-surface-variant">✗</div>
                                <div className="py-2.5 text-on-surface-variant">✗</div>
                            </div>
                            <div className="pt-4">
                                <button
                                    id="pricing-pkg-free-btn"
                                    disabled={profile.membershipType === 'Free'}
                                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center ${
                                        profile.membershipType === 'Free'
                                            ? 'bg-surface-container text-on-surface-variant cursor-not-allowed border border-outline-variant'
                                            : 'border border-outline-variant hover:bg-surface-container-low text-on-surface-variant'
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
                                        className="text-[10px] text-on-surface-variant font-bold uppercase block">CHUYÊN GIA</span>
                                    <h4 className="text-xl font-bold text-on-surface mt-1">Premium</h4>
                                </div>
                                <div className="text-sm font-semibold text-primary">
                                    99.000đ / tháng
                                </div>
                            </div>
                            <div className="space-y-5 text-xs text-on-surface-variant font-medium py-4 flex-1">
                                <div className="py-2.5 border-b border-outline-variant">Vô hạn CV</div>
                                <div className="py-2.5 border-b border-outline-variant text-primary">✓</div>
                                <div className="py-2.5 border-b border-outline-variant text-primary">✓</div>
                                <div className="py-2.5 border-b border-outline-variant text-primary">✓</div>
                                <div className="py-2.5 text-primary">✓</div>
                            </div>
                            <div className="pt-4 space-y-2">
                                <button
                                    id="pricing-pkg-premium-btn"
                                    onClick={() => handleSelectPlan('Premium')}
                                    className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-primary hover:bg-primary-container border border-primary text-on-primary transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                                >
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0"/>
                                    <span>Nâng cấp ngay</span>
                                </button>
                                <button
                                    onClick={() => showToast('Bạn đã bắt đầu dùng thử Premium 7 ngày miễn phí!', 'success')}
                                    className="w-full py-2 px-4 rounded-lg text-[10px] font-bold text-primary hover:bg-primary-container transition-colors cursor-pointer"
                                >
                                    Dùng thử 7 ngày miễn phí
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 mt-10">
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <h3 className="text-lg font-bold text-on-surface">Mua lượt sử dụng lẻ</h3>
                        <p className="text-xs text-on-surface-variant">Không cần đăng ký gói tháng, dùng bao nhiêu trả bấy nhiêu</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div >
                                <h4 className="font-bold text-on-surface">Đánh giá CV</h4>
                                <span className="text-sm font-semibold text-primary">20.000đ / lượt</span>
                            </div>
                            <button
                                onClick={() => showToast('Đang chuyển hướng thanh toán cho Đánh giá CV...', 'info')}
                                className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-surface-container hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer"
                            >
                                Mua ngay
                            </button>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
                                <Star className="w-5 h-5" />
                            </div>
                            <div >
                                <h4 className="font-bold text-on-surface">Tạo CV</h4>
                                <span className="text-sm font-semibold text-primary">50.000đ / lượt</span>
                            </div>
                            <button
                                onClick={() => showToast('Đang chuyển hướng thanh toán cho Tạo CV...', 'info')}
                                className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-surface-container hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer"
                            >
                                Mua ngay
                            </button>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-primary">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <div >
                                <h4 className="font-bold text-on-surface">Interview AI</h4>
                                <span className="text-sm font-semibold text-primary">79.000đ / lượt</span>
                            </div>
                            <button
                                onClick={() => showToast('Đang chuyển hướng thanh toán cho Interview AI...', 'info')}
                                className="w-full py-2 px-4 rounded-lg text-xs font-bold bg-surface-container hover:bg-surface-container-low text-on-surface-variant transition-colors cursor-pointer"
                            >
                                Mua ngay
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-low rounded-2xl border border-outline-variant p-6 space-y-4 shadow-sm">
                    <div className="flex items-center space-x-2 pb-3 border-b border-outline-variant">
                        <HelpCircle className="w-5 h-5 text-primary"/>
                        <h3 className="font-bold text-on-surface">Câu hỏi thường gặp</h3>
                    </div>

                    <div className="space-y-3">
                        <div className="border border-outline-variant rounded-xl overflow-hidden glass-panel">
                            <button
                                onClick={() => toggleFaq(1)}
                                className="w-full px-4 py-3 text-left font-bold text-xs sm:text-sm text-on-surface-variant flex items-center justify-between hover:bg-surface-container-low transition-colors"
                            >
                                <span>Tôi có thể hủy gói dịch vụ bất cứ lúc nào không?</span>
                                <span className="text-on-surface-variant font-bold transition-transform duration-200"
                                      style={{transform: activeFaq === 1 ? 'rotate(180deg)' : 'none'}}>
                                    ▼
                                </span>
                            </button>
                            {activeFaq === 1 && (
                                <p className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant pt-3">
                                    Bạn hoàn toàn có thể tự hủy đăng ký hoặc hạ cấp bất kỳ thời gian nào từ bảng đăng ký
                                    tài khoản. Quyền hạn của gói hiện có sẽ tiếp tục duy trì hoạt động đến hạn kế tiếp
                                    của bạn.
                                </p>
                            )}
                        </div>

                        <div className="border border-outline-variant rounded-xl overflow-hidden glass-panel">
                            <button
                                onClick={() => toggleFaq(2)}
                                className="w-full px-4 py-3 text-left font-bold text-xs sm:text-sm text-on-surface-variant flex items-center justify-between hover:bg-surface-container-low transition-colors"
                            >
                                <span>Hóa đơn của tôi sẽ được gửi như thế nào?</span>
                                <span className="text-on-surface-variant font-bold transition-transform duration-200"
                                      style={{transform: activeFaq === 2 ? 'rotate(180deg)' : 'none'}}>
                                    ▼
                                </span>
                            </button>
                            {activeFaq === 2 && (
                                <p className="px-4 pb-4 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant pt-3">
                                    Hệ thống Smartfolio sẽ xuất hóa đơn PDF điện tử VAT tự động gửi thẳng vào địa chỉ
                                    hòm thư điện tử cá nhân của bạn ngay sau mỗi chu kỳ giao dịch thành công.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className="ai-gradient-bg rounded-2xl border border-primary-container p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
                    <div className="flex items-start space-x-3 text-on-surface">
                        <HeartHandshake className="w-8 h-8 text-primary shrink-0 mt-0.5"/>
                        <div className="space-y-1">
                            <h4 className="text-base font-bold text-primary">Cần hỗ trợ thêm?</h4>
                            <p className="text-xs text-on-surface-variant max-w-max leading-relaxed">
                                Bạn có câu hỏi doanh nghiệp hoặc cần thiết kế layout mẫu CV cá nhân hóa biệt lập? Bộ
                                phận hỗ trợ 24/7 của Smartfolio luôn sẵn sàng giúp bạn.
                            </p>
                        </div>
                    </div>
                    <button
                        id="pricing-contact-support-btn"
                        onClick={() => showToast('Đã mở hộp thoại trò chuyện cùng tư vấn viên!', 'success')}
                        className="bg-primary hover:bg-primary-container hover:shadow-md text-on-primary text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer whitespace-nowrap"
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
                            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-on-surface block">Thanh toán gói Premium</span>
                                        <span className="text-[10px] text-on-surface-variant">Visa ending in 4242</span>
                                    </div>
                                </div>
                                <span className="text-sm font-extrabold text-primary">79.000 đ</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-xs text-on-surface-variant bg-primary-container/50 p-2 rounded-lg border border-primary-container">
                                    <Lock className="w-3.5 h-3.5 text-primary" />
                                    <span>Thanh toán được bảo mật qua Stripe SSL Encryption.</span>
                                </div>
                                <button
                                    onClick={processPayment}
                                    disabled={isProcessing}
                                    className={`w-full py-3 rounded-xl text-xs font-bold text-on-primary transition-all flex items-center justify-center space-x-2 ${
                                        isProcessing ? 'bg-outline cursor-not-allowed' : 'bg-primary hover:bg-primary-container'
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
                            <p className="text-xs text-on-surface-variant leading-relaxed">
                                Bạn có thể quản lý phương thức thanh toán, xem hóa đơn chi tiết và thay đổi chu kỳ thanh toán (Hàng tháng / Hàng năm).
                            </p>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => {
                                        setPaymentModal({ open: false, type: 'renew' });
                                        showToast('Đang chuyển hướng đến cổng Stripe...', 'info');
                                    }}
                                    className="w-full p-3 rounded-xl border border-outline-variant text-left text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors flex justify-between items-center"
                                >
                                    <span>Thay đổi thẻ tín dụng</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
                                </button>
                                <button
                                    onClick={() => {
                                        setPaymentModal({ open: false, type: 'renew' });
                                        showToast('Đang tải lịch sử hóa đơn...', 'info');
                                    }}
                                    className="w-full p-3 rounded-xl border border-outline-variant text-left text-xs font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors flex justify-between items-center"
                                >
                                    <span>Tải tất cả hóa đơn (PDF)</span>
                                    <ArrowRight className="w-3.5 h-3.5 text-on-surface-variant" />
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
