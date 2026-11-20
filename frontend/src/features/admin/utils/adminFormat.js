export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0));
const vietnamDateTime = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
});
const vietnamDate = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
});
export const dateTime = value => {
    if (!value) return 'Chưa có dữ liệu';
    const input = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)
        ? `${value}+07:00`
        : value;
    const date = new Date(input);
    return Number.isNaN(date.getTime()) ? 'Chưa có dữ liệu' : vietnamDateTime.format(date);
};
export const dateOnly = value => {
    if (!value) return '';
    const date = new Date(`${value}T00:00:00+07:00`);
    return Number.isNaN(date.getTime()) ? String(value) : vietnamDate.format(date);
};
export const statuses = { ACTIVE: 'Hoạt động', PENDING_VERIFICATION: 'Chờ xác thực', SUSPENDED: 'Tạm khóa', PAID: 'Đã thanh toán', PENDING: 'Chờ thanh toán', FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền' };
export function initialRange() {
    const to = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    const start = new Date(`${to}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() - 29);
    return { from: start.toISOString().slice(0, 10), to };
}
export function fillDaily(days, from, to) {
    const byDate = new Map(days.map(day => [day.date, day]));
    const result = [];
    for (const day = new Date(`${from}T00:00:00Z`); day <= new Date(`${to}T00:00:00Z`); day.setUTCDate(day.getUTCDate() + 1)) {
        const date = day.toISOString().slice(0, 10);
        result.push(byDate.get(date) || { date, revenue: 0, orders: 0 });
    }
    return result;
}
