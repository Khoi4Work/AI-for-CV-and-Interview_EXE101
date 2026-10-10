export const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value ?? 0));
export const dateTime = value => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có dữ liệu';
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
