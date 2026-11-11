import { ArrowLeft, CreditCard, FileText, ShieldCheck, Sparkles, UserRound, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuestHeader from '../components/layout/GuestHeader.jsx';
import { Footer } from '../components/layout/Footer.jsx';

function TermsSection({ icon: Icon, title, children }) {
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

export default function ServiceTermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-on-surface">
      <GuestHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-margin-mobile py-10 md:px-margin-desktop lg:px-gutter sm:py-14">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary">
          <ArrowLeft size={16} aria-hidden="true" /> Về trang chủ
        </Link>

        <header className="mb-9 border-b border-outline-variant pb-8 sm:mb-12 sm:pb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">Smartfolio · Điều khoản dịch vụ</p>
          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-5xl">Điều khoản sử dụng Smartfolio</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
            Các điều khoản này giải thích quy tắc cơ bản khi bạn tạo tài khoản và sử dụng công cụ hỗ trợ CV, đánh giá CV và luyện phỏng vấn của Smartfolio.
          </p>
          <p className="mt-5 text-xs text-outline">Cập nhật lần cuối: 11/11/2026</p>
        </header>

        <div className="rounded-2xl border border-outline-variant bg-surface-container px-5 shadow-lg sm:px-9">
          <TermsSection icon={FileText} title="1. Phạm vi và chấp thuận">
            <p>Khi truy cập hoặc sử dụng Smartfolio, bạn đồng ý tuân theo các điều khoản này. Nếu không đồng ý, vui lòng ngừng sử dụng dịch vụ.</p>
            <p>Điều khoản áp dụng cho các tính năng CV, mẫu CV, đánh giá CV theo mô tả công việc, luyện phỏng vấn, tài khoản và các chức năng liên quan được cung cấp trong ứng dụng.</p>
            <p><Link className="font-semibold text-primary underline underline-offset-4 hover:text-on-surface" to="/privacy">Dữ liệu & quyền riêng tư</Link> giải thích cách ứng dụng xử lý dữ liệu và dẫn tới tài liệu của các nhà cung cấp bên ngoài.</p>
          </TermsSection>

          <TermsSection icon={UserRound} title="2. Tài khoản của bạn">
            <p>Bạn chịu trách nhiệm cung cấp thông tin đăng ký chính xác, giữ an toàn thông tin đăng nhập và các hoạt động diễn ra trong tài khoản của mình.</p>
            <p>Không chia sẻ thông tin đăng nhập hoặc sử dụng tài khoản của người khác khi chưa được cho phép. Smartfolio có thể yêu cầu xác minh thông tin khi cần bảo vệ tài khoản hoặc dịch vụ.</p>
          </TermsSection>

          <TermsSection icon={ShieldCheck} title="3. Nội dung bạn cung cấp">
            <p>Bạn giữ các quyền mà mình có đối với CV, mô tả công việc, câu trả lời, bản ghi và nội dung khác bạn đưa vào Smartfolio. Bạn chịu trách nhiệm bảo đảm mình có quyền sử dụng nội dung đó và việc cung cấp nội dung không xâm phạm quyền của người khác.</p>
            <p>Khi dùng một tính năng, bạn cho phép Smartfolio lưu trữ, truyền và xử lý nội dung cần thiết để cung cấp tính năng đó, bao gồm gửi một phần nội dung tới nhà cung cấp AI hoặc giọng nói khi tính năng yêu cầu. Chi tiết được nêu trong <Link className="font-semibold text-primary underline underline-offset-4 hover:text-on-surface" to="/privacy">trang Dữ liệu & quyền riêng tư</Link>.</p>
          </TermsSection>

          <TermsSection icon={Sparkles} title="4. Nội dung do AI tạo">
            <p>Gợi ý, phân tích CV, câu hỏi và phản hồi phỏng vấn được tạo tự động để hỗ trợ bạn chuẩn bị. Kết quả có thể thiếu chính xác, không đầy đủ hoặc không phù hợp với hoàn cảnh cụ thể; hãy tự kiểm tra trước khi sử dụng hoặc chia sẻ.</p>
            <p>Smartfolio là công cụ hỗ trợ chuẩn bị hồ sơ và luyện tập. Ứng dụng không bảo đảm CV sẽ vượt qua hệ thống tuyển dụng, bạn sẽ được mời phỏng vấn hoặc nhận việc, hay kết quả tuyển dụng cụ thể.</p>
            <p>Bạn tự quyết định nội dung cuối cùng trong CV và cách sử dụng phản hồi. Đừng dùng kết quả AI làm căn cứ duy nhất cho quyết định quan trọng.</p>
          </TermsSection>

          <TermsSection icon={Wrench} title="5. Sử dụng dịch vụ đúng cách">
            <p>Bạn đồng ý không sử dụng Smartfolio để vi phạm pháp luật hoặc quyền của người khác; mạo danh, lừa đảo, quấy rối hay phát tán nội dung gây hại; tải mã độc; tìm cách truy cập trái phép; can thiệp vào hoạt động của hệ thống; hoặc né tránh hạn mức và biện pháp bảo vệ của dịch vụ.</p>
            <p>Không đưa vào ứng dụng thông tin cá nhân hoặc tài liệu của người khác nếu bạn không có quyền hoặc căn cứ phù hợp để sử dụng chúng.</p>
          </TermsSection>

          <TermsSection icon={CreditCard} title="6. Gói dịch vụ và thanh toán">
            <p>Một số tính năng có hạn mức miễn phí hoặc cần mua thêm lượt sử dụng. Trước khi xác nhận đơn hàng, hãy kiểm tra tên gói, giá, phương thức thanh toán và quyền lợi hiển thị tại trang thanh toán. Thông tin của đơn hàng được xác nhận là căn cứ để cấp lượt sử dụng.</p>
            <p>Quyền lợi và hạn mức có thể khác nhau giữa các gói. Hãy dựa vào thông tin hiển thị ở bước xác nhận thanh toán cho từng giao dịch.</p>
          </TermsSection>

          <TermsSection icon={Wrench} title="7. Tính khả dụng và thay đổi dịch vụ">
            <p>Smartfolio có thể cập nhật, tạm ngừng hoặc giới hạn một tính năng để bảo trì, bảo vệ hệ thống, xử lý sự cố hoặc đáp ứng yêu cầu pháp luật. Chúng tôi sẽ cố gắng hạn chế ảnh hưởng khi có thể.</p>
            <p>Nếu có thay đổi quan trọng đối với điều khoản, phiên bản cập nhật sẽ được đăng trên trang này cùng ngày cập nhật. Việc tiếp tục sử dụng sau ngày hiệu lực của thay đổi đồng nghĩa bạn chấp thuận phiên bản mới; nếu không đồng ý, hãy ngừng sử dụng dịch vụ.</p>
          </TermsSection>

          <section className="border-t border-outline-variant py-7 sm:py-9">
            <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
              <h2 className="text-lg font-bold text-on-surface sm:text-xl">Có câu hỏi về dữ liệu?</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-on-surface-variant">Xem <Link className="font-semibold text-primary underline underline-offset-4 hover:text-on-surface" to="/privacy">Dữ liệu & quyền riêng tư</Link> để biết dữ liệu nào được xử lý trong các tính năng và đọc tài liệu chính thức của nhà cung cấp bên thứ ba.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
