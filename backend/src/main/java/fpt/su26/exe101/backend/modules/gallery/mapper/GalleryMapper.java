package fpt.su26.exe101.backend.modules.gallery.mapper;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface GalleryMapper {
    CVResponseDTO cvToCVResponse(CV cv);
    JDResponseDTO jdToJDResponse(JobDescription jd);
    CVTemplateResponseDTO templateToTemplateResponse(CVTemplate template);
    TemplateFeedbackResponseDTO feedbackToFeedbackResponse(TemplateFeedback feedback);
    InterviewSessionResponseDTO sessionToSessionResponse(InterviewSession session);
    InterviewAnswerResponseDTO answerToAnswerResponse(InterviewAnswer answer);

    List<CVResponseDTO> cvsToCVResponses(List<CV> cvs);
    List<JDResponseDTO> jdsToJDResponses(List<JobDescription> jds);
    List<CVTemplateResponseDTO> templatesToTemplateResponses(List<CVTemplate> templates);
    List<TemplateFeedbackResponseDTO> feedbacksToFeedbackResponses(List<TemplateFeedback> feedbacks);
    List<InterviewSessionResponseDTO> sessionsToSessionResponses(List<InterviewSession> sessions);
    List<InterviewAnswerResponseDTO> answersToAnswerResponses(List<InterviewAnswer> answers);
}
