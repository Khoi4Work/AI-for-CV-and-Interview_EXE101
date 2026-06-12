import apiClient from "./apiClient.js";

export const feedbackService = {
    feedback: (formData) => {
        return apiClient.post('/feedbacks', formData);
    }
}