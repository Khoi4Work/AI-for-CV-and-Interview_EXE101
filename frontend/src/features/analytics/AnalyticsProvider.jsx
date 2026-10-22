import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/contexts/AuthContext.jsx';
import AnalyticsConsent from './AnalyticsConsent.jsx';
import { analyticsConfig } from './analyticsConfig.js';
import { configureAnalytics, resetAnalyticsContext, setAnalyticsConsent, setAnalyticsEligibility } from './analyticsClient.js';

const CONSENT_KEY = 'smartfolio.analytics.consent.v1';
const CONSENT_VERSION = 1;
const AnalyticsContext = createContext({ status: 'unknown', available: false, canTrack: false, openPreferences: () => {} });

function readConsent() {
  try {
    const saved = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    if (saved?.version === CONSENT_VERSION && ['granted', 'denied'].includes(saved.status)) return saved.status;
  } catch { /* Show the choice again when storage is unavailable or invalid. */ }
  return 'unknown';
}

function persistConsent(status) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ status, version: CONSENT_VERSION, updatedAt: new Date().toISOString() }));
  } catch { /* Consent remains effective for the current page even without storage. */ }
}

export function AnalyticsProvider({ children }) {
  const { authStatus, isLoading, profile } = useAuth();
  const [status, setStatus] = useState(readConsent);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const authKnown = !isLoading && authStatus !== 'error';
  const excluded = profile?.analyticsExcluded === true || String(profile?.role || '').toUpperCase() === 'ADMIN';
  const canTrack = analyticsConfig.enabled && status === 'granted' && authKnown && !excluded;

  useEffect(() => { configureAnalytics(analyticsConfig); }, []);
  useEffect(() => { setAnalyticsConsent(status); }, [status]);
  useEffect(() => { setAnalyticsEligibility(authKnown && !excluded); }, [authKnown, excluded]);
  useEffect(() => {
    if (authStatus === 'guest' || authStatus === 'logging-out') resetAnalyticsContext();
  }, [authStatus]);

  const choose = useCallback((nextStatus) => {
    persistConsent(nextStatus);
    setStatus(nextStatus);
    setPreferencesOpen(false);
  }, []);

  const value = useMemo(() => ({
    status,
    available: analyticsConfig.enabled,
    canTrack,
    openPreferences: () => setPreferencesOpen(true),
  }), [status, canTrack]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
      {analyticsConfig.enabled && <AnalyticsConsent
          status={status}
          open={preferencesOpen}
          onAccept={() => choose('granted')}
          onDeny={() => choose('denied')}
          onClose={() => setPreferencesOpen(false)}
      />}
    </AnalyticsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalyticsConsent() {
  return useContext(AnalyticsContext);
}
