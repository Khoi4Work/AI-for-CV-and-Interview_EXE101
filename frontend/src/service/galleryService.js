import userGalleryService from '../features/user/services/galleryService.js';
import templateService from '../features/cv/services/templateService.js';

const galleryService = {
    // Delegate to User Service
    async getGalleryAssets() { return userGalleryService.getGalleryAssets(); },
    async deleteCV(id) { return userGalleryService.deleteCV(id); },
    async deleteJD(id) { return userGalleryService.deleteJD(id); },
    async updateJD(id, payload) { return userGalleryService.updateJD(id, payload); },
    async getInterviewHistory() { return userGalleryService.getInterviewHistory(); },
    async getInterviewAnswers(sessionId) { return userGalleryService.getInterviewAnswers(sessionId); },

    // Delegate to CV Template Service
    async getTemplates() { return templateService.getTemplates(); },
    invalidateTemplates() { templateService.invalidateTemplates(); },
    async submitTemplateFeedback(templateId, feedbackData) { return templateService.submitTemplateFeedback(templateId, feedbackData); },
};

export default galleryService;
