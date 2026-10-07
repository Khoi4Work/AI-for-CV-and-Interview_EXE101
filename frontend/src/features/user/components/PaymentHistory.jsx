import { useEffect, useState } from 'react';
import { Copy, ChevronDown } from 'lucide-react';
import { paymentService } from '../../payment/services/paymentService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { Card, Button } from './Layout.jsx';
import { mapPaymentOrder, paymentStatuses } from '../utils/paymentHistory.js';

function OrderRow({ order, onCopy }) {
    return <div className="py-4 border-b border-slate-300 last:border-0 space-y-2">
        <div className="flex flex-wrap justify-between items-start gap-2">
            <h3 className="font-semibold text-slate-900 break-words">{order.serviceName}</h3>
            <span className="font-bold text-emerald-800 whitespace-nowrap">{order.amountLabel}</span>
        </div>
        <p className="text-xs text-slate-600">{order.dateLabel}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
            <span className={`text-xs rounded-full px-2 py-1 ${order.statusInfo.className}`}>{order.statusInfo.label}</span>
            <button disabled={!order.id} onClick={() => onCopy(order.id)} title={order.id || 'Chưa có mã đơn'}
                aria-label={`Sao chép mã đơn ${order.id || ''}`} className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-700 disabled:opacity-50">
                {order.shortId}<Copy size={13} />
            </button>
        </div>
    </div>;
}

export default function PaymentHistory() {
    const { showToast } = useApp();
    const [state, setState] = useState({ orders: [], loading: true, error: '' });
    const [revision, setRevision] = useState(0);
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('ALL');
    const [limit, setLimit] = useState(10);
    useEffect(() => {
        let active = true;
        paymentService.getPaymentHistory().then(orders => {
            if (active) setState({ orders: orders.map(mapPaymentOrder), loading: false, error: '' });
        }).catch(error => {
            if (active) setState({ orders: [], loading: false, error: getApiErrorMessage(error) });
        });
        return () => { active = false; };
    }, [revision]);
    const retry = () => {
        setState({ orders: [], loading: true, error: '' });
        setRevision(previous => previous + 1);
    };
    const copyId = async id => {
        try {
            await navigator.clipboard.writeText(id);
            showToast('Đã sao chép mã đơn.', 'success');
        } catch {
            showToast(`Không thể sao chép. Mã đơn: ${id}`, 'error');
        }
    };
    const filtered = state.orders.filter(order => filter === 'ALL' || order.status === filter);
    const renderOrders = orders => {
        if (state.loading) return <p role="status" className="py-6 text-sm text-slate-600">Đang tải lịch sử thanh toán...</p>;
        if (state.error) return <div role="alert" className="py-4 space-y-3 text-sm text-red-700"><p>{state.error}</p><Button onClick={retry}>Thử lại</Button></div>;
        if (!orders.length) return <p className="py-6 text-sm text-slate-600">{state.orders.length ? 'Không có đơn phù hợp với bộ lọc.' : 'Bạn chưa có đơn thanh toán nào.'}</p>;
        return orders.map(order => <OrderRow key={order.id} order={order} onCopy={copyId} />);
    };
    return <>
        <Card className="p-6 bg-[#B5C2BC] border-none shadow-sm">
            <div className="flex justify-between items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-slate-600">Lịch sử thanh toán</h2>
                <button onClick={() => { setOpen(true); setFilter('ALL'); setLimit(10); }} className="text-xs font-bold text-emerald-700 hover:underline">Xem tất cả</button>
            </div>
            {renderOrders(state.orders.slice(0, 3))}
        </Card>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Lịch sử thanh toán">
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {[['ALL', 'Tất cả'], ...Object.entries(paymentStatuses).map(([id, info]) => [id, info.label])].map(([id, label]) =>
                        <button key={id} onClick={() => { setFilter(id); setLimit(10); }} className={`px-3 py-2 rounded-full text-xs ${filter === id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{label}</button>)}
                </div>
                {!state.loading && !state.error && <p className="text-xs text-slate-500">{filtered.length} đơn thanh toán</p>}
                {renderOrders(filtered.slice(0, limit))}
                {limit < filtered.length && <Button onClick={() => setLimit(previous => previous + 10)} className="gap-2">Hiển thị thêm<ChevronDown size={16} /></Button>}
            </div>
        </Modal>
    </>;
}
