import apiClient from '../../../services/apiClient.js';

const TEMPLATE_CACHE_TTL_MS = 60_000;
const templateCache = new Map();
const templateRequests = new Map();

function getTemplateCacheKey(accessToken) {
    return accessToken && accessToken !== 'undefined' && accessToken !== 'null' ? accessToken : 'guest';
}

function fetchTemplates(cacheKey, accessToken) {
    if (templateRequests.has(cacheKey)) return templateRequests.get(cacheKey);

    const request = (async () => {
        if (accessToken) await apiClient.get('/auth/me');
        const response = await apiClient.get('/templates', { publicRequest: true });
        const data = response.data?.result;
        if (!Array.isArray(data)) throw new Error('Dữ liệu mẫu CV không hợp lệ.');
        templateCache.set(cacheKey, {data, expiresAt: Date.now() + TEMPLATE_CACHE_TTL_MS});
        return data;
    })().finally(() => templateRequests.delete(cacheKey));

    templateRequests.set(cacheKey, request);
    return request;
}

const templateService = {
    async getTemplates() {
        const accessToken = localStorage.getItem('accessToken');
        const cacheKey = getTemplateCacheKey(accessToken);
        const cached = templateCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) return cached.data;
        try {
            return await fetchTemplates(cacheKey, Boolean(accessToken && accessToken !== 'undefined' && accessToken !== 'null'));
        } catch (error) {
            console.error('[TemplateService] Error fetching templates:', error);
            throw error;
        }
    },

    invalidateTemplates() {
        templateCache.clear();
    },

    async submitTemplateFeedback(templateId, feedbackData) {
        try {
            const response = await apiClient.post('/templates/feedback', {
                templateId,
                ...feedbackData
            });
            return response.data?.result;
        } catch (error) {
            console.error(`[TemplateService] Error submitting feedback for template ${templateId}:`, error);
            throw error;
        }
    },
};

export default templateService;
