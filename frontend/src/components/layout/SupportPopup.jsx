import { useState } from 'react';
import { ArrowUpRight, MessageCircle, Mail, Music2 } from 'lucide-react';
import Modal from '../ui/Modal.jsx';

const contactChannels = [
  {
    label: 'Email',
    detail: 'contact.smartfolio@gmail.com',
    href: 'mailto:contact.smartfolio@gmail.com',
    Icon: Mail,
    external: false,
  },
  {
    label: 'Facebook',
    detail: 'facebook.com/smartfolio.vn',
    href: 'https://www.facebook.com/smartfolio.vn/',
    Icon: MessageCircle,
    external: true,
  },
  {
    label: 'TikTok',
    detail: '@smartfolio_vn',
    href: 'https://www.tiktok.com/@smartfolio_vn',
    Icon: Music2,
    external: true,
  },
];

export default function SupportPopup({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className={className}
      >
        Hỗ trợ
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Liên hệ hỗ trợ">
        <div className="space-y-5">
          <p className="text-sm leading-6 text-on-surface-variant">
            Chọn một kênh bên dưới để liên hệ với Smartfolio.
          </p>

          <div className="grid gap-3">
            {contactChannels.map(({ label, detail, href, Icon, external }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="group flex min-w-0 items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 transition-colors hover:border-primary/40 hover:bg-surface-container"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden="true" size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-on-surface">{label}</span>
                  <span className="block truncate text-sm text-on-surface-variant">{detail}</span>
                </span>
                {external && <ArrowUpRight aria-hidden="true" size={18} className="shrink-0 text-on-surface-variant transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
              </a>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
}
