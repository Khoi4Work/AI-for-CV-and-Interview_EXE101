import { useEffect, useState } from 'react';
import { Copy, ChevronDown, ReceiptText, CalendarDays } from 'lucide-react';
import { paymentService } from '../../payment/services/paymentService.js';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { useApp } from '../../auth/contexts/AppContext.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import { Card, Button } from './Layout.jsx';
import { getVisiblePaymentHistory, paymentStatuses, visiblePaymentHistoryStatuses } from '../utils/paymentHistory.js';

function OrderRow({ order, onCopy, detailed = false }) {
    if (detailed) return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-[#0b3c8f]"><ReceiptText size={20} aria-hidden="true" /></div>
                <div className="min-w-0">
                    <h4 className="break-words text-base font-semibold text-slate-900">{order.serviceName}</h4>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600"><CalendarDays size={14} aria-hidden="true" />{order.dateLabel}</p>
                </div>
            </div>
            <div className="ml-auto text-right">
                <p className="text-lg font-bold tabular-nums text-slate-900">{order.amountLabel}</p>
                <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${order.statusInfo.className}`}>{order.statusInfo.label}</span>
            </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <span className="text-xs text-slate-500">Mã đơn hàng</span>
            <button disabled={!order.id} onClick={() => onCopy(order.id)} title={order.id || 'Chưa có mã đơn'}
                aria-label={`Sao chép mã đơn ${order.id || ''}`}
                className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 hover:bg-blue-50 hover:text-[#0b3c8f] focus-visible:outline-2 focus-visible:outline-[#0b3c8f] disabled:opacity-50">
                {order.shortId}<Copy size={14} aria-hidden="true" />
            </button>
        </div>
    </article>;
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
            if (active) setState({ orders: getVisiblePaymentHistory(orders), loading: false, error: '' });
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
    const renderOrders = (orders, detailed = false) => {
        if (state.loading) return <p role="status" className="py-6 text-sm text-slate-600">Đang tải lịch sử thanh toán...</p>;
        if (state.error) return <div role="alert" className="py-4 space-y-3 text-sm text-red-700"><p>{state.error}</p><Button onClick={retry}>Thử lại</Button></div>;
        if (!orders.length) return <p className="py-6 text-sm text-slate-600">{state.orders.length ? 'Không có đơn phù hợp với bộ lọc.' : 'Chưa có đơn đã thanh toán hoặc thanh toán thất bại.'}</p>;
        return orders.map(order => <OrderRow key={order.id} order={order} onCopy={copyId} detailed={detailed} />);
    };
    return <>
        <Card className="p-6 bg-[#B5C2BC] border-none shadow-sm">
            <div className="flex justify-between items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-slate-600">Lịch sử thanh toán</h2>
                <button onClick={() => { setOpen(true); setFilter('ALL'); setLimit(10); }} className="text-xs font-bold text-emerald-700 hover:underline">Xem tất cả</button>
            </div>
            {renderOrders(state.orders.slice(0, 3))}
        </Card>
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Lịch sử thanh toán" solid>
            <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm text-slate-600">Theo dõi trạng thái các đơn thanh toán của bạn.</p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái thanh toán">
                    {[['ALL', 'Tất cả'], ...visiblePaymentHistoryStatuses.map(id => [id, paymentStatuses[id].label])].map(([id, label]) =>
                        <button key={id} aria-pressed={filter === id} onClick={() => { setFilter(id); setLimit(10); }} className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#0b3c8f] ${filter === id ? 'border-[#0b3c8f] bg-[#0b3c8f] text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'}`}>{label}</button>)}
                </div>
                </div>
                {!state.loading && !state.error && <p className="text-sm font-medium text-slate-700">{filtered.length} đơn thanh toán</p>}
                <div className="space-y-3">{renderOrders(filtered.slice(0, limit), true)}</div>
                {limit < filtered.length && <button onClick={() => setLimit(previous => previous + 10)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-[#0b3c8f] hover:bg-blue-50">Hiển thị thêm<ChevronDown size={16} /></button>}
            </div>
        </Modal>
    </>;
}
