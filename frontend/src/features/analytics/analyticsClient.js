import { analyticsConfig } from './analyticsConfig.js';
import { sanitizeEvent } from './eventSchema.js';
import { claimAnalyticsKey, clearAnalyticsDedupe } from './analyticsDedupe.js';

const SCRIPT_ID = 'smartfolio-ga4-tag';
const MAX_QUEUE = 50;
const QUEUE_TTL_MS = 30_000;
const NAVIGATION_DUPLICATE_WINDOW_MS = 250;

let config = analyticsConfig;
let consent = 'unknown';
let eligible = false;
let scriptState = 'idle';
let queue = [];
let lastNavigation = { signature: '', at: 0 };
const lastNavigationEvents = new Map();

function canTrack() {
  return config.enabled && consent === 'granted' && eligible && typeof window !== 'undefined' && typeof document !== 'undefined';
}

function removeAnalyticsCookies() {
  if (typeof document === 'undefined') return;
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_')) {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${window.location.hostname}; SameSite=Lax`;
    }
  });
}

function uninstallTag() {
  if (typeof document !== 'undefined') document.getElementById(SCRIPT_ID)?.remove();
  if (typeof window !== 'undefined') {
    delete window.gtag;
    window.dataLayer = [];
  }
  scriptState = 'idle';
  removeAnalyticsCookies();
}

function installGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  });
  window.gtag('consent', 'update', { analytics_storage: 'granted' });
  window.gtag('js', new Date());
  window.gtag('config', config.measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    debug_mode: config.debugMode,
    page_location: `${window.location.origin}/`,
    page_referrer: '',
    page_title: 'Smartfolio',
  });
}

function flushQueue() {
  const now = Date.now();
  const pending = queue.filter((item) => now - item.createdAt <= QUEUE_TTL_MS);
  queue = [];
  pending.forEach(({ event }) => window.gtag?.('event', event.name, event.params));
}

function ensureTag() {
  if (!canTrack() || scriptState === 'loading' || scriptState === 'ready') return;
  scriptState = 'loading';
  installGtag();
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.measurementId)}`;
  script.onload = () => { scriptState = 'ready'; flushQueue(); };
  script.onerror = () => { scriptState = 'failed'; queue = []; };
  document.head.appendChild(script);
}

function enqueueOrSend(event) {
  if (!canTrack()) return false;
  ensureTag();
  if (scriptState === 'ready') {
    window.gtag?.('event', event.name, event.params);
    return true;
  }
  if (scriptState === 'loading' && queue.length < MAX_QUEUE) {
    queue.push({ event, createdAt: Date.now() });
    return true;
  }
  return false;
}

export function configureAnalytics(nextConfig) {
  config = nextConfig || analyticsConfig;
}

export function setAnalyticsEligibility(nextEligible) {
  eligible = Boolean(nextEligible);
  if (eligible && consent === 'granted') {
    if (typeof window !== 'undefined') window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    ensureTag();
  }
  if (!eligible) {
    queue = [];
    if (typeof window !== 'undefined') window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
    uninstallTag();
    clearAnalyticsDedupe();
  }
}

export function setAnalyticsConsent(nextConsent) {
  consent = nextConsent === 'granted' ? 'granted' : nextConsent === 'denied' ? 'denied' : 'unknown';
  if (consent === 'granted') {
    ensureTag();
    return;
  }
  queue = [];
  if (typeof window !== 'undefined') window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  if (consent === 'denied') {
    uninstallTag();
    clearAnalyticsDedupe();
  }
}

export function trackEvent(name, properties = {}) {
  const event = sanitizeEvent(name, properties, { environment: config.environment, eventSource: 'web' });
  return event ? enqueueOrSend(event) : false;
}

export function trackEventOnce(name, properties, scope, businessId) {
  if (!canTrack()) return false;
  const event = sanitizeEvent(name, properties, { environment: config.environment, eventSource: 'web' });
  if (!event) return false;
  if (!claimAnalyticsKey(scope || name, businessId)) return false;
  return enqueueOrSend(event);
}

export function trackPageView(navigationKey, properties) {
  if (!canTrack()) return false;
  const signature = `${navigationKey || 'default'}:${properties?.page_location || ''}`;
  const now = Date.now();
  if (lastNavigation.signature === signature && now - lastNavigation.at < NAVIGATION_DUPLICATE_WINDOW_MS) return false;
  const accepted = trackEvent('page_view', properties);
  if (accepted) lastNavigation = { signature, at: now };
  return accepted;
}

export function trackNavigationEvent(name, navigationKey, properties = {}) {
  if (!canTrack()) return false;
  const signature = `${navigationKey || 'default'}:${name}`;
  const previous = lastNavigationEvents.get(signature) || 0;
  const now = Date.now();
  if (now - previous < NAVIGATION_DUPLICATE_WINDOW_MS) return false;
  const accepted = trackEvent(name, properties);
  if (accepted) {
    lastNavigationEvents.set(signature, now);
    if (lastNavigationEvents.size > 20) lastNavigationEvents.delete(lastNavigationEvents.keys().next().value);
  }
  return accepted;
}

export function trackEventBeforeRedirect(name, properties, timeoutMs = 300) {
  const event = sanitizeEvent(name, properties, { environment: config.environment, eventSource: 'web' });
  if (!event || !canTrack()) return Promise.resolve(false);
  return dispatchBeforeRedirect(event, timeoutMs);
}

function dispatchBeforeRedirect(event, timeoutMs) {
  ensureTag();
  if (typeof window.gtag !== 'function') return Promise.resolve(false);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => { if (!settled) { settled = true; resolve(value); } };
    window.gtag('event', event.name, { ...event.params, event_callback: () => finish(true), event_timeout: timeoutMs });
    window.setTimeout(() => finish(false), timeoutMs);
  });
}

export function trackEventBeforeRedirectOnce(name, properties, scope, businessId, timeoutMs = 300) {
  if (!canTrack()) return Promise.resolve(false);
  const event = sanitizeEvent(name, properties, { environment: config.environment, eventSource: 'web' });
  if (!event) return Promise.resolve(false);
  if (!claimAnalyticsKey(scope || name, businessId)) return Promise.resolve(false);
  return dispatchBeforeRedirect(event, timeoutMs);
}

export function resetAnalyticsContext() {
  queue = [];
  lastNavigation = { signature: '', at: 0 };
  lastNavigationEvents.clear();
  clearAnalyticsDedupe();
}

export function analyticsStatus() {
  return { enabled: config.enabled, reason: config.reason, consent, eligible, scriptState, queued: queue.length };
}
