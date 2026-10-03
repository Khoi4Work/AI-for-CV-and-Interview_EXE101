import test from 'node:test';
import assert from 'node:assert/strict';
import { mapPaymentOrder } from '../src/features/user/utils/paymentHistory.js';

test('formats real order amounts, dates, service names and IDs', () => {
    const order = mapPaymentOrder({ id: '12345678-1234-1234-1234-123456789abc', serviceName: 'CV Middle', amount: '39000.00', orderedAt: '2026-10-03T10:00:00', paymentStatus: 'PAID' });
    assert.equal(order.serviceName, 'CV Middle');
    assert.ok(order.amountLabel.includes('39.000'));
    assert.equal(order.shortId, '12345678…9abc');
    assert.notEqual(order.dateLabel, 'Chưa có ngày');
    assert.equal(order.statusInfo.label, 'Đã thanh toán');
});

test('preserves payment status over generic order status and supports all filters', () => {
    for (const [status, label] of [['PENDING', 'Chờ thanh toán'], ['PAID', 'Đã thanh toán'], ['FAILED', 'Thất bại'], ['REFUNDED', 'Đã hoàn tiền']]) {
        const order = mapPaymentOrder({ paymentStatus: status, status: 'COMPLETED' });
        assert.equal(order.status, status);
        assert.equal(order.statusInfo.label, label);
    }
    assert.equal(mapPaymentOrder({ status: 'COMPLETED' }).status, 'PAID');
});

test('handles missing and invalid legacy fields without inventing amounts or dates', () => {
    const empty = mapPaymentOrder({ amount: null, orderedAt: 'invalid', paymentStatus: 'OTHER' });
    assert.equal(empty.amountLabel, '—');
    assert.equal(empty.dateLabel, 'Chưa có ngày');
    assert.equal(empty.serviceName, 'Gói dịch vụ');
    assert.equal(empty.statusInfo.label, 'Chưa rõ trạng thái');
    assert.ok(mapPaymentOrder({ amount: 0 }).amountLabel.includes('0'));
    assert.equal(mapPaymentOrder({ amount: 'invalid' }).amountLabel, '—');
});
