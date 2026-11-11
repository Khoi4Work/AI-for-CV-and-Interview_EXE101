import { ExternalLink, FileText, Mic, ShieldCheck, UserRound, BarChart3, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuestHeader from '../components/layout/GuestHeader.jsx';
import { Footer } from '../components/layout/Footer.jsx';

const providerDocs = [
  {
    name: 'Groq — Your Data in GroqCloud',
    href: 'https://console.groq.com/docs/your-data',
    scope: 'Dữ liệu gửi qua API Groq',
    detail: 'Tài liệu dành cho nhà phát triển về loại dữ liệu, lưu giữ và các kiểm soát có sẵn.',
  },
  {
    name: 'Google Gemini API — Additional Terms',
    href: 'https://ai.google.dev/gemini-api/terms',
    scope: 'Dữ liệu gửi qua Gemini API',
    detail: 'Điều khoản API của Google; cách xử lý có thể khác theo loại dịch vụ và trạng thái thanh toán.',
  },
  {
    name: 'ElevenLabs — Privacy Policy',
    href: 'https://elevenlabs.io/privacy-policy',
    scope: 'Dữ liệu xử lý bởi ElevenLabs',
    detail: 'Chính sách quyền riêng tư chung của nhà cung cấp.',
  },
  {
    name: 'ElevenLabs — Zero Retention Mode',
    href: 'https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode',
    scope: 'Tùy chọn lưu giữ API ElevenLabs',
    detail: 'Mô tả một tùy chọn dành cho một số khách hàng/endpoint; không xác nhận Smartfolio đang bật tùy chọn này.',
  },
  {
    name: 'payOS — Chính sách bảo mật',
    href: 'https://payos.vn/privacy-policy/',
    scope: 'Thanh toán',
    detail: 'Chính sách của cổng thanh toán được dùng khi tạo giao dịch.',
  },
  {
    name: 'Google Analytics — Safeguarding your data',
    href: 'https://support.google.com/analytics/answer/6004245?hl=en',
    scope: 'Đo lường sử dụng',
    detail: 'Tài liệu Google Analytics về quyền truy cập, lưu giữ và xóa dữ liệu.',
  },
  {
    name: 'Google — Privacy Policy',
    href: 'https://policies.google.com/privacy',
    scope: 'Đăng nhập bằng Google',
    detail: 'Chính sách quyền riêng tư chung của Google.',
  },
];

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
            Trang này mô tả luồng dữ liệu trong ứng dụng và các cấu hình dịch vụ hiện được xác nhận. Chính sách riêng của từng nhà cung cấp vẫn áp dụng cho dữ liệu họ xử lý.
          </p>
          <aside className="mt-6 flex max-w-4xl gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-on-surface-variant" aria-label="Lưu ý về tài liệu bên thứ ba">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p><strong className="text-on-surface">Lưu ý về dịch vụ bên thứ ba.</strong> Các liên kết dẫn tới tài liệu chính thức của nhà cung cấp. Trang này nêu cấu hình đã xác nhận của Smartfolio; tài liệu nhà cung cấp giải thích cách chính sách và tùy chọn của họ áp dụng.</p>
          </aside>
          <p className="mt-5 text-xs text-outline">Cập nhật lần cuối: 11/11/2026</p>
        </header>

        <div className="rounded-2xl border border-outline-variant bg-surface-container px-5 shadow-lg sm:px-9">
          <Section icon={UserRound} title="Dữ liệu trong Smartfolio">
            <p>Ứng dụng xử lý thông tin tài khoản và hồ sơ để đăng nhập, quản lý hồ sơ nghề nghiệp và cung cấp các tính năng CV/phỏng vấn.</p>
            <p>Nội dung CV, JD đã lưu, cấu hình buổi phỏng vấn, câu trả lời, transcript và kết quả được gửi tới máy chủ Smartfolio khi cần thực hiện tính năng tương ứng.</p>
            <p>Bạn có thể sửa hồ sơ và nội dung CV/JD ở các màn hình tương ứng; hiện có thao tác xóa từng CV và JD đã lưu trong mục quản lý. Các thao tác này áp dụng cho dữ liệu trong ứng dụng mà chức năng đó quản lý.</p>
            <p className="flex flex-wrap gap-4 font-semibold">
              <Link className="text-primary underline underline-offset-2 hover:text-on-surface" to="/personal-info">Thông tin cá nhân</Link>
              <Link className="text-primary underline underline-offset-2 hover:text-on-surface" to="/my-cvs">CV của tôi</Link>
              <Link className="text-primary underline underline-offset-2 hover:text-on-surface" to="/my-jds">JD của tôi</Link>
            </p>
          </Section>

          <Section icon={FileText} title="Khi dùng AI cho CV">
            <p>Khi nhập hoặc phân tích CV, phần nội dung cần xử lý được gửi tới dịch vụ AI qua máy chủ. Tùy cấu hình, yêu cầu được xử lý bởi Groq hoặc Google Gemini; khi xảy ra một số lỗi tạm thời, hệ thống có thể thử gửi yêu cầu đó tới nhà cung cấp còn lại.</p>
            <p className="text-sm">Tài liệu của nhà cung cấp: <ProviderLink href="https://console.groq.com/docs/your-data">Groq — dữ liệu API</ProviderLink><span aria-hidden="true"> · </span><ProviderLink href="https://ai.google.dev/gemini-api/terms">Google Gemini API — điều khoản</ProviderLink>.</p>
            <p>Groq đang là nhà cung cấp chính theo cấu hình được xác nhận. Ảnh Data Controls cho thấy Inference API ZDR đang tắt; theo tài liệu Groq, input/output inference có thể được lưu tối đa 30 ngày cho mục đích độ tin cậy và tuân thủ. Batch và Fine-tuning/LoRA đang bật trong tài khoản nhưng ứng dụng hiện không gọi các API này.</p>
            <p>Nếu Groq gặp một số lỗi tạm thời như quá tải, giới hạn tốc độ hoặc lỗi máy chủ, hệ thống có thể gửi lại cùng nội dung sang Gemini. Gemini hiện dùng gói miễn phí; theo điều khoản Gemini API, Google có thể dùng nội dung gửi lên và phản hồi để cải thiện dịch vụ, và người đánh giá có thể xem xét nội dung đó. Vì vậy, khi fallback xảy ra, CV/JD liên quan có thể được gửi tới Gemini.</p>
            <p>Các thiết lập trên được xác nhận cho cấu hình hiện tại; cần kiểm tra lại nếu thay đổi nhà cung cấp, gói dịch vụ hoặc Data Controls.</p>
          </Section>

          <Section icon={Mic} title="Khi luyện phỏng vấn">
            <p>Câu trả lời/transcript và thông tin phiên được lưu trong Smartfolio để xem lại và tạo đánh giá. Khi dùng nhận dạng realtime, âm thanh micro được gửi trực tiếp từ trình duyệt tới ElevenLabs; ở luồng gửi file âm thanh, file đi qua backend rồi được chuyển tới ElevenLabs để nhận dạng. Luồng này lưu văn bản transcript vào câu trả lời, không lưu file âm thanh trong phiên. Hệ thống cũng gửi câu hỏi tới ElevenLabs để tạo tiếng đọc. Ảnh Usage Analytics xác nhận tài khoản đã gọi các endpoint TTS, realtime STT và cấp token STT. Nếu bật ghi âm toàn buổi, file ghi âm chỉ lưu cục bộ trong IndexedDB trên thiết bị, không gửi file ghi âm đó lên máy chủ Smartfolio.</p>
            <p className="text-sm">Tài liệu của nhà cung cấp: <ProviderLink href="https://elevenlabs.io/privacy-policy">ElevenLabs — quyền riêng tư</ProviderLink><span aria-hidden="true"> · </span><ProviderLink href="https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode">ElevenLabs — tùy chọn lưu giữ API</ProviderLink>. Tài liệu về Zero Retention Mode chỉ mô tả tùy chọn của nhà cung cấp; trang này không khẳng định tùy chọn đó đang được bật cho Smartfolio.</p>
            <p>Ứng dụng không gửi tùy chọn tắt lưu lịch sử (`enable_logging=false`); API realtime STT mặc định bật logging, còn Zero Retention Mode chỉ dành cho khách hàng Enterprise đủ điều kiện. Vì vậy ElevenLabs có thể lưu nội dung trong lịch sử dịch vụ theo chính sách của họ. Smartfolio hiện không có chức năng xóa lịch sử TTS/STT tại ElevenLabs; xóa dữ liệu trong Smartfolio không xóa dữ liệu đã gửi tới nhà cung cấp.</p>
            <p>Nếu bật ghi âm toàn buổi, bản ghi được lưu trong IndexedDB của trình duyệt trên thiết bị này để nghe hoặc tải về. Ứng dụng hiện không có nút xóa bản ghi cục bộ; bản ghi có thể bị xóa khi xóa dữ liệu trang web trong trình duyệt.</p>
          </Section>

          <Section icon={BarChart3} title="Đo lường và đăng nhập">
            <p>Google Analytics chỉ được bật khi cấu hình môi trường cho phép, domain nằm trong danh sách cho phép và bạn đồng ý. Ứng dụng gửi các sự kiện đã lọc theo danh sách cho phép; từ chối hoặc rút lại lựa chọn sẽ ngừng gửi sự kiện từ ứng dụng. Xem <ProviderLink href="https://support.google.com/analytics/answer/6004245?hl=en">tài liệu Google Analytics về dữ liệu</ProviderLink>.</p>
            <p>Nếu chọn đăng nhập bằng Google, thông tin tài khoản cần thiết cho đăng nhập được trao đổi với Google theo luồng OAuth. Tham khảo <ProviderLink href="https://policies.google.com/privacy">Chính sách quyền riêng tư của Google</ProviderLink>.</p>
          </Section>

          <Section icon={BarChart3} title="Thanh toán qua payOS">
            <p>Khi bạn thanh toán, Smartfolio chuyển bạn tới cổng payOS. Backend gửi mã đơn hàng, số tiền, mô tả gói và URL quay lại/hủy để tạo yêu cầu thanh toán. payOS/ngân hàng xử lý thông tin thanh toán bạn cung cấp tại cổng của họ; Smartfolio lưu đơn hàng, số tiền, phương thức và trạng thái giao dịch để cấp quyền lợi và đối soát. Nhật ký webhook chỉ lưu các trường đối soát được lọc như mã giao dịch, số tiền, trạng thái và thời gian.</p>
            <p>Tham khảo <ProviderLink href="https://payos.vn/privacy-policy/">Chính sách bảo mật payOS</ProviderLink>.</p>
          </Section>

          <Section icon={ShieldCheck} title="Sửa, xóa và lưu giữ">
            <p>Hiện có thể xóa từng CV và JD trong các mục quản lý tương ứng. Ứng dụng chưa có chức năng xóa tài khoản hoặc phiên/câu trả lời phỏng vấn, và chưa có tác vụ tự động xóa dữ liệu của tài khoản đã xác thực hay lịch sử phỏng vấn. Vì vậy các dữ liệu này tiếp tục được lưu trong Neon DB cho tới khi được xử lý trực tiếp ở cấp dữ liệu/dự án.</p>
            <p>Với cấu hình gói miễn phí mặc định, Render giữ runtime logs 7 ngày. Neon Free giữ change history phục vụ khôi phục tối đa 6 giờ (giới hạn 1 GB); có thể khôi phục trạng thái database trước thao tác trong khoảng lịch sử này. Gói Free có một snapshot thủ công và không có lịch backup tự động. Đây không phải lịch tự xóa dữ liệu ứng dụng. Frontend trên Vercel là static site, không có serverless function xử lý request ứng dụng; Hobby có runtime log retention 1 giờ nếu có runtime logs.</p>
            <p>Chính sách payOS nói dữ liệu được lưu trong thời gian cần thiết cho mục đích dịch vụ hoặc theo nghĩa vụ pháp luật; chính sách không nêu một thời hạn cố định áp dụng cho mọi giao dịch. Dữ liệu giao dịch vẫn có thể phải lưu theo yêu cầu kế toán/ngân hàng.</p>
            <p>Một ngoại lệ có cấu hình rõ trong code là một số tài khoản đăng ký email chưa xác thực: tác vụ dọn dẹp có thể xóa chúng sau thời gian mặc định 2 ngày, nếu xác thực đã hết hạn và không có dấu hiệu tài khoản đã được sử dụng. Thời hạn thực tế có thể được cấu hình khác khi triển khai.</p>
            <p>Hiện Smartfolio không có chức năng xóa tài khoản, phiên/câu trả lời phỏng vấn hoặc dữ liệu đã gửi tới nhà cung cấp AI. Xóa CV/JD trong Smartfolio không đồng nghĩa với việc dữ liệu đã gửi tới nhà cung cấp được xóa.</p>
          </Section>

          <section className="border-t border-outline-variant py-7 sm:py-9">
            <h2 className="flex items-center gap-3 text-lg font-bold text-on-surface sm:text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ExternalLink className="h-5 w-5" aria-hidden="true" /></span>
              Nguồn tham khảo chính thức
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-on-surface-variant">Các liên kết này cũng được đặt cạnh phần mô tả luồng dữ liệu liên quan để bạn tra cứu ngay tại chỗ. Tài liệu có thể được nhà cung cấp cập nhật; hãy xem nội dung hiện hành tại trang đích.</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {providerDocs.map((doc) => (
                <li key={doc.href}>
                  <a className="group flex h-full gap-3 rounded-xl border border-outline-variant bg-surface-container-high p-4 transition-colors hover:border-primary/60 hover:bg-surface-container-highest" href={doc.href} target="_blank" rel="noreferrer">
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm text-on-surface group-hover:text-primary group-hover:underline">{doc.name}</strong>
                      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-wide text-primary">{doc.scope}</span>
                      <span className="mt-1 block text-xs leading-5 text-on-surface-variant">{doc.detail}</span>
                    </span>
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="border-t border-outline-variant py-7 sm:py-9">
            <div className="rounded-xl border border-amber-400/30 bg-amber-300/5 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-amber-200 sm:text-xl">Những điểm Smartfolio chưa xác nhận</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-on-surface-variant">
              <li>Thông tin ứng dụng Google OAuth thực tế trên project production (màn hình đồng ý, scopes được cấp và cấu hình dự án); code hiện yêu cầu thông tin cơ bản email/profile.</li>
            </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
