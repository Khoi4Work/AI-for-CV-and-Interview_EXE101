import apiClient from '../../../service/apiClient.js';

const resultOf = (response) => response.data?.result ?? response.data;

export const interviewService = {
  getGalleryAssets: async () => resultOf(await apiClient.get('/gallery/assets')),

  createSession: async (request) => resultOf(await apiClient.post('/interview/sessions', request)),

  submitAnswer: async (sessionId, request) => resultOf(
    await apiClient.post(`/interview/sessions/${sessionId}/answers`, request),
  ),

  submitAudioAnswer: async (sessionId, questionId, audioBlob) => {
    const formData = new FormData();
    const extension = audioBlob.type.includes('ogg') ? 'ogg' : 'webm';
    formData.append('questionId', questionId);
    formData.append('audio', audioBlob, `interview-answer.${extension}`);
    return resultOf(await apiClient.post(`/interview/sessions/${sessionId}/answers/audio`, formData));
  },

  evaluateSession: async (sessionId) => resultOf(
    await apiClient.post(`/interview/sessions/${sessionId}/evaluate`),
  ),

  getQuestionAudio: async (questionId) => {
    const response = await apiClient.get(`/interview/questions/${questionId}/audio`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
