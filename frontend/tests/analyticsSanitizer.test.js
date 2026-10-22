import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAnalyticsRoute, normalizeJdOrigin, safeCampaign, sanitizeReferrer} from '../src/features/analytics/sanitizeAnalytics.js';
import {sanitizeEvent} from '../src/features/analytics/eventSchema.js';

test('route sanitizer removes business IDs, tokens, hashes, and unsupported query fields', () => {
  assert.deepEqual(
    normalizeAnalyticsRoute('/optimizer', '?analysisId=05c18c0a-2d3f-4ab7-aeef-f31234567890&email=user@example.com', 'https://smartfolio.vn'),
    {page_location: 'https://smartfolio.vn/optimizer', page_title: 'Smartfolio | Kết quả CV', screen_name: 'cv_result'},
  );
  assert.equal(normalizeAnalyticsRoute('/reset-password', '?token=secret', 'https://smartfolio.vn'), null);
  assert.equal(normalizeAnalyticsRoute('/admin/users', '', 'https://smartfolio.vn'), null);
  assert.equal(normalizeAnalyticsRoute('/unknown/123', '', 'https://smartfolio.vn'), null);
});

test('template and campaign values are allowlisted', () => {
  assert.deepEqual(normalizeAnalyticsRoute('/template/cloud-expert', '?utm_source=linkedin&utm_campaign=fall', 'https://smartfolio.vn'), {
    page_location: 'https://smartfolio.vn/template/:id?utm_source=linkedin&utm_campaign=fall',
    page_title: 'Smartfolio | Chi tiết mẫu CV',
    screen_name: 'template_detail',
    template_id: 'cloud-expert',
    utm_source: 'linkedin',
    utm_campaign: 'fall',
  });
  assert.equal(normalizeAnalyticsRoute('/template/private-template', '', 'https://smartfolio.vn'), null);
  assert.deepEqual(safeCampaign('?utm_source=user@example.com&utm_medium=social&token=secret'), {utm_medium: 'social'});
});

test('referrer is reduced to origin and invalid values are dropped', () => {
  assert.equal(sanitizeReferrer('https://search.example/path?q=private'), 'https://search.example');
  assert.equal(sanitizeReferrer('javascript:alert(1)'), '');
});

test('JD sources use the stable low-cardinality contract', () => {
  assert.equal(normalizeJdOrigin('SYSTEM'), 'system');
  assert.equal(normalizeJdOrigin('USER'), 'saved_user');
  assert.equal(normalizeJdOrigin('custom'), 'custom_text');
  assert.equal(normalizeJdOrigin('external-feed'), 'unknown');
});

test('event schema rejects missing required fields and drops fields outside the contract', () => {
  assert.equal(sanitizeEvent('template_selected', {template_id: 'not-in-catalog'}, {environment: 'test'}), null);
  assert.equal(sanitizeEvent('unknown_event', {}, {environment: 'test'}), null);
  assert.deepEqual(sanitizeEvent('login', {method: 'email', email: 'private@example.com'}, {environment: 'test'}), {
    name: 'login',
    params: {schema_version: 1, environment: 'test', event_source: 'web', method: 'email'},
  });
  assert.equal(sanitizeEvent('page_view', {
    page_location: 'https://smartfolio.vn/optimizer?analysisId=05c18c0a-2d3f-4ab7-aeef-f31234567890',
    page_title: 'Private',
    screen_name: 'cv_result',
  }, {environment: 'test'}), null);
  assert.equal(sanitizeEvent('page_view', {
    page_location: 'https://smartfolio.vn/login?utm_source=user%40example.com',
    page_title: 'Private',
    screen_name: 'login',
  }, {environment: 'test'}), null);
});
