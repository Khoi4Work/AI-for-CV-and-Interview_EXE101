// /src/hooks/useInterviewSession.js
// Quản lý session state qua sessionStorage — key 'interview_session_v1'
import { useCallback, useEffect, useRef, useState } from 'react';
import { pickQuestionsForSession } from '../constant/questionBank';
import { COMPANIES } from '../constant/companies';
import { CRITERIA, HR_PERSONAS, labelForScore } from '../constant/feedbackRubric';

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
    const parsed = JSON.parse(raw);
    return { ...initialState(), ...parsed };
  } catch (e) {
    return initialState();
  }
}

function saveSession(state) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch (e) {
    // sessionStorage full or disabled — fail silently
  }
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (e) {
    // ignore
  }
}

// Simple deterministic random based on seed
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function useInterviewSession() {
  const [data, setData] = useState(loadSession);
  const isInitialized = useRef(false);

  // Persist on every change
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    saveSession(data);
  }, [data]);

  const update = useCallback((patch) => {
    setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    clearSession();
    setData(initialState());
  }, []);

  const setStep = useCallback((n) => {
    setData((prev) => ({ ...prev, step: n }));
  }, []);

  /**
   * Sinh questions[] cho session dựa trên interviewConfig.
   * Gọi khi vào /interview/room (nếu chưa có).
   */
  const generateQuestions = useCallback(() => {
    setData((prev) => {
      if (prev.questions && prev.questions.length > 0) return prev;
      const { type, duration } = prev.interviewConfig || {};
      const level = prev.experienceLevel || 'Junior';
      if (!type || !duration) return prev;
      const seed = Date.now();
      const questions = pickQuestionsForSession({ type, level, duration, seed });
      return {
        ...prev,
        questions,
        answers: [],
        transcriptLog: [],
        skipStreak: 0,
        startedAt: Date.now(),
        seed,
      };
    });
  }, []);

  /**
   * Sinh feedback object từ session. Gọi khi vào /interview/result.
   */
  const generateFeedback = useCallback(() => {
    setData((prev) => {
      if (prev.feedback) return prev;
      const { questions = [], answers = [], interviewConfig, experienceLevel } = prev;
      if (!questions.length) return prev;

      const totalCount = questions.length;
      const answered = answers.filter((a) => !a.skipped);
      const skipped = answers.filter((a) => a.skipped);
      const skippedCount = skipped.length;

      // Must-have answered count
      const mustHaveAnswered = answered.filter((a) => {
        const q = questions.find((qq) => qq.id === a.qid);
        return q && q.mustHave;
      }).length;

      // Overall score
      let base = 50;
      base += (answered.length / totalCount) * 30;
      base += mustHaveAnswered * 5;
      base -= skippedCount * 5;
      base += seededRandom(prev.seed || 1) * 10 - 5;
      const overallScore = Math.max(0, Math.min(100, Math.round(base)));
      const overallLabel = labelForScore(overallScore);

      // Per-criterion
      // Communication — avg words per answer
      const avgWords = answered.length
        ? answered.reduce((sum, a) => sum + (a.text || '').split(/\s+/).filter(Boolean).length, 0) / answered.length
        : 0;
      const communication = Math.max(0, Math.min(100, Math.round(avgWords * 4))); // 25 words = 100

      // Content — % non-empty
      const content = Math.round((answered.length / totalCount) * 100);

      // Confidence — penalize skips heavily
      const confidence = Math.max(0, Math.min(100, 100 - skippedCount * 15));

      // Structure — % answers with STAR-like words (mock baseline 50%)
      const starCount = answered.filter((a) => {
        const t = (a.text || '').toLowerCase();
        return t.includes('tình huống') || t.includes('nhiệm vụ') || t.includes('hành động') || t.includes('kết quả')
          || t.includes('situation') || t.includes('task') || t.includes('action') || t.includes('result');
      }).length;
      const structure = Math.round(((starCount / Math.max(answered.length, 1)) * 50) + 50);

      // Technical — keyword match (only for Technical)
      let technical = null;
      if (interviewConfig?.type === 'Technical') {
        let totalMatch = 0;
        let maxMatch = 0;
        answered.forEach((a) => {
          const q = questions.find((qq) => qq.id === a.qid);
          if (!q || !q.keywordsForMatch) return;
          maxMatch += q.keywordsForMatch.length;
          const text = (a.text || '').toLowerCase();
          q.keywordsForMatch.forEach((k) => {
            if (text.includes(k.toLowerCase())) totalMatch++;
          });
        });
        technical = maxMatch > 0 ? Math.round((totalMatch / maxMatch) * 100) : 0;
      }

      const criteria = CRITERIA
        .filter((c) => !c.onlyForType || c.onlyForType === interviewConfig?.type)
        .map((c) => ({
          key: c.key,
          label: c.label,
          score: c.key === 'communication' ? communication
            : c.key === 'content' ? content
            : c.key === 'confidence' ? confidence
            : c.key === 'structure' ? structure
            : c.key === 'technical' ? (technical || 0) : 0,
          color: 'bg-blue-500',
        }));

      // HR persona
      const company = interviewConfig?.company?.id || 'fpt';
      const type = interviewConfig?.type || 'HR';
      const persona = HR_PERSONAS[company]?.[type] || HR_PERSONAS.FPT.HR;

      // Transcript with suggestions
      const transcript = questions.map((q) => {
        const a = answers.find((aa) => aa.qid === q.id);
        const skippedNow = a?.skipped;
        const userText = a?.text || '';
        const status = skippedNow ? 'skipped' : (userText.length > 30 ? 'pass' : 'improve');

        const suggestions = [];
        if (skippedNow) {
          suggestions.push({
            tag: 'must-have',
            text: `Bạn nên chuẩn bị câu trả lời cho câu hỏi này. Gợi ý: ${q.sampleAnswer.split('.')[0]}.`,
          });
        } else {
          // Keyword match
          const kw = q.keywordsForMatch || [];
          const matchCount = kw.filter((k) => userText.toLowerCase().includes(k.toLowerCase())).length;
          const matchRate = kw.length > 0 ? matchCount / kw.length : 1;
          if (matchRate < 0.3) {
            suggestions.push({
              tag: 'must-have',
              text: `Câu trả lời nên đề cập các khía cạnh: ${kw.slice(0, 3).join(', ')}. Gợi ý: ${q.sampleAnswer}.`,
            });
          } else if (matchRate < 0.7) {
            suggestions.push({
              tag: 'nice-to-have',
              text: `Bạn có thể bổ sung thêm: ${kw.slice(matchCount, matchCount + 2).join(', ')} để câu trả lời đầy đủ hơn.`,
            });
          }
        }
        return {
          qid: q.id,
          question: q.text,
          answer: skippedNow ? 'Đã bỏ qua câu hỏi này' : userText,
          status,
          suggestions,
        };
      });

      // Summary
      const topSuggestion = transcript
        .flatMap((t) => t.suggestions)
        .find((s) => s.tag === 'must-have');
      const summary = topSuggestion
        ? `Bạn đã thể hiện khá tốt. ${topSuggestion.text.split('.')[0]}.`
        : 'Bạn đã thể hiện tốt trong buổi phỏng vấn này. Hãy tiếp tục luyện tập!';

      return {
        ...prev,
        endedAt: Date.now(),
        feedback: {
          overallScore,
          overallLabel: overallLabel.label,
          overallColor: overallLabel.color,
          hrPersona: persona,
          criteria,
          transcript,
          summary,
        },
      };
    });
  }, []);

  /**
   * Cập nhật 1 answer trong answers[].
   */
  const saveAnswer = useCallback((qid, answer) => {
    setData((prev) => {
      const newAnswers = [...prev.answers.filter((a) => a.qid !== qid), answer];
      const newLog = [
        ...prev.transcriptLog,
        { role: 'user', text: answer.text || '(bỏ qua)', atMs: Date.now() - (prev.startedAt || Date.now()) },
      ];
      // Reset skipStreak nếu user trả lời thật
      const newSkipStreak = answer.skipped ? prev.skipStreak + 1 : 0;
      return {
        ...prev,
        answers: newAnswers,
        transcriptLog: newLog,
        skipStreak: newSkipStreak,
      };
    });
  }, []);

  const addTranscript = useCallback((role, text) => {
    setData((prev) => ({
      ...prev,
      transcriptLog: [
        ...prev.transcriptLog,
        { role, text, atMs: Date.now() - (prev.startedAt || Date.now()) },
      ],
    }));
  }, []);

  return {
    data,
    update,
    reset,
    setStep,
    generateQuestions,
    generateFeedback,
    saveAnswer,
    addTranscript,
  };
}
