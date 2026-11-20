import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext.jsx';
import { LayoutDashboard, Users, CreditCard, ArrowLeft, RefreshCw, CalendarDays, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData.js';
import { money, dateTime, dateOnly, statuses, initialRange, fillDaily } from '../utils/adminFormat.js';
import { readAdminSessionState, writeAdminSessionState } from '../utils/adminSessionState.js';

const inputClass = 'rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';
const buttonClass = 'rounded-xl bg-[#0b3c8f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40';
function RequestState({ request }) {
    if (request.loading) return <p role="status" className="py-8 text-slate-500">Đang tải dữ liệu…</p>;
    if (request.error) return <div role="alert" className="my-4 rounded-xl bg-red-50 p-4 text-red-700">{request.error} <button onClick={request.retry} className="ml-3 underline">Thử lại</button></div>;
    return null;
}
function toVietnamDateInput(isoDate) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '');
    return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}
function parseVietnamDateInput(value) {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
    if (!match) return null;
    const [, day, month, year] = match;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (parsed.getUTCFullYear() !== Number(year) || parsed.getUTCMonth() !== Number(month) - 1 || parsed.getUTCDate() !== Number(day)) return null;
    return `${year}-${month}-${day}`;
}
function DateInput({ label, value, min, max, required = true, onChange }) {
    const [draft, setDraft] = useState(() => toVietnamDateInput(value));
    const inputId = useId();
    const inputRef = useRef(null);
    const pickerRef = useRef(null);
    useEffect(() => {
        setDraft(toVietnamDateInput(value));
        const parsed = parseVietnamDateInput(toVietnamDateInput(value));
        const message = parsed && min && parsed < min
            ? `Ngày phải từ ${toVietnamDateInput(min)} trở đi.`
            : parsed && max && parsed > max
                ? `Ngày không được sau ${toVietnamDateInput(max)}.`
                : '';
        inputRef.current?.setCustomValidity(message);
    }, [value, min, max]);

    const handleChange = event => {
        const next = event.target.value;
        const parsed = parseVietnamDateInput(next);
        let message = '';
        if (next && !parsed) message = 'Nhập ngày hợp lệ theo định dạng DD/MM/YYYY.';
        else if (parsed && min && parsed < min) message = `Ngày phải từ ${toVietnamDateInput(min)} trở đi.`;
        else if (parsed && max && parsed > max) message = `Ngày không được sau ${toVietnamDateInput(max)}.`;
        event.target.setCustomValidity(message);
        setDraft(next);
        if (!next && !required) onChange('');
        else if (parsed && !message) onChange(parsed);
    };

    const openPicker = () => {
        const picker = pickerRef.current;
        if (!picker) return;
        if (typeof picker.showPicker === 'function') {
            try {
                picker.showPicker();
                return;
            } catch {
                // Older browsers may expose showPicker but reject it; fall back to the native click.
            }
        }
        picker.click();
    };

    return <div className="flex flex-col gap-1">
        <label className="text-sm" htmlFor={inputId}>{label}</label>
        <div className="relative flex items-center">
            <input id={inputId} ref={inputRef} className={`${inputClass} w-full pr-11`} type="text" inputMode="numeric" autoComplete="off" required={required} pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" placeholder="DD/MM/YYYY" aria-label={label} value={draft} onChange={handleChange} />
            <button type="button" onClick={openPicker} aria-label={`Mở lịch ${label.toLowerCase()}`} title="Chọn ngày trên lịch" className="absolute right-1 rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-700">
                <CalendarDays size={17} aria-hidden="true" />
            </button>
            <input ref={pickerRef} className="pointer-events-none absolute right-1 top-full h-px w-px opacity-0" type="date" tabIndex={-1} aria-hidden="true" value={value} min={min} max={max} onChange={event => event.target.value && onChange(event.target.value)} />
        </div>
    </div>;
}
function DateInputs({ value, onChange, required = true, fromLabel = 'Từ ngày', toLabel = 'Đến ngày' }) {
    return <><DateInput label={fromLabel} value={value.from} max={value.to} required={required} onChange={date => onChange({ ...value, from: date })} />
        <DateInput label={toLabel} value={value.to} min={value.from} required={required} onChange={date => onChange({ ...value, to: date })} /></>;
}
function Dashboard() {
    const [savedState] = useState(() => {
        const range = initialRange();
        return readAdminSessionState('dashboard', { range, draft: range });
    });
    const [range, setRange] = useState(savedState.range);
    const [draft, setDraft] = useState(savedState.draft);
    useEffect(() => writeAdminSessionState('dashboard', { range, draft }), [range, draft]);
    const request = useAdminData('statistics', range);
    const data = request.data;
    const daily = data ? fillDaily(data.daily, data.from, data.to) : [];
    const max = Math.max(1, ...daily.map(day => Number(day.revenue)));
    return <><h1 className="text-2xl font-bold">Tổng quan website</h1>
        <form className="my-6 grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]" onSubmit={e => { e.preventDefault(); setRange({ ...draft }); }}>
            <DateInputs value={draft} onChange={setDraft} /><button className={buttonClass}>Áp dụng</button>
            <button type="button" onClick={request.retry} aria-label="Tải lại dữ liệu theo bộ lọc hiện tại" title="Tải lại dữ liệu theo bộ lọc hiện tại" className={inputClass} disabled={request.loading}><RefreshCw size={18} className={request.loading ? 'animate-spin' : ''} /></button>
        </form><RequestState request={request} />
        {data && <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[['Tổng người dùng', data.overview.totalUsers], ['Người dùng mới', data.overview.newUsers], ['Người dùng trả phí', data.overview.paidUsers], ['Người dùng chưa trả phí', data.overview.freeUsers], ['Tiền thu thành công', money(data.overview.grossRevenue)], ['Tiền hoàn trong kỳ', money(data.overview.refundAmount)]].map(([label, value]) =>
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-[#0b3c8f]">{typeof value === 'number' ? new Intl.NumberFormat('vi-VN').format(value) : value}</p></div>)}
            </div>
            <ul className="my-4 list-disc space-y-1 pl-5 text-sm text-slate-500">
                <li>Tổng người dùng: không tính tài khoản quản trị và tài khoản chưa xác thực.</li>
                <li>Người dùng mới: áp dụng cùng bộ lọc, trong khoảng ngày đã chọn.</li>
                <li>Trả phí / chưa trả phí: áp dụng cùng bộ lọc tài khoản; tài khoản tạm khóa vẫn được tính.</li>
                <li>Giao dịch: đơn test không được tính.</li>
            </ul>
            {Number(data.overview.undatedPaidOrders) > 0 && <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Có {data.overview.undatedPaidOrders} đơn cũ, tổng {money(data.overview.undatedPaidAmount)}, chưa có ngày thanh toán; chưa được cộng vào biểu đồ và doanh thu theo ngày.</p>}
            {Number(data.overview.undatedRefundedOrders) > 0 && <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Có {data.overview.undatedRefundedOrders} đơn hoàn tiền chưa có ngày hoàn, tổng {money(data.overview.undatedRefundedAmount)}; chưa được cộng vào tiền hoàn theo ngày.</p>}
            <section className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold">Doanh thu theo ngày</h2>
                <div className="mt-5 overflow-x-auto"><div className="flex h-48 items-end gap-1" style={{ minWidth: Math.max(500, daily.length * 12) }}>
                    {daily.map(day => <div key={day.date} className="group relative flex h-full flex-1 items-end" title={`${dateOnly(day.date)}: ${money(day.revenue)} (${day.orders} đơn)`}>
                        <div className="w-full rounded-t bg-[#0b3c8f] hover:bg-emerald-600" style={{ height: `${Math.max(Number(day.revenue) > 0 ? 2 : 0.5, Number(day.revenue) / max * 100)}%` }} />
                    </div>)}
                </div></div><p className="mt-3 text-xs text-slate-500">{dateOnly(data.from)} → {dateOnly(data.to)}. Di chuột lên cột để xem số tiền.</p>
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
    const first = data.totalElements === 0 ? 0 : data.page * data.size + 1;
    const last = Math.min(data.totalElements, (data.page + 1) * data.size);
    return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><div className="flex flex-wrap items-center gap-x-4 gap-y-2"><span>Hiển thị {first}–{last} trong {data.totalElements} bản ghi</span><label className="flex items-center gap-2 text-slate-600">Mỗi trang
        <select className={inputClass} aria-label="Số bản ghi mỗi trang" value={data.size} onChange={event => onChange(0, Number(event.target.value))}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select>
    </label><span>Trang {data.page + 1}/{pages}</span></div><div className="flex gap-2">
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
    const storageKey = payments ? 'payments' : 'users';
    const [savedState] = useState(() => {
        const draft = { search: '', status: '', role: '', provider: '', plan: '', category: '', includeTest: false, ...(payments ? initialRange() : { from: '', to: '' }) };
        return readAdminSessionState(storageKey, { draft, filters: draft, page: 0, size: 20 });
    });
    const [draft, setDraft] = useState(savedState.draft);
    const [filters, setFilters] = useState(savedState.filters);
    const [page, setPage] = useState(savedState.page);
    const [size, setSize] = useState(savedState.size);
    const [detail, setDetail] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    useEffect(() => writeAdminSessionState(storageKey, { draft, filters, page, size }), [storageKey, draft, filters, page, size]);
    const path = payments ? 'payments' : 'users';
    const userFilters = { search: filters.search, status: filters.status, role: filters.role, provider: filters.provider, plan: filters.plan, ...(filters.from ? { from: filters.from } : {}), ...(filters.to ? { to: filters.to } : {}) };
    const request = useAdminData(path, { ...(payments ? filters : userFilters), page, size });
    const data = request.data;
    const activeAdvancedFilterCount = payments ? 0 : [draft.role, draft.provider, draft.plan, draft.from, draft.to].filter(Boolean).length;
    const formColumns = !payments && !showAdvancedFilters ? 'xl:grid-cols-[minmax(0,1.5fr)_minmax(180px,1fr)_auto]' : 'xl:grid-cols-4';
    return <><h1 className="text-2xl font-bold">{payments ? 'Thanh toán' : 'Người dùng'}</h1>
        <form className={`my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 ${formColumns}`} onSubmit={e => { e.preventDefault(); setFilters({ ...draft }); setPage(0); setDetail(null); }}>
            <div className="flex min-w-0 flex-col gap-1"><label className="text-sm" htmlFor="admin-search">Tìm kiếm</label><input id="admin-search" placeholder={payments ? 'Email / mã đơn / giao dịch' : 'Email / tên'} className={`${inputClass} w-full min-w-0`} value={draft.search} onChange={e => setDraft({ ...draft, search: e.target.value })} /></div>
            <div className="flex min-w-0 flex-col gap-1"><label className="text-sm" htmlFor="admin-status">Trạng thái</label><select id="admin-status" className={`${inputClass} w-full min-w-0`} value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value })}><option value="">Tất cả trạng thái</option>
                {(payments ? ['PAID', 'PENDING', 'FAILED', 'REFUNDED'] : ['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED']).map(status => <option key={status} value={status}>{statuses[status]}</option>)}
            </select></div>
            {!payments && showAdvancedFilters && <><div className="flex min-w-0 flex-col gap-1"><label className="text-sm" htmlFor="admin-role">Vai trò</label><select id="admin-role" className={`${inputClass} w-full min-w-0`} value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })}><option value="">Tất cả vai trò</option><option value="ATTENDANCE">Ứng viên</option><option value="PARTNER">Nhà tuyển dụng</option><option value="ADMIN">Quản trị</option></select></div>
                <div className="flex min-w-0 flex-col gap-1"><label className="text-sm" htmlFor="admin-provider">Đăng ký bằng</label><select id="admin-provider" className={`${inputClass} w-full min-w-0`} value={draft.provider} onChange={e => setDraft({ ...draft, provider: e.target.value })}><option value="">Tất cả phương thức</option><option value="LOCAL">Email và mật khẩu</option><option value="GOOGLE">Google</option></select></div>
                <div className="flex min-w-0 flex-col gap-1"><label className="text-sm" htmlFor="admin-plan">Gói dịch vụ</label><select id="admin-plan" className={`${inputClass} w-full min-w-0`} value={draft.plan} onChange={e => setDraft({ ...draft, plan: e.target.value })}><option value="">Tất cả gói</option><option value="FREE">Chưa trả phí</option><option value="PAID">Có gói trả phí</option></select></div>
                <DateInputs value={draft} onChange={setDraft} required={false} fromLabel="Tạo từ ngày" toLabel="Tạo đến ngày" /></>}
            {payments && <><DateInputs value={draft} onChange={setDraft} /><div className="flex min-w-0 flex-col gap-1"><label className="text-sm" htmlFor="admin-category">Dịch vụ</label><select id="admin-category" className={`${inputClass} w-full min-w-0`} value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}><option value="">Tất cả dịch vụ</option><option>CV</option><option>INTERVIEW</option></select></div>
                <label className="flex min-h-10 items-center gap-2 self-end text-sm"><input type="checkbox" checked={draft.includeTest} onChange={e => setDraft({ ...draft, includeTest: e.target.checked })} /> Hiện đơn test</label></>}
            <div className={`flex items-end gap-3 ${payments ? 'xl:col-span-2' : ''}`}>
                {!payments && <button type="button" aria-expanded={showAdvancedFilters} onClick={() => setShowAdvancedFilters(value => !value)} className={`${inputClass} inline-flex items-center gap-2 whitespace-nowrap`}>
                    <SlidersHorizontal size={16}/><span>Bộ lọc{activeAdvancedFilterCount > 0 ? ` (${activeAdvancedFilterCount})` : ''}</span>{showAdvancedFilters ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                </button>}
                <button className={buttonClass}>Lọc</button><button type="button" onClick={request.retry} className={inputClass} aria-label="Tải lại dữ liệu theo bộ lọc hiện tại" title="Tải lại dữ liệu theo bộ lọc hiện tại" disabled={request.loading}><RefreshCw size={18} className={request.loading ? 'animate-spin' : ''}/></button>
            </div>
        </form><RequestState request={request} />
        {data && <><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{(payments ? ['Mã đơn', 'Người dùng', 'Dịch vụ', 'Số tiền', 'Trạng thái', 'Ngày tạo', ''] : ['Người dùng', 'Email', 'Vai trò', 'Trạng thái', 'Ngày tạo', '']).map((label, index) => <th key={index} className="whitespace-nowrap p-4">{label}</th>)}</tr></thead>
            <tbody>{data.content.map(row => <tr key={row.id} className="border-t border-slate-100 hover:bg-blue-50/40">
                {(payments ? [row.id.slice(0, 8), row.email || 'Tài khoản đã xóa', row.serviceName || 'Chưa có dịch vụ', money(row.amount), `${statuses[row.paymentStatus] || row.paymentStatus}${row.isTest ? ' · Test' : ''}`, dateTime(row.orderedAt)] : [row.displayName, row.email, row.role, statuses[row.status] || row.status, dateTime(row.createdAt)]).map((value, index) => <td key={index} className="p-4">{value}</td>)}
                <td className="p-4"><button className="whitespace-nowrap font-semibold text-[#0b3c8f] underline" onClick={() => setDetail(row.id)}>Chi tiết</button></td>
            </tr>)}</tbody></table>{!data.content.length && <p className="p-8 text-center text-slate-500">Không có kết quả phù hợp.</p>}</div><Pagination data={data} onChange={(nextPage, nextSize) => { setPage(nextPage); if (nextSize) setSize(nextSize); }}/></>}
        {detail && <Detail key={detail} path={`${path}/${detail}`} onClose={() => setDetail(null)} />}
    </>;
}
export default function AdminArea() {
    const { handleLogout, isLoggingOut } = useAuth();
    return <div className="min-h-screen bg-slate-50 text-slate-900"><header className="border-b border-slate-200 bg-white px-5 py-4"><div className="mx-auto flex max-w-7xl items-center justify-between"><span className="text-lg font-bold text-[#0b3c8f]">Smartfolio · Quản trị</span><div className="flex items-center gap-4"><Link to="/home" className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><ArrowLeft size={16}/> Trang người dùng</Link><button className="text-sm underline" disabled={isLoggingOut} onClick={handleLogout}>Đăng xuất</button></div></div></header>
        <div className="mx-auto grid max-w-7xl gap-6 p-4 md:grid-cols-[210px_1fr] md:p-6"><nav className="flex flex-wrap gap-2 md:flex-col">
            {[["/admin", 'Tổng quan', LayoutDashboard], ["/admin/users", 'Người dùng', Users], ["/admin/payments", 'Thanh toán', CreditCard]].map(([to, label, Icon]) => <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${isActive ? 'bg-[#0b3c8f] text-white' : 'bg-white text-slate-600 hover:bg-blue-50'}`}><Icon size={19}/>{label}</NavLink>)}
        </nav><main className="min-w-0"><Routes><Route index element={<Dashboard/>}/><Route path="users" element={<Records/>}/><Route path="payments" element={<Records key="payments" payments/>}/><Route path="*" element={<Navigate to="/admin" replace/>}/></Routes></main></div>
    </div>;
}
