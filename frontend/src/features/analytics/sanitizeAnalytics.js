import { TEMPLATE_IDS } from './eventSchema.js';

const EXACT_ROUTES = new Map([
  ['/', ['/', 'landing', 'Trang chủ']],
  ['/login', ['/login', 'login', 'Đăng nhập']],
  ['/register', ['/register', 'register', 'Đăng ký']],
  ['/check-email', ['/check-email', 'check_email', 'Kiểm tra email']],
  ['/forgot-password', ['/forgot-password', 'forgot_password', 'Quên mật khẩu']],
  ['/interview', ['/interview', 'interview_landing', 'Luyện phỏng vấn']],
  ['/templates', ['/templates', 'template_list', 'Mẫu CV']],
  ['/cv-evaluation', ['/cv-evaluation', 'cv_evaluation', 'Đánh giá CV']],
  ['/home', ['/home', 'home', 'Trang cá nhân']],
  ['/optimizer', ['/optimizer', 'cv_result', 'Kết quả CV']],
  ['/cv-analyzing', ['/cv-analyzing', 'cv_analyzing', 'Đang đánh giá CV']],
  ['/builder', ['/builder', 'cv_builder', 'Tạo CV']],
  ['/analysis', ['/analysis', 'cv_analysis', 'Phân tích CV']],
  ['/editor', ['/editor', 'cv_editor', 'Chỉnh sửa CV']],
  ['/payment', ['/payment', 'payment', 'Thanh toán']],
  ['/audio-setup', ['/audio-setup', 'audio_setup', 'Thiết lập âm thanh']],
  ['/video-setup', ['/video-setup', 'video_setup', 'Thiết lập video']],
  ['/interview/room', ['/interview/room', 'interview_room', 'Phòng phỏng vấn']],
  ['/interview/review', ['/interview/review', 'interview_review', 'Gửi đánh giá phỏng vấn']],
  ['/interview/result', ['/interview/result', 'interview_result', 'Kết quả phỏng vấn']],
  ['/interview/job-selection', ['/interview/job-selection', 'interview_job_selection', 'Chọn vị trí']],
  ['/interview/cv-status', ['/interview/cv-status', 'interview_cv_status', 'Chọn CV phỏng vấn']],
  ['/interview/experience-level', ['/interview/experience-level', 'interview_experience_level', 'Chọn kinh nghiệm']],
  ['/interview/career-goal', ['/interview/career-goal', 'interview_career_goal', 'Mục tiêu nghề nghiệp']],
  ['/interview/setup', ['/interview/setup', 'interview_setup', 'Cấu hình phỏng vấn']],
  ['/personal-info', ['/personal-info', 'personal_info', 'Thông tin cá nhân']],
  ['/security', ['/security', 'security', 'Bảo mật']],
  ['/pricing', ['/pricing', 'pricing', 'Bảng giá']],
  ['/my-cvs', ['/my-cvs', 'my_cvs', 'CV của tôi']],
  ['/my-jds', ['/my-jds', 'my_jds', 'JD của tôi']],
  ['/history', ['/history', 'history', 'Lịch sử']],
]);

const BLOCKED_ROUTES = [/^\/reset-password(?:\/|$)/, /^\/admin(?:\/|$)/];
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];

function campaignValue(value) {
  const cleaned = String(value || '').trim().slice(0, 100);
  if (!cleaned || cleaned.includes('@') || /token|password|bearer|jwt/i.test(cleaned)) return '';
  return /^[a-zA-Z0-9._~ -]+$/.test(cleaned) ? cleaned : '';
}

export function safeCampaign(search = '') {
  const params = new URLSearchParams(search);
  return CAMPAIGN_KEYS.reduce((result, key) => {
    const value = campaignValue(params.get(key));
    if (value) result[key] = value;
    return result;
  }, {});
}

export function normalizeAnalyticsRoute(pathname = '/', search = '', origin = '') {
  const normalizedPath = `/${String(pathname).split('?')[0].split('#')[0].split('/').filter(Boolean).join('/')}`;
  if (BLOCKED_ROUTES.some((pattern) => pattern.test(normalizedPath))) return null;

  let route = EXACT_ROUTES.get(normalizedPath);
  let templateId;
  const templateMatch = normalizedPath.match(/^\/template\/([^/]+)$/);
  if (!route && templateMatch && TEMPLATE_IDS.has(templateMatch[1])) {
    templateId = templateMatch[1];
    route = ['/template/:id', 'template_detail', 'Chi tiết mẫu CV'];
  }
  if (!route) return null;

  const campaign = safeCampaign(search);
  const query = new URLSearchParams(campaign).toString();
  const safePath = `${route[0]}${query ? `?${query}` : ''}`;
  const safeOrigin = /^https?:\/\/[^/?#]+$/i.test(origin) ? origin : '';
  return {
    page_location: `${safeOrigin}${safePath}`,
    page_title: `Smartfolio | ${route[2]}`,
    screen_name: route[1],
    ...(templateId ? { template_id: templateId } : {}),
    ...campaign,
  };
}

export function sanitizeReferrer(referrer = '') {
  if (!referrer) return '';
  try {
    const url = new URL(referrer);
    return ['http:', 'https:'].includes(url.protocol) ? url.origin : '';
  } catch {
    return '';
  }
}

export function categorizeAnalyticsError(error) {
  const status = Number(error?.response?.status || error?.status || 0);
  const code = String(error?.code || '').toUpperCase();
  if (status === 401 || status === 403) return 'auth';
  if (status === 400 || status === 422) return 'validation';
  if (status === 429 || code.includes('QUOTA')) return 'quota';
  if (!status && (code === 'ERR_NETWORK' || code === 'ECONNABORTED' || error?.name === 'TypeError')) return 'network';
  if (status >= 500) return 'server';
  return 'unknown';
}

export function normalizeJdOrigin(value) {
  const normalized = String(value || '').toLowerCase().replace(/[ -]+/g, '_');
  if (['system', 'saved_user', 'custom_text'].includes(normalized)) return normalized;
  if (normalized === 'saved' || normalized === 'user' || normalized === 'user_saved') return 'saved_user';
  if (normalized === 'custom' || normalized === 'text') return 'custom_text';
  return 'unknown';
}

export function safeFileType(file) {
  const extension = String(file?.name || '').split('.').pop()?.toLowerCase();
  return ['pdf', 'doc', 'docx'].includes(extension) ? extension : 'unknown';
}
