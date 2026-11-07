import apiClient from './apiClient';

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

const galleryService = {
    async getGalleryAssets() {
        try {
            const response = await apiClient.get('/gallery/assets');
            const data = response.data?.result;
            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log('[GalleryService] No data found for gallery assets');
                return [];
            }
            return data;
        } catch (error) {
            console.error('[GalleryService] Error fetching gallery assets:', error);
            throw error;
        }
    },

    async deleteCV(id) {
        try {
            const response = await apiClient.delete(`/gallery/cv/${id}`);
            return response.data?.result;
        } catch (error) {
            console.error(`[GalleryService] Error deleting CV ${id}:`, error);
            throw error;
        }
    },

    async deleteJD(id) {
        try {
            const response = await apiClient.delete(`/gallery/jd/${id}`);
            return response.data?.result;
        } catch (error) {
            console.error(`[GalleryService] Error deleting JD ${id}:`, error);
            throw error;
        }
    },

    async updateJD(id, payload) {
        try {
            const response = await apiClient.put(`/gallery/jd/${id}`, payload);
            return response.data?.result;
        } catch (error) {
            console.error(`[GalleryService] Error updating JD ${id}:`, error);
            throw error;
        }
    },

    async getTemplates() {
        const accessToken = localStorage.getItem('accessToken');
        const cacheKey = getTemplateCacheKey(accessToken);
        const cached = templateCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) return cached.data;
        try {
            return await fetchTemplates(cacheKey, Boolean(accessToken && accessToken !== 'undefined' && accessToken !== 'null'));
        } catch (error) {
            console.error('[GalleryService] Error fetching templates:', error);
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
            console.error(`[GalleryService] Error submitting feedback for template ${templateId}:`, error);
            throw error;
        }
    },

    async getInterviewHistory() {
        try {
            const response = await apiClient.get('/gallery/interviews');
            const data = response.data?.result;
            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log('[GalleryService] No data found for interview history');
                return [];
            }
            return data;
        } catch (error) {
            console.error('[GalleryService] Error fetching interview history:', error);
            throw error;
        }
    },

    async getInterviewAnswers(sessionId) {
        try {
            const response = await apiClient.get(`/gallery/interviews/${sessionId}/answers`);
            const data = response.data?.result;
            if (!data) {
                console.log(`[GalleryService] No answers found for session ${sessionId}`);
                return null;
            }
            return data;
        } catch (error) {
            console.error(`[GalleryService] Error fetching answers for session ${sessionId}:`, error);
            throw error;
        }
    }
};

export default galleryService;
