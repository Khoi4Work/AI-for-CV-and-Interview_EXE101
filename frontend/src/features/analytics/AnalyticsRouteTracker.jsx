import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsConsent } from './AnalyticsProvider.jsx';
import { trackPageView } from './analyticsClient.js';
import { normalizeAnalyticsRoute, sanitizeReferrer } from './sanitizeAnalytics.js';

export default function AnalyticsRouteTracker() {
  const location = useLocation();
  const { canTrack } = useAnalyticsConsent();

  useEffect(() => {
    if (!canTrack) return;
    const route = normalizeAnalyticsRoute(location.pathname, location.search, window.location.origin);
    if (!route) return;
    trackPageView(location.key, { ...route, page_referrer: sanitizeReferrer(document.referrer) });
  }, [canTrack, location.key, location.pathname, location.search]);

  return null;
}
