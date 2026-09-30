import apiClient from './apiClient';

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

    async getTemplates() {
        try {
            const response = await apiClient.get('/templates');
            const data = response.data?.result;
            if (!data || (Array.isArray(data) && data.length === 0)) {
                console.log('[GalleryService] No data found for templates');
                return [];
            }
            return data;
        } catch (error) {
            console.error('[GalleryService] Error fetching templates:', error);
            throw error;
        }
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
