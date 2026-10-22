const ERROR_CATEGORIES = new Set(['validation', 'auth', 'quota', 'network', 'provider', 'server', 'unknown']);
const JD_ORIGINS = new Set(['system', 'saved_user', 'custom_text', 'unknown']);
const RESULT_ORIGINS = new Set(['new', 'reused', 'unknown']);

const EVENT_RULES = Object.freeze({
  page_view: {
    page_location: 'url', page_title: 'short', page_referrer: 'origin', screen_name: 'enum:screen', template_id: 'template',
    utm_source: 'campaign', utm_medium: 'campaign', utm_campaign: 'campaign',
  },
  registration_submitted: { method: 'enum:auth_method' },
  login: { method: 'enum:auth_method' },
  template_selected: { template_id: 'template' },
  cv_saved: { save_mode: 'enum:save_mode' },
  cv_import_succeeded: { file_type: 'enum:file_type', result_origin: 'enum:result_origin' },
  jd_selected: { jd_origin: 'enum:jd_origin' },
  cv_evaluation_requested: { jd_origin: 'enum:jd_origin', result_origin: 'enum:result_origin' },
  cv_result_viewed: { jd_origin: 'enum:jd_origin' },
  cv_download_requested: { template_id: 'template' },
  interview_setup_submitted: { interview_type: 'identifier', duration_minutes: 'integer' },
  interview_result_viewed: { interview_type: 'identifier' },
  pricing_viewed: { screen_name: 'enum:screen' },
  begin_checkout: { currency: 'enum:currency', value: 'number', package_code: 'identifier', items: 'items' },
  feature_error: { feature: 'identifier', error_category: 'enum:error_category' },
});

const REQUIRED_FIELDS = Object.freeze({
  page_view: ['page_location', 'page_title', 'screen_name'],
  registration_submitted: ['method'], login: ['method'], template_selected: ['template_id'],
  cv_saved: ['save_mode'], cv_import_succeeded: ['file_type', 'result_origin'], jd_selected: ['jd_origin'],
  cv_evaluation_requested: ['jd_origin', 'result_origin'], cv_result_viewed: ['jd_origin'],
  cv_download_requested: ['template_id'], interview_setup_submitted: ['interview_type', 'duration_minutes'],
  interview_result_viewed: ['interview_type'], pricing_viewed: ['screen_name'],
  begin_checkout: ['currency', 'value', 'package_code', 'items'], feature_error: ['feature', 'error_category'],
});

const ENUMS = {
  auth_method: new Set(['email', 'google']),
  save_mode: new Set(['create', 'update']),
  file_type: new Set(['pdf', 'doc', 'docx', 'unknown']),
  result_origin: RESULT_ORIGINS,
  jd_origin: JD_ORIGINS,
  error_category: ERROR_CATEGORIES,
  currency: new Set(['VND']),
  screen: new Set([
    'landing', 'login', 'register', 'check_email', 'forgot_password', 'interview_landing',
    'template_list', 'template_detail', 'cv_evaluation', 'home', 'cv_result', 'cv_analyzing',
    'cv_builder', 'cv_analysis', 'cv_editor', 'payment', 'audio_setup', 'video_setup',
    'interview_room', 'interview_review', 'interview_result', 'interview_job_selection',
    'interview_cv_status', 'interview_experience_level', 'interview_career_goal',
    'interview_setup', 'personal_info', 'security', 'pricing', 'my_cvs', 'my_jds', 'history',
  ]),
};

const TEMPLATE_IDS = new Set([
  'the-standard', 'data-scientist', 'portfolio-hybrid', 'boardroom-ready', 'cloud-expert', 'security-analyst',
]);

function cleanString(value, max = 100) {
  if (typeof value !== 'string') return undefined;
  const cleaned = [...value.trim()].filter((character) => {
    const code = character.charCodeAt(0);
    return code >= 32 && code !== 127;
  }).join('');
  return cleaned ? cleaned.slice(0, max) : undefined;
}

function cleanIdentifier(value) {
  const cleaned = cleanString(value, 64)?.toLowerCase();
  return cleaned && /^[a-z0-9][a-z0-9_-]*$/.test(cleaned) ? cleaned : undefined;
}

function cleanCampaign(value) {
  const cleaned = cleanString(value, 100);
  if (!cleaned || cleaned.includes('@') || /token|password|bearer|jwt/i.test(cleaned)) return undefined;
  return /^[a-zA-Z0-9._~ -]+$/.test(cleaned) ? cleaned : undefined;
}

function cleanUrl(value) {
  const cleaned = cleanString(value, 300);
  let decoded = cleaned;
  try { decoded = decodeURIComponent(cleaned); } catch { return undefined; }
  if (!cleaned || decoded.includes('@') || /token|password|bearer|jwt/i.test(decoded)) return undefined;
  if (/[0-9a-f]{8}-[0-9a-f-]{27,}/i.test(cleaned)) return undefined;
  try {
    const url = new URL(cleaned, 'https://analytics.invalid');
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.hash) return undefined;
    if ([...url.searchParams.entries()].some(([key, campaign]) =>
      !['utm_source', 'utm_medium', 'utm_campaign'].includes(key) || !cleanCampaign(campaign))) return undefined;
    return cleaned;
  } catch {
    return undefined;
  }
}

function cleanOrigin(value) {
  const cleaned = cleanString(value, 300);
  if (!cleaned) return undefined;
  try {
    const url = new URL(cleaned);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === cleaned ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

function cleanItems(value) {
  if (!Array.isArray(value)) return undefined;
  const items = value.slice(0, 10).map((item) => {
    const itemId = cleanIdentifier(item?.item_id || item?.id || item?.code);
    const itemName = cleanString(item?.item_name || item?.name, 80);
    const price = Number(item?.price);
    const quantity = Number(item?.quantity ?? 1);
    if (!itemId || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 1) return null;
    return { item_id: itemId, ...(itemName ? { item_name: itemName } : {}), price, quantity };
  }).filter(Boolean);
  return items.length ? items : undefined;
}

function cleanValue(rule, value) {
  if (rule === 'short') return cleanString(value, 120);
  if (rule === 'url') return cleanUrl(value);
  if (rule === 'origin') return cleanOrigin(value);
  if (rule === 'identifier') return cleanIdentifier(value);
  if (rule === 'campaign') return cleanCampaign(value);
  if (rule === 'template') return TEMPLATE_IDS.has(value) ? value : undefined;
  if (rule === 'integer') {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 && number <= 1440 ? number : undefined;
  }
  if (rule === 'number') {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : undefined;
  }
  if (rule === 'items') return cleanItems(value);
  if (rule.startsWith('enum:')) {
    const candidate = cleanString(value, 64);
    return ENUMS[rule.slice(5)]?.has(candidate) ? candidate : undefined;
  }
  return undefined;
}

export function sanitizeEvent(name, properties = {}, common = {}) {
  const rules = EVENT_RULES[name];
  if (!rules) return null;
  const params = {
    schema_version: 1,
    environment: cleanIdentifier(common.environment),
    event_source: common.eventSource === 'server' ? 'server' : 'web',
  };

  Object.entries(rules).forEach(([key, rule]) => {
    const cleaned = cleanValue(rule, properties[key]);
    if (cleaned !== undefined) params[key] = cleaned;
  });

  if ((REQUIRED_FIELDS[name] || []).some((key) => params[key] === undefined)) return null;

  return { name, params };
}

export function isAllowedEvent(name) {
  return Object.hasOwn(EVENT_RULES, name);
}

export { ERROR_CATEGORIES, JD_ORIGINS, RESULT_ORIGINS, TEMPLATE_IDS };
