import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../../../components/ui/Modal.jsx';

export default function TermsAcceptanceDialog({ isOpen, loading = false, onAccept, onCancel }) {
  const [accepted, setAccepted] = useState(false);
  const close = () => { setAccepted(false); onCancel(); };
  return (
    <Modal isOpen={isOpen} onClose={close} title="Chấp thuận Điều khoản dịch vụ" solid>
      <p className="mb-4">Để tiếp tục bằng Google và tạo tài khoản Smartfolio, vui lòng đọc và đồng ý với Điều khoản dịch vụ.</p>
      <label className="mb-5 flex items-start gap-3 rounded-lg border border-outline-variant p-3 text-sm text-on-surface">
        <input className="mt-1 h-4 w-4 accent-primary" type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>Tôi đã đọc và đồng ý với <Link className="font-semibold text-primary underline" to="/terms" target="_blank" rel="noreferrer">Điều khoản dịch vụ</Link>.</span>
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={close} disabled={loading} className="rounded-lg border border-outline-variant px-4 py-2">Hủy</button>
        <button type="button" onClick={onAccept} disabled={!accepted || loading} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Đang xử lý…' : 'Đồng ý và tiếp tục'}</button>
      </div>
    </Modal>
  );
}
