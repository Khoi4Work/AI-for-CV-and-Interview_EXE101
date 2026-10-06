package fpt.su26.exe101.backend.modules.interview.service;

import fpt.su26.exe101.backend.modules.interview.dto.InterviewSpeechTransition;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewQuestion;

public interface InterviewSpeechScriptService {
    String compose(InterviewQuestion question, InterviewSpeechTransition transition, String modelId);
}
