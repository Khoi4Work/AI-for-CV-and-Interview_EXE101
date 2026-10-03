package fpt.su26.exe101.backend.modules.cv.mapper;

import fpt.su26.exe101.backend.modules.cv.dto.response.CVResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.TemplateFeedbackResponseDTO;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.entity.TemplateFeedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CVMapper {
    @Mapping(target = "galleryId", source = "gallery.id")
    CVResponseDTO cvToCVResponse(CV cv);
    CVTemplateResponseDTO templateToTemplateResponse(CVTemplate template);
    TemplateFeedbackResponseDTO feedbackToFeedbackResponse(TemplateFeedback feedback);

    List<CVResponseDTO> cvsToCVResponses(List<CV> cvs);
    List<CVTemplateResponseDTO> templatesToTemplateResponses(List<CVTemplate> templates);
    List<TemplateFeedbackResponseDTO> feedbacksToFeedbackResponses(List<TemplateFeedback> feedbacks);
}
