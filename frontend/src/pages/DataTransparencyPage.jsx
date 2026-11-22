import { ExternalLink, FileText, Mic, ShieldCheck, UserRound, BarChart3, ArrowLeft, Server, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuestHeader from '../components/layout/GuestHeader.jsx';
import { Footer } from '../components/layout/Footer.jsx';

function ProviderLink({ href, children }) {
  return (
    <a className="inline-flex items-baseline gap-1 font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:text-on-surface hover:decoration-current" href={href} target="_blank" rel="noreferrer">
      {children}<ExternalLink className="h-3 w-3 self-center" aria-hidden="true" />
    </a>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="border-t border-outline-variant py-7 sm:py-9">
      <div className="max-w-4xl">
        <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-on-surface sm:text-xl">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          {title}
        </h2>
        <div className="space-y-3 text-sm leading-7 text-on-surface-variant sm:text-base">{children}</div>
      </div>
    </section>
  );
}

export default function DataTransparencyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-on-surface">
      <GuestHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-margin-mobile py-10 md:px-margin-desktop lg:px-gutter sm:py-14">
        <Link to="/docs" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary">
          <ArrowLeft size={16} aria-hidden="true" /> Tất cả tài liệu
        </Link>

        <header className="mb-9 border-b border-outline-variant pb-8 sm:mb-12 sm:pb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">Smartfolio · Minh bạch dữ liệu</p>
          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-5xl">Dữ liệu của bạn được xử lý như thế nào?</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
            Trang này nêu rõ loại dữ liệu Smartfolio lưu, dữ liệu được gửi cho từng nhà cung cấp, mục đích sử dụng và cách bạn có thể quản lý hoặc xóa dữ liệu.
          </p>
          <aside className="mt-6 flex max-w-4xl gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-on-surface-variant" aria-label="Lưu ý về tài liệu bên thứ ba">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p><strong className="text-on-surface">Dịch vụ bên thứ ba.</strong> Mỗi nhà cung cấp có chính sách lưu giữ và bảo vệ dữ liệu riêng. Chúng tôi liên kết tới tài liệu của họ ngay tại phần mô tả tính năng liên quan.</p>
          </aside>
          <p className="mt-5 text-xs text-outline">Cập nhật lần cuối: 23/11/2026</p>
        </header>

        <div className="rounded-2xl border border-outline-variant bg-surface-container px-5 shadow-lg sm:px-9">
          <Section icon={UserRound} title="Dữ liệu trong Smartfolio">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Dữ liệu lưu:</strong> tài khoản, hồ sơ, CV/JD, câu trả lời, bản chép lời và kết quả phỏng vấn.</li>
              <li><strong>Bạn có thể:</strong> sửa hồ sơ, xóa từng CV hoặc JD đã lưu.</li>
              <li><strong>Chưa hỗ trợ:</strong> xóa tài khoản, phiên phỏng vấn hoặc câu trả lời đã lưu.</li>
            </ul>
            <p className="flex flex-wrap gap-4 font-semibold">
              <Link className="text-primary underline underline-offset-2 hover:text-on-surface" to="/personal-info">Thông tin cá nhân</Link>
              <Link className="text-primary underline underline-offset-2 hover:text-on-surface" to="/my-cvs">CV của tôi</Link>
              <Link className="text-primary underline underline-offset-2 hover:text-on-surface" to="/my-jds">JD của tôi</Link>
            </p>
          </Section>

          <Section icon={FileText} title="Khi dùng AI cho CV và phỏng vấn">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Dữ liệu gửi:</strong> CV/JD khi phân tích; thông tin nghề nghiệp, câu trả lời và bản chép lời khi tạo câu hỏi hoặc đánh giá phỏng vấn.</li>
              <li><strong>Nơi nhận:</strong> Groq xử lý yêu cầu chính qua máy chủ Smartfolio. Nếu Groq gặp lỗi tạm thời, cùng nội dung có thể được gửi sang Google Gemini.</li>
              <li><strong>Lưu giữ tại Groq:</strong> ZDR đang tắt trong cấu hình đã kiểm tra. Groq có thể lưu dữ liệu inference tối đa 30 ngày trong một số trường hợp. Smartfolio không dùng Batch hoặc Fine-tuning/LoRA. <ProviderLink href="https://console.groq.com/docs/your-data">Chính sách dữ liệu Groq</ProviderLink>.</li>
              <li><strong>Gemini fallback:</strong> hiện dùng API miễn phí. Google có thể dùng nội dung và phản hồi để cải thiện sản phẩm; người đánh giá có thể xem xét nội dung. Điều khoản yêu cầu không gửi dữ liệu cá nhân, nhạy cảm hoặc bí mật lên dịch vụ miễn phí. Vì luồng hiện tại có thể gửi CV và câu trả lời phỏng vấn chứa dữ liệu cá nhân, cần chuyển sang dịch vụ trả phí hoặc tắt fallback. <ProviderLink href="https://ai.google.dev/gemini-api/terms">Điều khoản Gemini API</ProviderLink>.</li>
            </ul>
          </Section>

          <Section icon={Mic} title="Khi luyện phỏng vấn">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Dữ liệu gửi:</strong> âm thanh micro để nhận dạng trực tiếp; tệp âm thanh tải lên để chuyển giọng nói thành văn bản; câu hỏi để tạo giọng đọc.</li>
              <li><strong>Đường truyền:</strong> âm thanh trực tiếp đi từ trình duyệt tới ElevenLabs; tệp tải lên đi qua máy chủ Smartfolio tới ElevenLabs.</li>
              <li><strong>Dữ liệu lưu:</strong> Smartfolio lưu câu trả lời và bản chép lời, không lưu tệp âm thanh nhận dạng. Bản ghi toàn buổi chỉ lưu trong trình duyệt; xóa dữ liệu trang web để xóa bản ghi.</li>
              <li><strong>Lưu giữ tại ElevenLabs:</strong> Zero Retention Mode chỉ dành cho một số khách hàng Enterprise/API đủ điều kiện và không bật trong cấu hình pay-as-you-go của Smartfolio. Xem <ProviderLink href="https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode">điều kiện lưu giữ</ProviderLink>, <ProviderLink href="https://elevenlabs.io/dpa">DPA</ProviderLink> và <ProviderLink href="https://compliance.elevenlabs.io/">danh sách nhà cung cấp phụ</ProviderLink>.</li>
            </ul>
          </Section>

          <Section icon={BarChart3} title="Đo lường và đăng nhập">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Google Analytics:</strong> chỉ ghi nhận sự kiện khi website được cho phép và bạn đồng ý. Bạn có thể đổi lựa chọn trong mục tùy chọn đo lường. <ProviderLink href="https://support.google.com/analytics/answer/6004245?hl=en">Tài liệu Google Analytics</ProviderLink>.</li>
              <li><strong>Google OAuth:</strong> Google trao đổi thông tin tài khoản cần thiết để xác thực đăng nhập. <ProviderLink href="https://policies.google.com/privacy">Chính sách quyền riêng tư của Google</ProviderLink>.</li>
            </ul>
          </Section>

          <Section icon={CreditCard} title="Thanh toán">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Gửi tới payOS:</strong> mã đơn, số tiền, gói dịch vụ và địa chỉ quay lại/hủy giao dịch.</li>
              <li><strong>Thông tin thanh toán:</strong> do payOS/ngân hàng xử lý tại cổng thanh toán.</li>
              <li><strong>Lưu tại Smartfolio:</strong> thông tin giao dịch cần thiết để cấp gói và đối soát. <ProviderLink href="https://payos.vn/privacy-policy/">Chính sách bảo mật payOS</ProviderLink>.</li>
            </ul>
          </Section>

          <Section icon={Server} title="Lưu trữ và nhật ký vận hành">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Cơ sở dữ liệu:</strong> Neon lưu dữ liệu tài khoản, CV/JD và phiên phỏng vấn. <ProviderLink href="https://neon.com/security">Biện pháp bảo mật Neon</ProviderLink>.</li>
              <li><strong>Máy chủ và nhật ký:</strong> Render chạy backend và lưu log kỹ thuật, có thể gồm mã tài khoản/CV và trạng thái sử dụng. Gói Hobby lưu log 7 ngày; đây không phải thời hạn lưu dữ liệu trong Smartfolio. <ProviderLink href="https://render.com/dpa">DPA Render</ProviderLink> · <ProviderLink href="https://render.com/docs/logging">Thời hạn log</ProviderLink>.</li>
            </ul>
          </Section>

          <Section icon={ShieldCheck} title="Sửa, xóa và lưu giữ dữ liệu">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong>Có thể xóa:</strong> từng CV/JD đã lưu và bản ghi phỏng vấn trong trình duyệt bằng cách xóa dữ liệu trang web.</li>
              <li><strong>Chưa thể xóa trong Smartfolio:</strong> tài khoản, phiên phỏng vấn và câu trả lời đã lưu. Các dữ liệu này chưa có lịch tự động xóa.</li>
              <li><strong>Dữ liệu bên ngoài:</strong> xóa trong Smartfolio không tự động xóa dữ liệu đã gửi cho nhà cung cấp.</li>
              <li><strong>Tài khoản chưa xác thực:</strong> có thể được xóa sau 2 ngày nếu liên kết xác thực hết hạn và tài khoản chưa được sử dụng.</li>
            </ul>
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
