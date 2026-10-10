import { useState } from 'react';
import { Link, NavLink, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { LayoutDashboard, Users, CreditCard, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData.js';
import { money, dateTime, statuses, initialRange, fillDaily } from '../utils/adminFormat.js';

const inputClass = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';
const buttonClass = 'rounded-xl bg-[#0b3c8f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40';
function RequestState({ request }) {
    if (request.loading) return <p role="status" className="py-8 text-slate-500">Đang tải dữ liệu…</p>;
    if (request.error) return <div role="alert" className="my-4 rounded-xl bg-red-50 p-4 text-red-700">{request.error} <button onClick={request.retry} className="ml-3 underline">Thử lại</button></div>;
    return null;
}
function DateInputs({ value, onChange }) {
    return <><label className="text-sm">Từ ngày <input className={inputClass} type="date" required value={value.from} max={value.to} onChange={e => onChange({ ...value, from: e.target.value })} /></label>
        <label className="text-sm">Đến ngày <input className={inputClass} type="date" required value={value.to} min={value.from} onChange={e => onChange({ ...value, to: e.target.value })} /></label></>;
}
function Dashboard() {
    const [range, setRange] = useState(initialRange);
    const [draft, setDraft] = useState(range);
    const request = useAdminData('statistics', range);
    const data = request.data;
    const daily = data ? fillDaily(data.daily, data.from, data.to) : [];
    const max = Math.max(1, ...daily.map(day => Number(day.revenue)));
    return <><h1 className="text-2xl font-bold">Tổng quan website</h1>
        <form className="my-6 flex flex-wrap items-center gap-3" onSubmit={e => { e.preventDefault(); setRange({ ...draft }); }}>
            <DateInputs value={draft} onChange={setDraft} /><button className={buttonClass}>Áp dụng</button>
            <button type="button" onClick={request.retry} aria-label="Làm mới" className={inputClass}><RefreshCw size={18} /></button>
        </form><RequestState request={request} />
        {data && <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[["Tổng người dùng", data.overview.totalUsers], ["Người dùng mới", data.overview.newUsers], ["Tiền thu thành công", money(data.overview.grossRevenue)], ["Tiền hoàn trong kỳ", money(data.overview.refundAmount)]].map(([label, value]) =>
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-[#0b3c8f]">{value}</p></div>)}
            </div>
            <p className="my-4 text-sm text-slate-500">Ngày thống kê theo giờ Việt Nam. Tiền thu tính theo ngày thanh toán thành công; tiền hoàn theo ngày hoàn. Đơn test không được cộng vào thống kê.</p>
            {Number(data.overview.undatedPaidOrders) > 0 && <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Có {data.overview.undatedPaidOrders} đơn cũ, tổng {money(data.overview.undatedPaidAmount)}, chưa có ngày thanh toán; chưa được cộng vào biểu đồ và doanh thu theo ngày.</p>}
            {Number(data.overview.undatedRefundedOrders) > 0 && <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Có {data.overview.undatedRefundedOrders} đơn hoàn tiền chưa có ngày hoàn, tổng {money(data.overview.undatedRefundedAmount)}; chưa được cộng vào tiền hoàn theo ngày.</p>}
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Doanh thu theo ngày</h2>
                <div className="mt-5 overflow-x-auto"><div className="flex h-48 items-end gap-1" style={{ minWidth: Math.max(500, daily.length * 12) }}>
                    {daily.map(day => <div key={day.date} className="group relative flex h-full flex-1 items-end" title={`${day.date}: ${money(day.revenue)} (${day.orders} đơn)`}>
                        <div className="w-full rounded-t bg-[#0b3c8f] hover:bg-emerald-600" style={{ height: `${Math.max(Number(day.revenue) > 0 ? 2 : 0.5, Number(day.revenue) / max * 100)}%` }} />
                    </div>)}
                </div></div><p className="mt-3 text-xs text-slate-500">{data.from} → {data.to}. Di chuột lên cột để xem số tiền.</p>
            </section>
            <div className="mt-5 grid gap-5 lg:grid-cols-2"><section className="rounded-2xl bg-white p-5"><h2 className="mb-3 font-bold">Đơn tạo trong kỳ: {data.overview.totalOrders}</h2>
                {['paid', 'pending', 'failed', 'refunded'].map(key => <p key={key} className="flex justify-between border-b border-slate-100 py-2">{statuses[key.toUpperCase()]}<strong>{data.overview[`${key}Orders`]}</strong></p>)}
            </section><section className="rounded-2xl bg-white p-5"><h2 className="mb-3 font-bold">Doanh thu theo dịch vụ</h2>
                {data.services.length ? data.services.map(item => <p key={`${item.category}-${item.packageCode}`} className="flex justify-between border-b border-slate-100 py-2">{item.category} / {item.packageCode}<strong>{money(item.revenue)}</strong></p>) : <p className="text-sm text-slate-500">Chưa có thanh toán trong kỳ.</p>}
            </section></div>
        </>}
    </>;
}
function Pagination({ data, onChange }) {
    const pages = Math.max(1, Math.ceil(data.totalElements / data.size));
    return <div className="mt-4 flex items-center justify-between text-sm"><span>{data.totalElements} kết quả · Trang {data.page + 1}/{pages}</span><div className="flex gap-2">
        <button className={buttonClass} disabled={data.page === 0} onClick={() => onChange(data.page - 1)}>Trước</button>
        <button className={buttonClass} disabled={data.page + 1 >= pages} onClick={() => onChange(data.page + 1)}>Sau</button>
    </div></div>;
}
const labels = { id: 'Mã', accountId: 'Mã người dùng', email: 'Email', displayName: 'Tên', role: 'Vai trò', status: 'Trạng thái', provider: 'Đăng ký bằng', createdAt: 'Ngày tạo', phone: 'Điện thoại', location: 'Địa chỉ', cvPlan: 'Gói CV', interviewPlan: 'Gói phỏng vấn', remainingCvFreeCredits: 'Lượt CV Free', remainingCvMiddleCredits: 'Lượt CV Middle', remainingCvEnhanceCredits: 'Lượt CV Enhance', remainingCvCount: 'Tổng lượt CV còn lại', remainingInterviewMinutes: 'Phút phỏng vấn còn lại', amount: 'Số tiền', paymentStatus: 'Thanh toán', paymentMethod: 'Phương thức', transactionId: 'Mã giao dịch', orderedAt: 'Ngày tạo đơn', paidAt: 'Thanh toán lúc', refundedAt: 'Hoàn tiền lúc', isTest: 'Đơn test', serviceName: 'Dịch vụ', category: 'Loại', packageCode: 'Gói' };
function Detail({ path, onClose }) {
    const request = useAdminData(path);
    return <section className="mt-6 rounded-2xl border border-blue-200 bg-white p-5"><div className="flex justify-between"><h2 className="font-bold">Chi tiết</h2><button className="text-sm underline" onClick={onClose}>Đóng</button></div><RequestState request={request} />
        {request.data && <dl className="mt-4 grid gap-3 sm:grid-cols-2">{Object.entries(request.data).map(([key, value]) => <div key={key} className="min-w-0"><dt className="text-xs text-slate-500">{labels[key] || key}</dt><dd className="break-words text-sm">{value == null ? 'Chưa có dữ liệu' : key.endsWith('At') || key.endsWith('End') ? dateTime(value) : key === 'amount' ? money(value) : typeof value === 'boolean' ? value ? 'Có' : 'Không' : statuses[value] || String(value)}</dd></div>)}</dl>}
    </section>;
}
function Records({ payments = false }) {
    const [draft, setDraft] = useState(() => ({ search: '', status: '', category: '', includeTest: false, ...initialRange() }));
    const [filters, setFilters] = useState(draft);
    const [page, setPage] = useState(0);
    const [detail, setDetail] = useState(null);
    const path = payments ? 'payments' : 'users';
    const request = useAdminData(path, { ...(payments ? filters : { search: filters.search, status: filters.status }), page });
    const data = request.data;
    return <><h1 className="text-2xl font-bold">{payments ? 'Thanh toán' : 'Người dùng'}</h1>
        <form className="my-6 flex flex-wrap items-center gap-3" onSubmit={e => { e.preventDefault(); setFilters({ ...draft }); setPage(0); setDetail(null); }}>
            <input aria-label="Tìm kiếm" placeholder={payments ? 'Email / mã đơn / giao dịch' : 'Email / tên'} className={inputClass} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} />
            <select aria-label="Trạng thái" className={inputClass} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="">Tất cả trạng thái</option>
                {(payments ? ['PAID', 'PENDING', 'FAILED', 'REFUNDED'] : ['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED']).map(status => <option key={status} value={status}>{statuses[status]}</option>)}
            </select>
            {payments && <><DateInputs value={draft} onChange={setDraft} /><select aria-label="Loại dịch vụ" className={inputClass} value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}><option value="">Tất cả dịch vụ</option><option>CV</option><option>INTERVIEW</option></select>
                <label className="text-sm"><input type="checkbox" checked={draft.includeTest} onChange={e => setDraft({ ...draft, includeTest: e.target.checked })} /> Hiện đơn test</label></>}
            <button className={buttonClass}>Lọc</button><button type="button" onClick={request.retry} className={inputClass} aria-label="Làm mới"><RefreshCw size={18}/></button>
        </form><RequestState request={request} />
        {data && <><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{(payments ? ['Mã đơn', 'Người dùng', 'Dịch vụ', 'Số tiền', 'Trạng thái', 'Ngày tạo', ''] : ['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', '']).map((label, index) => <th key={index} className="whitespace-nowrap p-4">{label}</th>)}</tr></thead>
            <tbody>{data.content.map(row => <tr key={row.id} className="border-t border-slate-100 hover:bg-blue-50/40">
                {(payments ? [row.id.slice(0, 8), row.email || 'Tài khoản đã xóa', row.serviceName || 'Chưa có dịch vụ', money(row.amount), `${statuses[row.paymentStatus] || row.paymentStatus}${row.isTest ? ' · Test' : ''}`, dateTime(row.orderedAt)] : [row.displayName, row.email, row.role, statuses[row.status] || row.status, dateTime(row.createdAt)]).map((value, index) => <td key={index} className="p-4">{value}</td>)}
                <td className="p-4"><button className="whitespace-nowrap font-semibold text-[#0b3c8f] underline" onClick={() => setDetail(row.id)}>Chi tiết</button></td>
            </tr>)}</tbody></table>{!data.content.length && <p className="p-8 text-center text-slate-500">Không có kết quả phù hợp.</p>}</div><Pagination data={data} onChange={setPage}/></>}
        {detail && <Detail key={detail} path={`${path}/${detail}`} onClose={() => setDetail(null)} />}
    </>;
}
export default function AdminArea() {
    const { handleLogout, isLoggingOut } = useAuth();
    const navigate = useNavigate();
    return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white px-5 py-4"><div className="mx-auto flex max-w-7xl items-center justify-between"><span className="text-lg font-bold text-[#0b3c8f]">Smartfolio · Quản trị</span><div className="flex items-center gap-4"><Link to="/home" className="flex items-center gap-2 text-sm"><ArrowLeft size={16}/> Về website</Link><button className="text-sm underline" disabled={isLoggingOut} onClick={async () => { await handleLogout(); navigate('/login'); }}>Đăng xuất</button></div></div></header>
        <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[210px_1fr] md:p-6"><nav className="flex flex-wrap gap-2 md:flex-col">
            {[["/admin", 'Tổng quan', LayoutDashboard], ["/admin/users", 'Người dùng', Users], ["/admin/payments", 'Thanh toán', CreditCard]].map(([to, label, Icon]) => <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-[#0b3c8f] text-white' : 'bg-white text-slate-600 hover:bg-blue-50'}`}><Icon size={19}/>{label}</NavLink>)}
        </nav><main className="min-w-0"><Routes><Route index element={<Dashboard/>}/><Route path="users" element={<Records/>}/><Route path="payments" element={<Records key="payments" payments/>}/><Route path="*" element={<Navigate to="/admin" replace/>}/></Routes></main></div>
    </div>;
}
