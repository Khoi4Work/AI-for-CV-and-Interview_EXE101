package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;

import java.util.List;

public interface InterviewQuestionRelevanceService {
    List<InterviewQuestion> findRelevantQuestions(List<InterviewQuestion> candidates, String cvContext, int limit);
}
