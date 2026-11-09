import apiClient from '../../../services/apiClient.js';

export async function resendVerificationEmail(email) {
    return apiClient.post('/auth/resend-verification', { email: email.trim() }, {
        publicRequest: true,
        anonymousRequest: true,
    });
}
