import test from 'node:test';
import assert from 'node:assert/strict';
import { fillDaily, initialRange, money } from '../src/features/admin/utils/adminFormat.js';

test('daily chart fills missing dates without changing returned amounts', () => {
    const days = [{ date: '2026-10-02', revenue: '39000.50', orders: 1 }];
    const result = fillDaily(days, '2026-10-01', '2026-10-03');
    assert.equal(result.length, 3);
    assert.equal(result[0].revenue, 0);
    assert.equal(result[1].revenue, '39000.50');
    assert.equal(result[2].orders, 0);
    assert.equal(days.length, 1);
});
test('admin defaults to a 30-day range and formats zero VND amounts', () => {
    const { from, to } = initialRange();
    assert.equal((new Date(to) - new Date(from)) / 86400000, 29);
    assert.match(money(0), /0/);
});
