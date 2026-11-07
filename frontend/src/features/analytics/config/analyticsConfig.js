const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]+$/;
const VALID_ENVIRONMENTS = new Set(['production', 'test']);

function splitHosts(value) {
  return String(value || '')
    .split(',')
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
}

export function createAnalyticsConfig(env = {}, location = {}) {
  const measurementId = String(env.VITE_GA_MEASUREMENT_ID || '').trim().toUpperCase();
  const environment = String(env.VITE_ANALYTICS_ENV || '').trim().toLowerCase();
  const hostname = String(location.hostname || '').trim().toLowerCase();
  const allowedHosts = splitHosts(env.VITE_ANALYTICS_ALLOWED_HOSTS);
  const enabled = String(env.VITE_ANALYTICS_ENABLED || '').toLowerCase() === 'true';
  const validMeasurementId = MEASUREMENT_ID_PATTERN.test(measurementId);
  const validEnvironment = VALID_ENVIRONMENTS.has(environment);
  const allowedHost = Boolean(hostname) && allowedHosts.includes(hostname);

  return Object.freeze({
    enabled: enabled && validMeasurementId && validEnvironment && allowedHost,
    measurementId,
    environment,
    hostname,
    allowedHosts,
    debugMode: environment === 'test',
    reason: !enabled ? 'disabled'
      : !validMeasurementId ? 'invalid_measurement_id'
        : !validEnvironment ? 'invalid_environment'
          : !allowedHost ? 'host_not_allowed'
            : '',
  });
}

const viteEnv = import.meta.env || {};
const browserLocation = typeof window === 'undefined' ? {} : window.location;

export const analyticsConfig = createAnalyticsConfig(viteEnv, browserLocation);
