import { Link } from 'react-router-dom';
import { useAnalyticsConsent } from '../../features/analytics/components/AnalyticsProvider.jsx';

export function Footer() {
  const { available, openPreferences } = useAnalyticsConsent();
  return (
    <footer className="bg-surface-container dark:bg-surface-container-highest border-t border-outline-variant dark:border-outline mt-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin-mobile md:px-margin-desktop lg:px-gutter py-lg gap-md max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <div className="flex items-center gap-xs">
            {/*<span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>*/}
            <span className="font-title-md text-title-md font-bold text-primary dark:text-primary">Smartfolio</span>
          </div>
          <p className="font-label-sm text-label-sm text-secondary">© {new Date().getFullYear()} Smartfolio. CV, JD và luyện phỏng vấn.</p>
        </div>
        <div className="flex gap-lg">
          <Link className="font-label-sm text-label-sm text-secondary dark:text-outline hover:text-primary transition-colors opacity-80 hover:opacity-100" to="/templates">Mẫu CV</Link>
          <Link className="font-label-sm text-label-sm text-secondary dark:text-outline hover:text-primary transition-colors opacity-80 hover:opacity-100" to="/interview">Luyện phỏng vấn</Link>
          <Link className="font-label-sm text-label-sm text-secondary dark:text-outline hover:text-primary transition-colors opacity-80 hover:opacity-100" to="/pricing">Gói dịch vụ</Link>
          {available && <button type="button" onClick={openPreferences} className="font-label-sm text-label-sm text-secondary dark:text-outline hover:text-primary transition-colors opacity-80 hover:opacity-100">Tùy chọn đo lường</button>}
        </div>
      </div>
    </footer >
  );
}
