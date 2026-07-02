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

export function PaymentMethods() {
    const [selectedMethod, setSelectedMethod] = useState('vnpay');

    return (
        <div className="flex flex-col gap-3">
            <h2 className="text-white text-sm font-medium">2. Chọn phương thức thanh toán</h2>
            <div className="flex flex-col gap-2">
                <PaymentOption
                    id="vnpay"
                    title="Quét mã QR (VNPay)"
                    selected={selectedMethod === 'vnpay'}
                    onClick={() => setSelectedMethod('vnpay')}
                    logo={
                        <div className="flex items-center font-bold text-lg tracking-tight">
                            <span className="text-red-600">VN</span>
                            <span className="text-blue-600">PAY</span>
                            <span className="text-blue-600 text-[10px] self-end mb-1 ml-0.5">QR</span>
                        </div>
                    }
                >
                    <div className="flex flex-col items-center w-full max-w-3xl">
                        <h3 className="text-gray-900 font-semibold mb-6 text-[15px]">Quét mã để thanh toán</h3>
                        <div className="mb-6 p-1 bg-white border border-gray-100 rounded-xl shadow-sm">
                            <QRCodePlaceholder />
                        </div>
                        <p className="text-gray-500 text-sm text-center mb-4 leading-relaxed px-4">
                            Sử dụng ứng dụng ngân hàng hoặc ví điện tử hỗ trợ VNPay để quét mã
                        </p>
                        <div className="flex items-center gap-1.5 text-red-500 text-sm font-medium mt-2">
                            <Clock className="w-4 h-4" />
                            <span>Mã QR hết hạn sau 09:46</span>
                        </div>
                    </div>
                </PaymentOption>

                <PaymentOption
                    id="card"
                    title="Thẻ quốc tế (Visa, MasterCard, JCB)"
                    selected={selectedMethod === 'card'}
                    onClick={() => setSelectedMethod('card')}
                    logo={
                        <div className="flex gap-2 items-center">
                            <span className="text-blue-800 font-bold italic text-sm">VISA</span>
                            <div className="flex -space-x-1 items-center">
                                <div className="w-4 h-4 rounded-full bg-red-500/80"></div>
                                <div className="w-4 h-4 rounded-full bg-yellow-500/80 relative -left-1"></div>
                            </div>
                        </div>
                    }
                />

                <PaymentOption
                    id="momo"
                    title="Ví MoMo"
                    selected={selectedMethod === 'momo'}
                    onClick={() => setSelectedMethod('momo')}
                    logo={
                        <div className="bg-[#a50064] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            MoMo
                        </div>
                    }
                />

                <PaymentOption
                    id="zalopay"
                    title="ZaloPay"
                    selected={selectedMethod === 'zalopay'}
                    onClick={() => setSelectedMethod('zalopay')}
                    logo={
                        <div className="text-[#00c56b] font-bold text-sm">
                            Zalo<span className="text-[#00a359]">Pay</span>
                        </div>
                    }
                />

                <PaymentOption
                    id="bank"
                    title="Chuyển khoản ngân hàng"
                    selected={selectedMethod === 'bank'}
                    onClick={() => setSelectedMethod('bank')}
                    logo={<Landmark className="w-5 h-5 text-gray-400" />}
                />
            </div>
        </div>
    );
}
