import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { UpgradeInfo } from '../components/UpgradeInfo';
import { PaymentMethods } from '../components/PaymentMethods';
import { PaymentNotes } from '../components/PaymentNotes';
import { OrderSummary } from '../components/OrderSummary';

export function PaymentPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen py-12 px-4 md:px-6 font-sans flex justify-center relative">
            <button
                onClick={() => navigate('/pricing')}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white transition-colors"
                title="Quay lại trang giá"
            >
                <X size={24} />
            </button>
            <div className="w-full max-w-[1000px] flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex flex-col gap-8 min-w-0">
                    <UpgradeInfo />
                    <PaymentMethods />
                    <PaymentNotes />
                </div>
                <div className="w-full md:w-[380px] shrink-0">
                    <OrderSummary />
                </div>
            </div>
        </div>
    );
}
