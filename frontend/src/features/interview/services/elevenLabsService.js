import { interviewService } from './interviewService.js';

export const fetchElevenLabsAudio = async (questionId, transition, signal, sessionId) => {
  const audioBlob = await interviewService.getQuestionAudio(questionId, transition, signal, sessionId);
  return URL.createObjectURL(audioBlob);
};
