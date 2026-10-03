import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '../../../service/apiClient.js';
import { HR_PERSONAS, labelForScore } from '../constants/feedbackInterviewRubric.js';
import { interviewService } from '../services/interviewService.js';

const SESSION_KEY = 'interview_session_v1';

const initialState = () => ({
  step: 0,
  job: null,
  cvStatus: null,
  experienceLevel: null,
  careerGoal: '',
  interviewConfig: null,
  audioTestPassed: false,
  videoSetupConfirmed: false,
  backendSessionId: null,
  sessionError: null,
  questions: [],
  answers: [],
  transcriptLog: [],
  skipStreak: 0,
  feedback: null,
  startedAt: null,
  endedAt: null,
});

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return initialState();
    return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    return initialState();
  }
}

function saveSession(state) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // Continue the current interview if sessionStorage is unavailable.
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignore disabled storage.
  }
}

function backendInterviewType(type) {
  return type === 'Technical' ? 'TECHNICAL' : type === 'Behavioral' ? 'BEHAVIORAL' : 'HR';
}

function personaForType(type) {
  const personaType = type === 'TECHNICAL' ? 'Technical' : type === 'BEHAVIORAL' ? 'Behavioral' : 'HR';
  return HR_PERSONAS.FPT[personaType];
}

function toFeedback(evaluation, state) {
  const overallScore = evaluation.overallScore ?? 0;
  const scoreLabel = labelForScore(overallScore);
  const questionFeedback = new Map((evaluation.questionFeedback || []).map((item) => [item.questionId, item]));
  const answers = new Map((state.answers || []).map((answer) => [answer.qid, answer]));

  return {
    overallScore,
    overallLabel: scoreLabel.label,
    overallColor: scoreLabel.color,
    hrPersona: personaForType(state.interviewConfig?.type),
    summary: evaluation.summary || '',
    strengths: evaluation.strengths || [],
    improvementAreas: evaluation.improvementAreas || [],
    recommendations: evaluation.recommendations || [],
    criteria: (evaluation.criteria || []).map((item) => ({
      key: item.criterion,
      label: item.criterion,
      score: item.score,
      feedback: item.feedback,
      color: 'bg-blue-500',
    })),
    transcript: (state.questions || []).map((question) => {
      const answer = answers.get(question.id);
      const skipped = !answer || answer.skipped;
      const perQuestion = questionFeedback.get(question.id);
      const suggestions = perQuestion?.improvementSuggestion
        ? [{ tag: 'must-have', text: perQuestion.improvementSuggestion }]
        : [];
      return {
        qid: question.id,
        question: question.text,
        answer: skipped ? 'Đã bỏ qua câu hỏi này' : (answer.text || ''),
        status: skipped ? 'skipped' : (perQuestion ? (perQuestion.score >= 70 ? 'pass' : 'improve') : 'reviewed'),
        assessment: perQuestion?.assessment || '',
        suggestions,
      };
    }),
  };
}

function normalizeSavedAnswers(savedAnswers = []) {
  return savedAnswers.map((answer) => ({
    qid: answer.questionId,
    text: answer.answerText || '',
    skipped: Boolean(answer.isSkipped),
  }));
}

export function useInterviewSession() {
  const [data, setData] = useState(loadSession);
  const dataRef = useRef(data);
  const createPromiseRef = useRef(null);
  const evaluatePromiseRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    dataRef.current = data;
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    saveSession(data);
  }, [data]);

  const update = useCallback((patch) => {
    const next = { ...dataRef.current, ...patch };
    dataRef.current = next;
    saveSession(next);
    setData(next);
  }, []);

  const reset = useCallback(() => {
    clearSession();
    setData(initialState());
  }, []);

  const setStep = useCallback((step) => {
    setData((previous) => ({ ...previous, step }));
  }, []);

  const clearCurrentInterview = useCallback(() => {
    const next = {
      ...data,
      videoSetupConfirmed: true,
      backendSessionId: null,
      sessionError: null,
      questions: [],
      answers: [],
      transcriptLog: [],
      skipStreak: 0,
      feedback: null,
      startedAt: null,
      endedAt: null,
    };
    dataRef.current = next;
    saveSession(next);
    setData(next);
  }, [data]);

  const generateQuestions = useCallback(() => {
    const currentData = dataRef.current;
    if (currentData.backendSessionId && currentData.questions.length) return Promise.resolve(currentData.questions);
    if (createPromiseRef.current) return createPromiseRef.current;

    const { interviewConfig } = currentData;
    if (!interviewConfig?.type || !interviewConfig?.duration || !currentData.experienceLevel) {
      const message = 'Thiếu cấu hình loại phỏng vấn, thời lượng hoặc cấp độ kinh nghiệm.';
      update({ sessionError: message });
      return Promise.reject(new Error(message));
    }

    update({ sessionError: null });
    createPromiseRef.current = interviewService.createSession({
      interviewType: backendInterviewType(interviewConfig.type),
      durationMinutes: Number(interviewConfig.duration),
      experienceLevel: currentData.experienceLevel.toUpperCase(),
      language: interviewConfig.language || 'vi',
      cvId: currentData.cvId || undefined,
      jdText: interviewConfig.jd?.trim() || undefined,
      adaptiveMode: false,
    }).then((session) => {
      const questions = (session.questions || []).map((question) => ({
        id: question.id,
        text: question.text,
        category: question.category,
        competency: question.competency,
      }));
      const next = {
        ...loadSession(),
        ...dataRef.current,
        backendSessionId: session.id,
        sessionError: null,
        questions,
        answers: [],
        transcriptLog: [],
        skipStreak: 0,
        feedback: null,
        startedAt: Date.now(),
        endedAt: null,
        seed: Date.now(),
      };
      dataRef.current = next;
      saveSession(next);
      setData(next);
      return questions;
    }).catch((error) => {
      const message = getApiErrorMessage(error, 'Không thể tạo buổi phỏng vấn.');
      update({ sessionError: message });
      throw error;
    }).finally(() => {
      createPromiseRef.current = null;
    });

    return createPromiseRef.current;
  }, [update]);

  const saveAnswer = useCallback(async (questionId, answer, { audioBlob } = {}) => {
    const sessionId = data.backendSessionId;
    if (!sessionId) throw new Error('Không tìm thấy interview session trên máy chủ.');

    const saved = audioBlob && !answer.skipped
      ? await interviewService.submitAudioAnswer(sessionId, questionId, audioBlob)
      : await interviewService.submitAnswer(sessionId, {
        questionId,
        answerText: answer.skipped ? null : answer.text,
        isSkipped: Boolean(answer.skipped),
      });

    const normalizedAnswer = {
      ...answer,
      qid: questionId,
      text: saved.answerText ?? (answer.skipped ? '' : answer.text),
    };
    const next = {
      ...data,
      answers: [...data.answers.filter((item) => item.qid !== questionId), normalizedAnswer],
      transcriptLog: [
        ...data.transcriptLog,
        { role: 'user', text: normalizedAnswer.text || '(bỏ qua)', atMs: Date.now() - (data.startedAt || Date.now()) },
      ],
      skipStreak: normalizedAnswer.skipped ? data.skipStreak + 1 : 0,
    };
    dataRef.current = next;
    saveSession(next);
    setData(next);
    return normalizedAnswer;
  }, [data]);

  const addTranscript = useCallback((role, text) => {
    setData((previous) => ({
      ...previous,
      transcriptLog: [...previous.transcriptLog, { role, text, atMs: Date.now() - (previous.startedAt || Date.now()) }],
    }));
  }, []);

  const generateFeedback = useCallback(() => {
    if (data.feedback) return Promise.resolve(data.feedback);
    if (evaluatePromiseRef.current) return evaluatePromiseRef.current;
    if (!data.backendSessionId) return Promise.reject(new Error('Không tìm thấy interview session trên máy chủ.'));

    evaluatePromiseRef.current = interviewService.evaluateSession(data.backendSessionId)
      .then(async (evaluation) => {
        // The backend is the source of truth for answers used during evaluation.
        // Browser session storage can be stale after navigation or a refresh.
        const detail = await interviewService.getSessionDetail(data.backendSessionId);
        const answers = normalizeSavedAnswers(detail.answers);
        const feedback = toFeedback(evaluation, { ...data, answers });
        const next = { ...data, answers, feedback, endedAt: Date.now(), sessionError: null };
        dataRef.current = next;
        saveSession(next);
        setData(next);
        return feedback;
      }).catch((error) => {
        update({ sessionError: getApiErrorMessage(error, 'Không thể tạo phản hồi phỏng vấn.') });
        throw error;
      }).finally(() => {
        evaluatePromiseRef.current = null;
      });

    return evaluatePromiseRef.current;
  }, [data, update]);

  const finishInterview = useCallback(async () => {
    if (!data.backendSessionId) return;
    await interviewService.finishSession(data.backendSessionId);
    const next = { ...data, endedAt: Date.now() };
    dataRef.current = next;
    saveSession(next);
    setData(next);
  }, [data]);

  return {
    data,
    update,
    reset,
    setStep,
    clearCurrentInterview,
    generateQuestions,
    generateFeedback,
    finishInterview,
    saveAnswer,
    addTranscript,
  };
}
