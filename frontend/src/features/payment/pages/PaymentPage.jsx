import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { UpgradeInfo } from '../components/UpgradeInfo';
import { PaymentMethods } from '../components/PaymentMethods';
import { PaymentNotes } from '../components/PaymentNotes';
import { OrderSummary } from '../components/OrderSummary';
import { paymentService } from '../services/paymentService';
import { getPaymentServiceInfo } from '../components/paymentServiceInfo';
import {trackEvent, trackEventBeforeRedirectOnce} from '../../analytics/analyticsClient.js';
import {categorizeAnalyticsError} from '../../analytics/sanitizeAnalytics.js';
import {useApp} from '../../auth/contexts/AppContext.jsx';

export function PaymentPage() {
    const navigate = useNavigate();
    const {showToast} = useApp();
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get('serviceId');

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('BANK_TRANSFER');
    const [serviceState, setServiceState] = useState(null);
    const [checkingOut, setCheckingOut] = useState(false);
    const checkoutInProgress = useRef(false);
    const currentState = serviceState?.serviceId === serviceId ? serviceState : null;
    const selectedService = currentState?.service || null;
    const loading = Boolean(serviceId) && !currentState;
    const error = !serviceId ? 'Không tìm thấy ID dịch vụ' : currentState?.error;

    useEffect(() => {
        let active = true;
        async function fetchServiceInfo() {
            if (!serviceId) return;
            try {
                const services = await paymentService.getPaymentServices();
                if (!Array.isArray(services)) {
                    throw new Error('Lỗi dữ liệu dịch vụ không hợp lệ');
                }
                const foundService = services.find(s => String(s.id) === String(serviceId));
                if (!foundService) {
                    if (active) setServiceState({ serviceId, error: 'Dịch vụ không tồn tại' });
                    return;
                }
                const service = getPaymentServiceInfo(foundService);
                if (active) setServiceState({ serviceId, service });
            } catch (err) {
                console.error('PaymentPage: Error fetching service info:', err);
                trackEvent('feature_error', {feature: 'payment_catalog', error_category: categorizeAnalyticsError(err)});
                if (active) setServiceState({ serviceId, error: 'Không thể tải thông tin gói. Vui lòng thử lại.' });
            }
        }
        fetchServiceInfo();
        return () => { active = false; };
    }, [serviceId]);

    const handlePayment = async () => {
        if (checkoutInProgress.current) return;
        if (!selectedService || !selectedPaymentMethod) {
            showToast('Vui lòng chọn đầy đủ thông tin', 'error');
            return;
        }

        checkoutInProgress.current = true;
        setCheckingOut(true);
        let redirecting = false;
        try {
            const response = await paymentService.createCheckoutOrder(
                selectedService.id,
                selectedPaymentMethod
            );

            if (response && response.checkoutUrl) {
                const orderId = response.id;
                const packageCode = `${selectedService.category}_${selectedService.packageCode}`.toLowerCase();
                if (orderId) {
                    await trackEventBeforeRedirectOnce('begin_checkout', {
                        currency: 'VND',
                        value: Number(selectedService.price),
                        package_code: packageCode,
                        items: [{
                            item_id: packageCode,
                            price: Number(selectedService.price),
                            quantity: 1,
                        }],
                    }, 'begin_checkout', orderId, 300);
                }
                window.location.href = response.checkoutUrl;
                redirecting = true;
            } else {
                trackEvent('feature_error', {feature: 'checkout', error_category: 'provider'});
                showToast('Không thể tạo đơn hàng thanh toán. Vui lòng thử lại.', 'error');
            }
        } catch (error) {
            trackEvent('feature_error', {feature: 'checkout', error_category: categorizeAnalyticsError(error)});
            showToast('Đã xảy ra lỗi khi khởi tạo thanh toán. Vui lòng liên hệ hỗ trợ.', 'error');
        } finally {
            if (!redirecting) {
                checkoutInProgress.current = false;
                setCheckingOut(false);
            }
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 md:px-6 font-sans flex justify-center relative">
            <button
                onClick={() => navigate('/pricing')}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
                title="Quay lại trang giá"
            >
                <X size={24} />
            </button>
            <div className="w-full max-w-[1000px] flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex flex-col gap-8 min-w-0">
                    <UpgradeInfo service={selectedService} loading={loading} error={error} />
                    <PaymentMethods
                        selectedMethod={selectedPaymentMethod}
                        setSelectedMethod={setSelectedPaymentMethod}
                    />
                    <PaymentNotes />
                </div>
                <div className="w-full md:w-[380px] shrink-0">
                    <OrderSummary
                        service={selectedService}
                        loading={loading}
                        error={error}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onPaymentClick={handlePayment}
                        checkingOut={checkingOut}
                    />
                </div>
            </div>
        </div>
    );
}
