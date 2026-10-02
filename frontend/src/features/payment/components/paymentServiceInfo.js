export function getPaymentServiceInfo(service) {
    const { id, name, price, category, billingUnits, benefits } = service;
    if (!id || !name || price == null || !Number.isFinite(Number(price)) || Number(price) < 0
        || !['CV', 'INTERVIEW'].includes(category)
        || !Number.isInteger(billingUnits) || billingUnits <= 0) {
        throw new Error('Lỗi dữ liệu dịch vụ không hợp lệ');
    }

    return {
        ...service,
        duration: '1 tháng',
        quotaLabel: category === 'CV'
            ? `${billingUnits} lượt phân tích CV / tháng`
            : `${billingUnits} phút phỏng vấn / tháng`,
        formattedPrice: new Intl.NumberFormat('vi-VN', {
            style: 'currency', currency: 'VND',
        }).format(Number(price)),
        benefits: Array.isArray(benefits) ? benefits : [],
    };
}
