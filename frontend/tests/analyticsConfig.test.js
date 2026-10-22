import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnalyticsConfig} from '../src/features/analytics/analyticsConfig.js';

const validEnv = {
  VITE_ANALYTICS_ENABLED: 'true',
  VITE_GA_MEASUREMENT_ID: 'G-TEST123',
  VITE_ANALYTICS_ENV: 'test',
  VITE_ANALYTICS_ALLOWED_HOSTS: 'localhost, test.smartfolio.vn',
};

test('analytics enables only for an explicit valid environment and exact allowed host', () => {
  assert.equal(createAnalyticsConfig(validEnv, {hostname: 'localhost'}).enabled, true);
  assert.equal(createAnalyticsConfig(validEnv, {hostname: 'evil-localhost'}).enabled, false);
  assert.equal(createAnalyticsConfig({...validEnv, VITE_ANALYTICS_ENABLED: 'false'}, {hostname: 'localhost'}).reason, 'disabled');
  assert.equal(createAnalyticsConfig({...validEnv, VITE_GA_MEASUREMENT_ID: 'bad'}, {hostname: 'localhost'}).reason, 'invalid_measurement_id');
  assert.equal(createAnalyticsConfig({...validEnv, VITE_ANALYTICS_ENV: 'preview'}, {hostname: 'localhost'}).reason, 'invalid_environment');
});
