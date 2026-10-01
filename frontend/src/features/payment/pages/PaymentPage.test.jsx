import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PaymentPage } from './PaymentPage';
import { paymentService } from '../../../services/paymentService';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../services/paymentService');

const mockServices = [
    {
        serviceId: 'uuid-middle',
        serviceName: 'Gói Middle',
        price: 100000,
        duration: '1 tháng',
        description: 'Gói cơ bản cho sinh viên',
        benefits: ['Quyền lợi 1', 'Quyền lợi 2'],
        isPopular: false
    },
    {
        serviceId: 'uuid-enhance',
        serviceName: 'Gói Enhance',
        price: 200000,
        duration: '1 tháng',
        description: 'Gói cao cấp cho chuyên gia',
        benefits: ['Quyền lợi 1', 'Quyền lợi 2', 'Quyền lợi 3'],
        isPopular: true
    }
];

describe('PaymentPage E2E Test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('1. Hiển thị gói dịch vụ Middle chính xác', async () => {
        paymentService.getPaymentServices.mockResolvedValue(mockServices);

        render(
            <MemoryRouter initialEntries={['/payment?serviceId=uuid-middle']}>
                <PaymentPage />
            </MemoryRouter>
        );

        // Kiểm tra Loading
        expect(screen.getByText(/Đang tải thông tin thanh toán.../i)).toBeInTheDocument();

        // Kiểm tra hiển thị thông tin gói Middle
        await waitFor(() => {
            expect(screen.getByText('Gói Middle')).toBeInTheDocument();
            expect(screen.getByText(/100\.000 ₫/i)).toBeInTheDocument();
        });
    });

    test('2. Hiển thị gói dịch vụ Enhance chính xác', async () => {
        paymentService.getPaymentServices.mockResolvedValue(mockServices);

        render(
            <MemoryRouter initialEntries={['/payment?serviceId=uuid-enhance']}>
                <PaymentPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Gói Enhance')).toBeInTheDocument();
            expect(screen.getByText(/200\.000 ₫/i)).toBeInTheDocument();
            expect(screen.getByText('PHỔ BIẾN')).toBeInTheDocument();
        });
    });

    test('3. Chỉ hiển thị PayOS và được chọn mặc định', async () => {
        paymentService.getPaymentServices.mockResolvedValue(mockServices);

        render(
            <MemoryRouter initialEntries={['/payment?serviceId=uuid-middle']}>
                <PaymentPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('PayOS (Ngân hàng/QR)')).toBeInTheDocument();
            // Kiểm tra không có phương thức khác (ví dụ MoMo)
            expect(screen.queryByText('MoMo')).not.toBeInTheDocument();
        });
    });

    test('4. Luồng tạo đơn hàng (Checkout) thành công', async () => {
        paymentService.getPaymentServices.mockResolvedValue(mockServices);
        paymentService.createCheckoutOrder.mockResolvedValue({ checkoutUrl: 'https://payos.vn/checkout/123' });

        window.location = { href: '' };

        render(
            <MemoryRouter initialEntries={['/payment?serviceId=uuid-middle']}>
                <PaymentPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            const payButton = screen.getByText('Thanh toán ngay');
            fireEvent.click(payButton);
        });

        await waitFor(() => {
            expect(paymentService.createCheckoutOrder).toHaveBeenCalledWith('uuid-middle', 'BANK_TRANSFER');
            expect(window.location.href).toBe('https://payos.vn/checkout/123');
        });
    });

    test('5. Xử lý lỗi khi serviceId không tồn tại', async () => {
        paymentService.getPaymentServices.mockResolvedValue(mockServices);

        render(
            <MemoryRouter initialEntries={['/payment?serviceId=invalid-id']}>
                <PaymentPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Dịch vụ không tồn tại')).toBeInTheDocument();
        });
    });

    test('6. Xử lý lỗi khi API fetch services thất bại', async () => {
        paymentService.getPaymentServices.mockRejectedValue(new Error('API Error'));

        render(
            <MemoryRouter initialEntries={['/payment?serviceId=uuid-middle']}>
                <PaymentPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Lỗi tải thông tin dịch vụ')).toBeInTheDocument();
        });
    });
});
