import { FileText, Loader2, AlertCircle } from 'lucide-react';

export function UpgradeInfo({ service, loading, error }) {

    if (loading) {
        return (
            <div className="flex flex-col gap-3">
                <h2 className="text-white text-sm font-medium">1. Bạn đang nâng cấp</h2>
                <div className="bg-[#CBE4D6] rounded-xl p-8 flex flex-col items-center justify-center gap-3 shadow-sm">
                    <Loader2 className="w-6 h-6 text-[#1c8c54] animate-spin" />
                    <p className="text-[#1c8c54] font-medium">Đang tải thông tin gói...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col gap-3">
                <h2 className="text-white text-sm font-medium">1. Bạn đang nâng cấp</h2>
                <div className="bg-red-50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 shadow-sm border border-red-200">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    if (!service) return null;

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-white text-sm font-medium">1. Bạn đang nâng cấp</h2>
            <div className="bg-[#CBE4D6] rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="bg-white/60 p-2.5 rounded-lg shadow-sm">
                        <FileText className="w-6 h-6 text-[#1c8c54]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="text-[#133c27] font-bold text-lg tracking-tight">{service.name}</span>
                            {service.isPopular && (
                                <span className="bg-[#1c8c54] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    PHỔ BIẾN
                                </span>
                            )}
                        </div>
                        <p className="text-[#1c8c54] text-sm font-medium mt-0.5">
                            {service.quotaLabel}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[#1c8c54] font-bold text-xl">
                        {service.formattedPrice}
                    </span>
                    <span className="text-[#1c8c54] text-sm font-medium"> / {service.duration}</span>
                </div>
            </div>
        </div>
    );
}
