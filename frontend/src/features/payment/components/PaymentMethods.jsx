import { useState } from 'react';
import { PaymentOption } from './PaymentOption';
import { Clock, Landmark } from 'lucide-react';

function QRCodePlaceholder() {
    return (
        <div className="relative border-4 border-white shadow-sm rounded-lg overflow-hidden bg-white">
            <svg width="200" height="200" viewBox="0 0 200 200" className="w-48 h-48">
                <rect width="200" height="200" fill="white"/>
                <rect x="10" y="10" width="50" height="50" fill="none" stroke="black" strokeWidth="12" rx="4"/>
                <rect x="25" y="25" width="20" height="20" fill="black" rx="2"/>
                <rect x="140" y="10" width="50" height="50" fill="none" stroke="black" strokeWidth="12" rx="4"/>
                <rect x="155" y="25" width="20" height="20" fill="black" rx="2"/>
                <rect x="10" y="140" width="50" height="50" fill="none" stroke="black" strokeWidth="12" rx="4"/>
                <rect x="25" y="155" width="20" height="20" fill="black" rx="2"/>

                {/* Random dots to simulate QR */}
                <rect x="80" y="10" width="15" height="15" fill="black"/><rect x="100" y="10" width="15" height="15" fill="black"/>
                <rect x="80" y="30" width="15" height="15" fill="black"/><rect x="110" y="40" width="15" height="15" fill="black"/>
                <rect x="10" y="80" width="15" height="15" fill="black"/><rect x="30" y="80" width="15" height="15" fill="black"/>
                <rect x="50" y="100" width="15" height="15" fill="black"/><rect x="10" y="110" width="15" height="15" fill="black"/>
                <rect x="140" y="80" width="15" height="15" fill="black"/><rect x="170" y="80" width="15" height="15" fill="black"/>
                <rect x="150" y="100" width="15" height="15" fill="black"/><rect x="180" y="120" width="15" height="15" fill="black"/>
                <rect x="80" y="150" width="15" height="15" fill="black"/><rect x="100" y="150" width="15" height="15" fill="black"/>
                <rect x="120" y="170" width="15" height="15" fill="black"/><rect x="140" y="140" width="15" height="15" fill="black"/>
                <rect x="170" y="150" width="15" height="15" fill="black"/><rect x="180" y="180" width="15" height="15" fill="black"/>
                <rect x="80" y="80" width="40" height="40" fill="white"/>
            </svg>
            {/* Center Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white p-1 rounded border-2 border-blue-500/20 flex flex-col items-center shadow-sm">
                    <div className="flex font-bold text-[10px] leading-none">
                        <span className="text-red-600">VN</span><span className="text-blue-600">PAY</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function PaymentMethods({ selectedMethod, setSelectedMethod }) {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-white text-sm font-medium">2. Chọn phương thức thanh toán</h2>
            <div className="flex flex-col gap-2">
                <PaymentOption
                    id="BANK_TRANSFER"
                    title="PayOS (Ngân hàng/QR)"
                    selected={selectedMethod === 'BANK_TRANSFER'}
                    onClick={() => setSelectedMethod('BANK_TRANSFER')}
                    logo={
                        <div className="flex items-center font-bold text-lg tracking-tight">
                            <span className="text-blue-600">Pay</span>
                            <span className="text-orange-500">OS</span>
                        </div>
                    }
                >
                    <div className="flex flex-col items-center w-full max-w-3xl">
                        <h3 className="text-gray-900 font-semibold mb-6 text-[15px]">Thanh toán qua cổng PayOS</h3>
                        <div className="mb-6 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <QRCodePlaceholder />
                        </div>
                        <p className="text-gray-500 text-sm text-center mb-4 leading-relaxed px-4">
                            Hệ thống sẽ tự động tạo mã QR động qua PayOS. Bạn chỉ cần quét mã để hoàn tất thanh toán.
                        </p>
                        <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mt-2">
                            <Clock className="w-4 h-4" />
                            <span>Mã QR sẽ được tạo khi bạn nhấn "Thanh toán ngay"</span>
                        </div>
                    </div>
                </PaymentOption>
            </div>
        </div>
    );
}
