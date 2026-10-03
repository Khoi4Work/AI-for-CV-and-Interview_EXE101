export const paymentStatuses = {
    PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-100 text-amber-800' },
    PAID: { label: 'Đã thanh toán', className: 'bg-emerald-100 text-emerald-800' },
    FAILED: { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
    REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-blue-100 text-blue-800' },
};

export function mapPaymentOrder(order) {
    const status = order.paymentStatus || (order.status === 'COMPLETED' ? 'PAID' : order.status);
    const date = order.orderedAt ? new Date(order.orderedAt) : null;
    const amount = order.amount == null || order.amount === '' ? NaN : Number(order.amount);
    return {
        ...order, status,
        statusInfo: paymentStatuses[status] || { label: 'Chưa rõ trạng thái', className: 'bg-slate-100 text-slate-600' },
        serviceName: order.serviceName?.trim() || 'Gói dịch vụ',
        dateLabel: date && !Number.isNaN(date.getTime()) ? date.toLocaleString('vi-VN') : 'Chưa có ngày',
        amountLabel: Number.isFinite(amount) ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount) : '—',
        shortId: order.id ? `${order.id.slice(0, 8)}…${order.id.slice(-4)}` : 'Chưa có mã đơn',
    };
}
