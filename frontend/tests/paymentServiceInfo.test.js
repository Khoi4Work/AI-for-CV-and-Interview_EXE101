import test from 'node:test';
import assert from 'node:assert/strict';
import { getPaymentServiceInfo } from '../src/features/payment/components/paymentServiceInfo.js';

test('maps all monthly catalog products using backend field names', () => {
    for (const [category, name, billingUnits, price] of [
        ['CV', 'CV Middle', 5, 39000],
        ['CV', 'CV Enhance', 10, 59000],
        ['INTERVIEW', 'Interview Middle', 30, 69000],
        ['INTERVIEW', 'Interview Enhance', 120, 129000],
    ]) {
        const info = getPaymentServiceInfo({ id: name, name, category, billingUnits, price, benefits: ['Benefit'] });
        assert.equal(info.id, name);
        assert.equal(info.name, name);
        assert.equal(info.duration, '1 tháng');
        assert.equal(info.quotaLabel, category === 'CV'
            ? `${billingUnits} lượt phân tích CV / tháng`
            : `${billingUnits} phút phỏng vấn / tháng`);
        assert.equal(info.formattedPrice, new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price));
        assert.deepEqual(info.benefits, ['Benefit']);
    }
});

test('supports numeric price strings and empty benefit lists', () => {
    const info = getPaymentServiceInfo({ id: 'cv', name: 'CV Middle', category: 'CV', billingUnits: 5, price: '39000' });
    assert.deepEqual(info.benefits, []);
    assert.ok(info.formattedPrice.includes('39.000'));
});

test('rejects incomplete or invalid catalog records before checkout', () => {
    const valid = { id: 'cv', name: 'CV Middle', category: 'CV', billingUnits: 5, price: 39000 };
    for (const override of [{ id: null }, { name: null }, { price: null }, { price: 'invalid' }, { price: -1 }, { category: 'OTHER' }, { billingUnits: null }, { billingUnits: 0 }]) {
        assert.throws(() => getPaymentServiceInfo({ ...valid, ...override }), /không hợp lệ/);
    }
});
