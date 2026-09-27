import apiClient from "../../../service/apiClient.js";

const getResult = (response) => response.data?.result;

export const cvPipelineService = {
    createCV: async (payload) => getResult(await apiClient.post('/cv', payload)),
    updateCV: async (id, payload) => getResult(await apiClient.put(`/cv/${id}`, payload)),
    startOptimization: async (id, payload) => getResult(await apiClient.post(`/cv/${id}/optimizations`, payload)),
    getOptimizationStatus: async (jobId) => getResult(await apiClient.get(`/cv/optimizations/${jobId}`)),
    getOptimizationResult: async (jobId) => getResult(await apiClient.get(`/cv/optimizations/${jobId}/result`)),
    evaluateCV: async (id, jdId) => getResult(await apiClient.get(`/cv/${id}/evaluations`, {params: {jdId}})),
    requestFeedback: async (id, jdId) => getResult(await apiClient.post(`/cv/${id}/feedback`, null, {params: {jdId}})),
    getFeedback: async (id) => getResult(await apiClient.get(`/cv/${id}/feedback`)),
    analyzeSkillGap: async (id, jdId) => getResult(await apiClient.get(`/cv/${id}/skill-gap`, {params: {jdId}})),
};
