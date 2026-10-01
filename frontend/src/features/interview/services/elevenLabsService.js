import { interviewService } from './interviewService.js';

export const fetchElevenLabsAudio = async (questionId, signal) => {
  const audioBlob = await interviewService.getQuestionAudio(questionId, signal);
  return URL.createObjectURL(audioBlob);
};
