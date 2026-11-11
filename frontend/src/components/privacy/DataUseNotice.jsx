import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const providerLinks = [
  { href: 'https://console.groq.com/docs/your-data', label: 'Groq' },
  { href: 'https://ai.google.dev/gemini-api/terms#data-use-paid', label: 'Google Gemini' },
  { href: 'https://elevenlabs.io/privacy-policy', label: 'ElevenLabs' },
];

export default function DataUseNotice({ kind = 'cv' }) {
  const isInterview = kind === 'interview';

  return (
    <aside className="flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-950" aria-label="Thông tin xử lý dữ liệu">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-semibold">Thông tin dữ liệu trước khi {isInterview ? 'bắt đầu phỏng vấn' : 'tải CV'}</p>
        <p className="mt-1 leading-6 text-emerald-950/80">
          {isInterview
            ? 'Câu trả lời có thể được gửi đến dịch vụ AI để tạo câu hỏi và phản hồi; âm thanh được gửi tới ElevenLabs để chuyển thành văn bản. Nếu bật ghi âm toàn buổi, bản ghi được lưu trong trình duyệt trên thiết bị này.'
            : 'Tệp CV được gửi tới máy chủ Smartfolio để trích xuất nội dung. Khi dùng tính năng AI, CV và JD bạn cung cấp có thể được xử lý bởi Groq hoặc Google Gemini theo cấu hình máy chủ, gồm cả chuyển sang nhà cung cấp dự phòng khi có lỗi.'}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold">
          <Link className="inline-flex items-center gap-1 text-emerald-800 underline underline-offset-2 hover:text-emerald-950" to="/privacy">
            Cách dữ liệu được xử lý
          </Link>
          {providerLinks.map((provider) => (
            <a className="inline-flex items-center gap-0.5 text-emerald-800 underline underline-offset-2 hover:text-emerald-950" href={provider.href} key={provider.label} target="_blank" rel="noreferrer">
              {provider.label}<ArrowUpRight size={12} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
