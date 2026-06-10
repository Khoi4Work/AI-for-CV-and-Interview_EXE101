import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface-container dark:bg-surface-container-highest border-t border-outline-variant dark:border-outline mt-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop lg:px-gutter py-lg gap-md max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-title-md text-title-md font-bold text-primary dark:text-primary-fixed">Smartfolio</span>
          </div>
          <p className="font-label-sm text-label-sm text-secondary">© 2026 Smartfolio. Precision built for professionals.</p>
        </div>
        <div className="flex gap-lg">
          <Link className="font-label-sm text-label-sm text-secondary dark:text-outline hover:text-primary transition-colors opacity-80 hover:opacity-100" to="#">Privacy Policy</Link>
          <Link className="font-label-sm text-label-sm text-secondary dark:text-outline hover:text-primary transition-colors opacity-80 hover:opacity-100" to="#">Terms of Service</Link>
          <Link className="font-label-sm text-label-sm text-secondary dark:text-outline hover:text-primary transition-colors opacity-80 hover:opacity-100" to="#">Support</Link>
        </div>
      </div>
    </footer >
  );
}
