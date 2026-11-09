import apiClient from "../../../services/apiClient.js";

export const feedbackService = {
    feedback: (formData) => {
        return apiClient.post('/feedbacks', formData);
    }
}