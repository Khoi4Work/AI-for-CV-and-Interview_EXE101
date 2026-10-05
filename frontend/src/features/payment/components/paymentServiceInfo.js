export function getPaymentServiceInfo(service) {
    const { id, name, price, category, packageCode, billingUnits, benefits } = service;
    if (!id || !name || price == null || !Number.isFinite(Number(price)) || Number(price) < 0
        || !['CV', 'INTERVIEW'].includes(category)
        || !Number.isInteger(billingUnits) || billingUnits <= 0) {
        throw new Error('Lỗi dữ liệu dịch vụ không hợp lệ');
    }

    return {
        ...service,
        duration: 'Không hết hạn',
        quotaLabel: category === 'CV'
            ? `${billingUnits} lượt tạo CV · tối đa ${packageCode === 'ENHANCE' ? 5 : 3} lượt phân tích/CV · không hết hạn`
            : `${billingUnits} phút phỏng vấn · mua một lần, không hết hạn`,
        formattedPrice: new Intl.NumberFormat('vi-VN', {
            style: 'currency', currency: 'VND',
        }).format(Number(price)),
        benefits: Array.isArray(benefits) ? benefits : [],
    };
}
