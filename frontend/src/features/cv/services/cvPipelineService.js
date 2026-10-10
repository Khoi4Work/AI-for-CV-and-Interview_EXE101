import apiClient from "../../../service/apiClient.js";

const getResult = (response) => response.data?.result;

export const cvPipelineService = {
    createCV: async (payload) => getResult(await apiClient.post('/cv', payload)),
    updateCV: async (id, payload) => getResult(await apiClient.put(`/cv/${id}`, payload)),
    startOptimization: async (id, payload) => getResult(await apiClient.post(`/cv/${id}/optimizations`, payload)),
    getOptimizationStatus: async (jobId) => getResult(await apiClient.get(`/cv/optimizations/${jobId}`)),
    getOptimizationResult: async (jobId) => getResult(await apiClient.get(`/cv/optimizations/${jobId}/result`)),
    recommendJDs: async (id) => getResult(await apiClient.get(`/cv/${id}/jd-recommendations`)),
    recommendHigherScoringOtherRoles: async (id, jdId, currentScore) => getResult(await apiClient.get(
        `/cv/${id}/jd-alternative-recommendations`, {params: {jdId, currentScore}},
    )),
    evaluateCV: async (id, jdId) => getResult(await apiClient.get(`/cv/${id}/evaluations`, {params: {jdId}})),
    evaluateCVText: async (id, jdText) => getResult(await apiClient.get(`/cv/${id}/evaluations`, {params: {jdText}})),
    analyzeCV: async (id, selection, key) => getResult(await apiClient.post(`/cv/${id}/analysis`, selection, { headers: {'Idempotency-Key': key} })),
    getAnalysis: async (id, signal) => getResult(await apiClient.get(`/cv/analyses/${id}`, {signal})),
    getEvidence: async (id) => getResult(await apiClient.get(`/cv/analyses/${id}/evidence`)),
    startAlternatives: async (id) => getResult(await apiClient.post(`/cv/analyses/${id}/alternatives`)),
    getAlternatives: async (id) => getResult(await apiClient.get(`/cv/analyses/${id}/alternatives`)),
    getCV: async (id) => getResult(await apiClient.get(`/cv/${id}`)),
    requestFeedback: async (id, jdId) => getResult(await apiClient.post(`/cv/${id}/feedback`, null, {params: {jdId}})),
    getFeedback: async (id, jdId) => getResult(await apiClient.get(`/cv/${id}/feedback`, {params: {jdId}})),
    analyzeSkillGap: async (id, jdId) => getResult(await apiClient.get(`/cv/${id}/skill-gap`, {params: {jdId}})),
};
