import { FileText } from 'lucide-react';

export function UpgradeInfo() {
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
                            <span className="text-[#133c27] font-bold text-lg tracking-tight">Gói CV Middle</span>
                            <span className="bg-[#1c8c54] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                PHỔ BIẾN
              </span>
                        </div>
                        <p className="text-[#1c8c54] text-sm font-medium mt-0.5">5 CV / tháng</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[#1c8c54] font-bold text-xl">39.000đ</span>
                    <span className="text-[#1c8c54] text-sm font-medium"> / tháng</span>
                </div>
            </div>
        </div>
    );
}
