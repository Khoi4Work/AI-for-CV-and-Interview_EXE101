import { ArrowRight, FileText, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import GuestHeader from '../components/layout/GuestHeader.jsx';
import { Footer } from '../components/layout/Footer.jsx';

const documents = [
  {
    title: 'Dữ liệu & quyền riêng tư',
    description: 'Tìm hiểu dữ liệu Smartfolio xử lý, các tính năng sử dụng nhà cung cấp bên ngoài và những điều bạn có thể sửa hoặc xóa.',
    href: '/privacy',
    label: 'Đọc thông tin quyền riêng tư',
    icon: ShieldCheck,
  },
  {
    title: 'Điều khoản dịch vụ',
    description: 'Các quy tắc sử dụng tài khoản, nội dung bạn cung cấp, kết quả AI và những tính năng có hạn mức hoặc thanh toán.',
    href: '/terms',
    label: 'Đọc điều khoản dịch vụ',
    icon: FileText,
  },
];

export default function DocumentsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-on-surface">
      <GuestHeader />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-margin-mobile py-10 md:px-margin-desktop lg:px-gutter sm:py-14">
        <header className="mb-9 border-b border-outline-variant pb-8 sm:mb-12 sm:pb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-primary">Smartfolio · Tài liệu</p>
          <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-5xl">Tài liệu Smartfolio</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-on-surface-variant sm:text-base">
            Chính sách dữ liệu và điều khoản sử dụng được tập hợp tại đây để bạn dễ tìm và xem riêng từng tài liệu.
          </p>
        </header>

        <section aria-labelledby="documents-heading">
          <div className="mb-5">
            <h2 id="documents-heading" className="text-lg font-bold text-on-surface sm:text-xl">Tài liệu dành cho người dùng</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Chọn tài liệu để xem nội dung đầy đủ.</p>
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {documents.map(({ title, description, href, label, icon: Icon }) => (
              <li key={href}>
                <Link to={href} aria-label={label} className="group flex h-full min-h-48 flex-col items-stretch rounded-2xl border border-outline-variant bg-surface-container p-6 transition-colors hover:border-primary/60 hover:bg-surface-container-high focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-8">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="w-full min-w-0 text-lg font-bold text-on-surface group-hover:text-primary">{title}</span>
                  <span className="mt-2 w-full min-w-0 text-sm leading-6 text-on-surface-variant">{description}</span>
                  <span className="mt-auto inline-flex w-full items-center justify-between gap-2 pt-6 text-sm font-semibold text-primary">
                    {label}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  );
}
