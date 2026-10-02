import { CheckCircle2, ShieldCheck } from 'lucide-react';

function InfoRow({ label, value, isBold = false, isGreen = false }) {
    return (
        <div className="flex justify-between items-center py-2">
            <span className="text-gray-500 text-sm">{label}</span>
            <span className={`${isBold ? 'font-bold' : 'font-medium'} ${isGreen ? 'text-[#1c8c54] text-xl' : 'text-gray-800'} text-sm`}>
        {value}
      </span>
        </div>
    );
}

function BenefitItem({ text }) {
    return (
        <div className="flex items-start gap-2.5 py-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#1c8c54] shrink-0 mt-0.5" />
            <span className="text-gray-700 text-sm">{text}</span>
        </div>
    );
}

export function OrderSummary({ service, loading, error, selectedPaymentMethod, onPaymentClick }) {
    const benefits = service?.benefits || [];
    const unavailable = loading ? 'Đang tải...' : '—';
    const paymentDisabled = loading || Boolean(error) || !service || !selectedPaymentMethod;

    return (
        <div className="bg-[#E5ECE9] rounded-2xl p-6 flex flex-col w-full h-fit">
            <h2 className="text-gray-900 font-bold text-lg mb-4">Thông tin đơn hàng</h2>
            {error && <p role="alert" className="text-red-600 text-sm mb-4">{error}</p>}

            <div className="flex flex-col mb-2">
                <InfoRow label="Gói dịch vụ" value={service?.name || unavailable} />
                <InfoRow label="Chu kỳ" value={service?.duration || unavailable} />
                <InfoRow label="Hạn mức" value={service?.quotaLabel || unavailable} />
            </div>

            <div className="border-t border-gray-300 my-2"></div>

            <div className="flex flex-col py-2">
                <InfoRow label="Tạm tính" value={service?.formattedPrice || unavailable} />
                <InfoRow label="Phí VAT (0%)" value="0đ" />
            </div>

            <div className="border-t border-gray-300 my-2"></div>

            <div className="flex justify-between items-center py-4">
                <span className="text-gray-900 font-bold text-[15px]">Tổng thanh toán</span>
                <span className="text-[#1c8c54] font-bold text-2xl">
                    {service?.formattedPrice || unavailable}
                </span>
            </div>

            <div className="bg-[#CBE4D6] rounded-xl p-4 flex gap-3 items-start mt-2 mb-6 shadow-sm border border-[#CBE4D6]/50">
                <ShieldCheck className="w-5 h-5 text-[#1c8c54] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                    <p className="text-[#135b37] font-bold text-sm">Thanh toán an toàn & bảo mật</p>
                    <p className="text-[#135b37]/80 text-xs leading-relaxed font-medium">
                        Mọi giao dịch dịch được mã hóa và bảo vệ theo tiêu chuẩn bảo mật quốc tế.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 mb-6">
                <h3 className="text-gray-900 font-bold text-sm mb-1">Bạn sẽ nhận được</h3>
                {benefits.length > 0 ? (
                    benefits.map((benefit, i) => (
                        <BenefitItem key={i} text={benefit} />
                    ))
                ) : (
                    <p className="text-gray-400 text-xs italic">
                        {loading ? 'Đang tải quyền lợi gói...' : service ? 'Chưa có thông tin quyền lợi bổ sung.' : 'Chưa có thông tin gói.'}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <button
                    onClick={onPaymentClick}
                    disabled={paymentDisabled}
                    className={`w-full py-3 text-white font-bold rounded-xl min-h-[44px] transition-colors ${
                        paymentDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#1c8c54] hover:bg-[#167345]'
                    }`}
                >
                    Thanh toán ngay
                </button>
            </div>
        </div>
    );
}
