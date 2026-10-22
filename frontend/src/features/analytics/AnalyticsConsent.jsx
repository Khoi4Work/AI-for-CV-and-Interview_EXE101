export default function AnalyticsConsent({ status, open, onAccept, onDeny, onClose }) {
  const visible = status === 'unknown' || open;
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[3000] p-4 sm:p-6" role="dialog" aria-modal="false" aria-labelledby="analytics-consent-title">
      <div className="mx-auto max-w-3xl rounded-2xl border border-outline-variant bg-surface p-5 text-on-surface shadow-2xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 id="analytics-consent-title" className="font-semibold">Cho phép đo lường trải nghiệm?</h2>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              Smartfolio dùng Google Analytics để đo lượt xem và các bước sử dụng tính năng. Chúng tôi không gửi CV, JD, email, câu trả lời phỏng vấn hoặc nội dung bạn nhập. Từ chối không ảnh hưởng chức năng.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={onDeny} className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-semibold hover:bg-surface-container">Từ chối</button>
            <button type="button" onClick={onAccept} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-on-primary hover:brightness-95">Đồng ý</button>
            {status !== 'unknown' && <button type="button" onClick={onClose} className="px-3 py-2 text-sm underline">Đóng</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
