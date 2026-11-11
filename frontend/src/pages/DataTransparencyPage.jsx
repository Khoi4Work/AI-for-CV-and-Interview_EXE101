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
            Trang này mô tả những gì ứng dụng hiện đang làm theo codebase. Tài liệu của nhà cung cấp bên ngoài là chính sách riêng của họ; cấu hình tài khoản dịch vụ có thể làm thay đổi cách áp dụng.
          </p>
          <aside className="mt-6 flex max-w-4xl gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-on-surface-variant" aria-label="Lưu ý về tài liệu bên thứ ba">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p><strong className="text-on-surface">Lưu ý về dịch vụ bên thứ ba.</strong> Các liên kết bên dưới dẫn tới tài liệu chính thức của từng nhà cung cấp. Nội dung đó mô tả chính sách và tùy chọn chung của họ, không phải cam kết của Smartfolio và không xác nhận gói dịch vụ hay thiết lập đang áp dụng cho hệ thống.</p>
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
            <p>Điều khoản và cách xử lý của mỗi nhà cung cấp có thể phụ thuộc loại dịch vụ, gói thanh toán và thiết lập tài khoản. Smartfolio chưa xác minh được các thiết lập hiện hành của tài khoản nhà cung cấp đang vận hành.</p>
            <p>Xóa dữ liệu trong Smartfolio hiện không đồng nghĩa với việc Smartfolio đã xác nhận xóa mọi bản sao hoặc nhật ký ở phía nhà cung cấp; các luồng xóa liên kết đó chưa được xác minh trong codebase.</p>
          </Section>

          <Section icon={Mic} title="Khi luyện phỏng vấn">
            <p>Câu trả lời và nội dung phiên có thể được gửi tới dịch vụ AI để tạo câu hỏi hoặc phản hồi. Âm thanh micro được gửi tới ElevenLabs khi dùng nhận dạng giọng nói thời gian thực; khi dịch vụ này không khả dụng, ứng dụng có thể chuyển sang nhận dạng giọng nói của trình duyệt. Văn bản câu hỏi được gửi tới ElevenLabs để tạo tiếng đọc, với giọng đọc của trình duyệt làm phương án dự phòng.</p>
            <p className="text-sm">Tài liệu của nhà cung cấp: <ProviderLink href="https://elevenlabs.io/privacy-policy">ElevenLabs — quyền riêng tư</ProviderLink><span aria-hidden="true"> · </span><ProviderLink href="https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode">ElevenLabs — tùy chọn lưu giữ API</ProviderLink>. Tài liệu về Zero Retention Mode chỉ mô tả tùy chọn của nhà cung cấp; trang này không khẳng định tùy chọn đó đang được bật cho Smartfolio.</p>
            <p>Nếu bật ghi âm toàn buổi, bản ghi được lưu trong IndexedDB của trình duyệt trên thiết bị này để nghe hoặc tải về. Ứng dụng hiện không có nút xóa bản ghi cục bộ; bản ghi có thể bị xóa khi xóa dữ liệu trang web trong trình duyệt.</p>
          </Section>

          <Section icon={BarChart3} title="Đo lường và đăng nhập">
            <p>Google Analytics chỉ được bật khi cấu hình môi trường cho phép, domain nằm trong danh sách cho phép và bạn đồng ý. Ứng dụng gửi các sự kiện đã lọc theo danh sách cho phép; từ chối hoặc rút lại lựa chọn sẽ ngừng gửi sự kiện từ ứng dụng. Xem <ProviderLink href="https://support.google.com/analytics/answer/6004245?hl=en">tài liệu Google Analytics về dữ liệu</ProviderLink>.</p>
            <p>Nếu chọn đăng nhập bằng Google, thông tin tài khoản cần thiết cho đăng nhập được trao đổi với Google theo luồng OAuth. Tham khảo <ProviderLink href="https://policies.google.com/privacy">Chính sách quyền riêng tư của Google</ProviderLink>.</p>
          </Section>

          <Section icon={ShieldCheck} title="Sửa, xóa và lưu giữ">
            <p>Hãy dùng chức năng sửa/xóa ngay trong mục dữ liệu tương ứng. Hiện chưa có thao tác tự phục vụ để xóa toàn bộ tài khoản hoặc toàn bộ lịch sử phỏng vấn; trang này không thể xác nhận thời hạn lưu chung cho dữ liệu tài khoản đang hoạt động, nhật ký máy chủ hoặc bản sao lưu.</p>
            <p>Một ngoại lệ có cấu hình rõ trong code là một số tài khoản đăng ký email chưa xác thực: tác vụ dọn dẹp có thể xóa chúng sau thời gian mặc định 2 ngày, nếu xác thực đã hết hạn và không có dấu hiệu tài khoản đã được sử dụng. Thời hạn thực tế có thể được cấu hình khác khi triển khai.</p>
            <p>Hiện chưa có kênh yêu cầu xóa toàn bộ dữ liệu ngoài các thao tác xóa sẵn có trong ứng dụng. Smartfolio sẽ bổ sung hướng dẫn liên hệ sau khi kênh tiếp nhận được xác định.</p>
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
              <li>Thời hạn lưu dữ liệu tài khoản đã xác thực, phiên phỏng vấn, nhật ký và bản sao lưu.</li>
              <li>Gói thanh toán, vùng xử lý và thiết lập lưu giữ/đào tạo đang áp dụng cho tài khoản Groq, Google Gemini và ElevenLabs của hệ thống.</li>
              <li>Cách yêu cầu xóa toàn bộ tài khoản, transcript/phỏng vấn phía máy chủ và dữ liệu đã gửi cho nhà cung cấp.</li>
              <li>Việc một thao tác xóa trong ứng dụng có kích hoạt xóa dữ liệu liên quan ở hệ thống AI bên ngoài hay không.</li>
              <li>Kênh hỗ trợ chính thức để tiếp nhận yêu cầu quyền dữ liệu ngoài các nút sửa/xóa hiện có.</li>
            </ul>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
