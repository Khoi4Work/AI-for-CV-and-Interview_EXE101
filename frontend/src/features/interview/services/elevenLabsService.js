import { interviewService } from './interviewService.js';

export const fetchElevenLabsAudio = async (questionId, transition, signal) => {
  const audioBlob = await interviewService.getQuestionAudio(questionId, transition, signal);
  return URL.createObjectURL(audioBlob);
};
