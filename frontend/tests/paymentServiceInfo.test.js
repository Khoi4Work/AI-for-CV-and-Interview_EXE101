import test from 'node:test';
import assert from 'node:assert/strict';
import { getPaymentServiceInfo } from '../src/features/payment/components/paymentServiceInfo.js';

test('maps one-time catalog products with non-expiring quotas', () => {
    for (const [category, name, packageCode, billingUnits, price] of [
        ['CV', 'CV Middle', 'MIDDLE', 3, 39000],
        ['CV', 'CV Enhance', 'ENHANCE', 4, 59000],
        ['INTERVIEW', 'Interview Middle', 'MIDDLE', 30, 69000],
        ['INTERVIEW', 'Interview Enhance', 'ENHANCE', 120, 129000],
    ]) {
        const info = getPaymentServiceInfo({ id: name, name, category, packageCode, billingUnits, price, benefits: ['Benefit'] });
        assert.equal(info.id, name);
        assert.equal(info.name, name);
        assert.equal(info.duration, 'Không hết hạn');
        assert.equal(info.quotaLabel, category === 'CV'
            ? `${billingUnits} lượt tạo CV · tối đa ${packageCode === 'ENHANCE' ? 5 : 3} lượt phân tích/CV · không hết hạn`
            : `${billingUnits} phút phỏng vấn · mua một lần, không hết hạn`);
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
