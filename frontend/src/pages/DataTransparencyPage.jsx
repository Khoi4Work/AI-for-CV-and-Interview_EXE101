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
    detail: 'Thông tin về điều kiện áp dụng và phạm vi của tùy chọn Zero Retention Mode.',
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
            Trang này mô tả dữ liệu Smartfolio xử lý và cách dữ liệu được chuyển tới các nhà cung cấp dịch vụ. Chính sách của từng nhà cung cấp áp dụng đối với dữ liệu do họ xử lý.
          </p>
          <aside className="mt-6 flex max-w-4xl gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-6 text-on-surface-variant" aria-label="Lưu ý về tài liệu bên thứ ba">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <p><strong className="text-on-surface">Dịch vụ bên thứ ba.</strong> Smartfolio sử dụng một số dịch vụ bên ngoài để cung cấp tính năng. Các liên kết bên dưới dẫn tới tài liệu chính thức về cách những nhà cung cấp này xử lý dữ liệu.</p>
          </aside>
          <p className="mt-5 text-xs text-outline">Cập nhật lần cuối: 22/11/2026</p>
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
            <p>Khi phân tích CV, nội dung cần thiết được gửi tới dịch vụ AI qua máy chủ Smartfolio. Groq là nhà cung cấp chính; nếu xảy ra một số lỗi tạm thời, cùng nội dung có thể được chuyển tới Google Gemini.</p>
            <p className="text-sm">Tài liệu của nhà cung cấp: <ProviderLink href="https://console.groq.com/docs/your-data">Groq — dữ liệu API</ProviderLink><span aria-hidden="true"> · </span><ProviderLink href="https://ai.google.dev/gemini-api/terms">Google Gemini API — điều khoản</ProviderLink>.</p>
            <p>Tùy chọn Zero Data Retention (ZDR) cho Inference API hiện đang tắt. Theo <ProviderLink href="https://console.groq.com/docs/your-data">tài liệu Groq về dữ liệu API</ProviderLink>, dữ liệu đầu vào và đầu ra của yêu cầu có thể được lưu tối đa 30 ngày nhằm duy trì độ tin cậy hệ thống và đáp ứng yêu cầu tuân thủ. Ứng dụng không gửi dữ liệu qua API Batch hoặc Fine-tuning/LoRA.</p>
            <p>Theo <ProviderLink href="https://ai.google.dev/gemini-api/terms">điều khoản Gemini API</ProviderLink>, Google có thể sử dụng nội dung gửi lên và phản hồi để cải thiện dịch vụ; người đánh giá có thể xem xét nội dung đó. Vì vậy, CV liên quan có thể được chuyển tới Google khi cơ chế dự phòng được kích hoạt.</p>
          </Section>

          <Section icon={Mic} title="Khi luyện phỏng vấn">
            <p>Câu trả lời, bản chép lời và thông tin phiên được lưu trong Smartfolio để xem lại và tạo đánh giá. Khi nhận dạng giọng nói trực tiếp, âm thanh từ micro được gửi từ trình duyệt tới ElevenLabs. Khi nhận dạng từ tệp tải lên, tệp được chuyển qua máy chủ Smartfolio tới ElevenLabs. Smartfolio lưu phần văn bản nhận dạng trong câu trả lời, không lưu tệp âm thanh dùng để nhận dạng. Câu hỏi phỏng vấn cũng được gửi tới ElevenLabs để tạo giọng đọc. Nếu bật ghi âm toàn buổi, bản ghi chỉ được lưu trong trình duyệt trên thiết bị của bạn, không gửi lên máy chủ Smartfolio.</p>
            <p className="text-sm">Tài liệu của nhà cung cấp: <ProviderLink href="https://elevenlabs.io/privacy-policy">ElevenLabs — quyền riêng tư</ProviderLink><span aria-hidden="true"> · </span><ProviderLink href="https://elevenlabs.io/docs/eleven-api/resources/zero-retention-mode">ElevenLabs — tùy chọn lưu giữ API</ProviderLink>. Zero Retention Mode chỉ áp dụng cho một số khách hàng và loại API theo điều kiện của ElevenLabs.</p>
            <p>Với tính năng nhận dạng giọng nói trực tiếp, Smartfolio không yêu cầu ElevenLabs tắt lưu lịch sử. Vì vậy, ElevenLabs có thể lưu nội dung theo chính sách của họ. Smartfolio hiện chưa hỗ trợ xóa lịch sử tổng hợp hoặc nhận dạng giọng nói tại ElevenLabs; xóa dữ liệu trong Smartfolio không xóa dữ liệu đã gửi tới nhà cung cấp.</p>
            <p>Bản ghi buổi phỏng vấn được lưu trong trình duyệt để nghe hoặc tải về. Smartfolio hiện chưa có chức năng xóa bản ghi này; bạn có thể xóa dữ liệu trang web trong trình duyệt để xóa bản ghi khỏi thiết bị.</p>
          </Section>

          <Section icon={BarChart3} title="Đo lường và đăng nhập">
            <p>Google Analytics chỉ hoạt động trên các website được cấu hình cho phép và khi bạn đồng ý. Ứng dụng gửi một số sự kiện sử dụng đã chọn; từ chối hoặc rút lại lựa chọn sẽ ngừng gửi các sự kiện này. Xem <ProviderLink href="https://support.google.com/analytics/answer/6004245?hl=en">tài liệu Google Analytics về dữ liệu</ProviderLink>.</p>
            <p>Nếu chọn đăng nhập bằng Google, thông tin tài khoản cần thiết cho đăng nhập được trao đổi với Google theo luồng OAuth. Tham khảo <ProviderLink href="https://policies.google.com/privacy">Chính sách quyền riêng tư của Google</ProviderLink>.</p>
          </Section>

          <Section icon={BarChart3} title="Thanh toán qua payOS">
            <p>Khi thanh toán, Smartfolio chuyển bạn tới cổng payOS và gửi mã đơn hàng, số tiền, mô tả gói cùng địa chỉ quay lại hoặc hủy giao dịch. payOS và ngân hàng xử lý thông tin thanh toán bạn cung cấp tại cổng của họ. Smartfolio lưu thông tin đơn hàng và giao dịch cần thiết để cấp quyền lợi, gồm số tiền, phương thức, trạng thái và thời gian.</p>
            <p>Tham khảo <ProviderLink href="https://payos.vn/privacy-policy/">Chính sách bảo mật payOS</ProviderLink>.</p>
          </Section>

          <Section icon={ShieldCheck} title="Sửa, xóa và lưu giữ">
            <p>Bạn có thể xóa từng CV và JD trong các mục quản lý tương ứng. Smartfolio hiện chưa hỗ trợ xóa tài khoản hoặc phiên/câu trả lời phỏng vấn và chưa tự động xóa dữ liệu của tài khoản đã xác thực hay lịch sử phỏng vấn. Những dữ liệu này tiếp tục được lưu trong cơ sở dữ liệu của Smartfolio.</p>
            <p>Render lưu nhật ký hoạt động của máy chủ trong 7 ngày. Gói Neon Free cung cấp lịch sử thay đổi cơ sở dữ liệu tối đa 6 giờ để khôi phục dữ liệu, với giới hạn 1 GB; gói này có một bản sao lưu thủ công và không có lịch sao lưu tự động. Lịch sử khôi phục và bản sao lưu không phải là thời hạn lưu hoặc xóa dữ liệu ứng dụng. Vercel phân phối giao diện web tĩnh của Smartfolio và không xử lý yêu cầu ứng dụng bằng các hàm máy chủ.</p>
            <p>Chính sách payOS nói dữ liệu được lưu trong thời gian cần thiết cho mục đích dịch vụ hoặc theo nghĩa vụ pháp luật; chính sách không nêu một thời hạn cố định áp dụng cho mọi giao dịch. Dữ liệu giao dịch vẫn có thể phải lưu theo yêu cầu kế toán/ngân hàng.</p>
            <p>Tài khoản đăng ký bằng email nhưng chưa xác thực có thể được xóa tự động sau 2 ngày nếu liên kết xác thực đã hết hạn và tài khoản chưa được sử dụng. Thời hạn này có thể thay đổi theo cấu hình dịch vụ.</p>
            <p>Smartfolio hiện chưa hỗ trợ xóa dữ liệu đã gửi tới nhà cung cấp AI. Xóa CV hoặc JD trong Smartfolio không đồng nghĩa với việc dữ liệu đã gửi tới nhà cung cấp được xóa.</p>
          </Section>

          <section className="border-t border-outline-variant py-7 sm:py-9">
            <h2 className="flex items-center gap-3 text-lg font-bold text-on-surface sm:text-xl">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><ExternalLink className="h-5 w-5" aria-hidden="true" /></span>
              Nguồn tham khảo chính thức
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-on-surface-variant">Các tài liệu dưới đây giải thích chính sách và cách xử lý dữ liệu của từng nhà cung cấp. Nội dung có thể được cập nhật; phiên bản hiện hành được đăng trên trang của nhà cung cấp.</p>
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

        </div>
      </main>
      <Footer />
    </div>
  );
}
