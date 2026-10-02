import apiClient from './apiClient.js';

export async function resendVerificationEmail(email) {
    return apiClient.post('/auth/resend-verification', { email: email.trim() }, {
        publicRequest: true,
        anonymousRequest: true,
    });
}

export function getResendWaitSeconds(error, now = Date.now()) {
    const value = error?.response?.headers?.['retry-after'];
    if (value == null || value === '') return 60;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds));
    const date = Date.parse(value);
    return Number.isFinite(date) ? Math.max(1, Math.ceil((date - now) / 1000)) : 60;
}
