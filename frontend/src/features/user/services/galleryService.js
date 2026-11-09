import apiClient from '../../../services/apiClient.js';

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
