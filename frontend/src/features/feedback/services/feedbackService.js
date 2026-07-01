import apiClient from "../../../service/apiClient.js";

export const feedbackService = {
    feedback: (formData) => {
        return apiClient.post('/feedbacks', formData);
    }
}