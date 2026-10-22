import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyticsStatus,
  configureAnalytics,
  setAnalyticsConsent,
  setAnalyticsEligibility,
  trackEvent,
  trackPageView,
} from '../src/features/analytics/analyticsClient.js';

function createBrowserMock() {
  const values = new Map();
  const scripts = new Map();
  const appended = [];
  const sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
  const document = {
    cookie: '',
    createElement: () => ({remove() { scripts.delete(this.id); }}),
    getElementById: (id) => scripts.get(id) || null,
    head: {appendChild(script) { scripts.set(script.id, script); appended.push(script); }},
  };
  const window = {
    location: {origin: 'https://test.smartfolio.vn', hostname: 'test.smartfolio.vn'},
    sessionStorage,
    setTimeout,
  };
  return {document, window, appended, scripts};
}

test('adapter waits for consent, deduplicates remounts, and uninstalls on revoke or exclusion', () => {
  const savedWindow = globalThis.window;
  const savedDocument = globalThis.document;
  const savedNow = Date.now;
  const browser = createBrowserMock();
  globalThis.window = browser.window;
  globalThis.document = browser.document;
  let now = 1_000;
  Date.now = () => now;

  try {
    configureAnalytics({enabled: true, measurementId: 'G-TEST123', environment: 'test', debugMode: true});
    setAnalyticsEligibility(true);
    assert.equal(trackEvent('login', {method: 'email'}), false);
    assert.equal(browser.appended.length, 0);

    setAnalyticsConsent('granted');
    assert.equal(browser.appended.length, 1);
    browser.appended[0].onload();
    assert.equal(trackPageView('nav-1', {page_location: 'https://test.smartfolio.vn/templates', page_title: 'Templates', screen_name: 'template_list'}), true);
    assert.equal(trackPageView('nav-1', {page_location: 'https://test.smartfolio.vn/templates', page_title: 'Templates', screen_name: 'template_list'}), false);
    assert.equal(trackPageView('nav-2', {page_location: 'https://test.smartfolio.vn/login', page_title: 'Login', screen_name: 'login'}), true);
    now += 300;
    assert.equal(trackPageView('nav-1', {page_location: 'https://test.smartfolio.vn/templates', page_title: 'Templates', screen_name: 'template_list'}), true);

    setAnalyticsEligibility(false);
    assert.equal(browser.scripts.size, 0);
    assert.equal(trackEvent('login', {method: 'email'}), false);
    assert.equal(analyticsStatus().eligible, false);

    setAnalyticsEligibility(true);
    assert.equal(browser.appended.length, 2);
    setAnalyticsConsent('denied');
    assert.equal(browser.scripts.size, 0);
    assert.equal(trackEvent('login', {method: 'email'}), false);

    configureAnalytics({enabled: false, measurementId: '', environment: 'test', debugMode: true});
    setAnalyticsConsent('granted');
    setAnalyticsEligibility(true);
    assert.equal(browser.appended.length, 2);
    assert.equal(trackEvent('login', {method: 'email'}), false);
  } finally {
    Date.now = savedNow;
    if (savedWindow === undefined) delete globalThis.window; else globalThis.window = savedWindow;
    if (savedDocument === undefined) delete globalThis.document; else globalThis.document = savedDocument;
  }
});
