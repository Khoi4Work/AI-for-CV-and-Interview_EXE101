import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { UpgradeInfo } from '../components/UpgradeInfo';
import { PaymentMethods } from '../components/PaymentMethods';
import { PaymentNotes } from '../components/PaymentNotes';
import { OrderSummary } from '../components/OrderSummary';
import { paymentService } from '../../../services/paymentService';

export function PaymentPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const serviceId = searchParams.get('serviceId');

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('BANK_TRANSFER');
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchServiceInfo() {
            console.log('PaymentPage: fetchServiceInfo called with serviceId:', serviceId);
            if (!serviceId) {
                console.log('PaymentPage: No serviceId found in URL');
                setError('Không tìm thấy ID dịch vụ');
                setLoading(false);
                return;
            }
            try {
                console.log('PaymentPage: Fetching payment services from API...');
                const services = await paymentService.getPaymentServices();
                console.log('PaymentPage: API response received. Services list:', services);

                if (!services || !Array.isArray(services)) {
                    console.error('PaymentPage: Services is not an array:', services);
                    setError('Lỗi dữ liệu dịch vụ không hợp lệ');
                    return;
                }

                const foundService = services.find(s => String(s.id) === String(serviceId));
                console.log('PaymentPage: Searching for service with id:', serviceId, 'Found:', foundService);

                if (foundService) {
                    setSelectedService(foundService);
                } else {
                    setError('Dịch vụ không tồn tại');
                }
            } catch (err) {
                console.error('PaymentPage: Error fetching service info:', err);
                setError('Lỗi tải thông tin dịch vụ');
            } finally {
                setLoading(false);
            }
        }
        fetchServiceInfo();
    }, [serviceId]);

    const handlePayment = async () => {
        if (!selectedService || !selectedPaymentMethod) {
            alert('Vui lòng chọn đầy đủ thông tin');
            return;
        }

        try {
            const response = await paymentService.createCheckoutOrder(
                selectedService.id,
                selectedPaymentMethod
            );

            if (response && response.checkoutUrl) {
                window.location.href = response.checkoutUrl;
            } else {
                alert('Không thể tạo đơn hàng thanh toán. Vui lòng thử lại.');
            }
        } catch (err) {
            alert('Đã xảy ra lỗi khi khởi tạo thanh toán. Vui lòng liên hệ hỗ trợ.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-12 px-4 md:px-6 font-sans flex justify-center items-center">
                <div className="text-white text-lg font-medium animate-pulse">Đang tải thông tin thanh toán...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-12 px-4 md:px-6 font-sans flex justify-center items-center">
                <div className="text-red-400 text-lg font-medium">{error}</div>
            </div>
        );
    }

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
                    <UpgradeInfo />
                    <PaymentMethods
                        selectedMethod={selectedPaymentMethod}
                        setSelectedMethod={setSelectedPaymentMethod}
                    />
                    <PaymentNotes />
                </div>
                <div className="w-full md:w-[380px] shrink-0">
                    <OrderSummary
                        service={selectedService}
                        selectedPaymentMethod={selectedPaymentMethod}
                        onPaymentClick={handlePayment}
                    />
                </div>
            </div>
        </div>
    );
}
