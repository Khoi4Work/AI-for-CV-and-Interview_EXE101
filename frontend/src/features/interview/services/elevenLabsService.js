import { interviewService } from './interviewService.js';

export const fetchElevenLabsAudio = async (questionId) => {
  const audioBlob = await interviewService.getQuestionAudio(questionId);
  return URL.createObjectURL(audioBlob);
};
