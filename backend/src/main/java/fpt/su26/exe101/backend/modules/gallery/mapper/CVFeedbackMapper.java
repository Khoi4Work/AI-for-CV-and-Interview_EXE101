package fpt.su26.exe101.backend.modules.gallery.mapper;

import fpt.su26.exe101.backend.modules.gallery.dto.CVFeedbackResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.CVFeedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.Map;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CVFeedbackMapper {
    @Mapping(target = "feedback", source = "feedbackJson")
    CVFeedbackResponseDTO toResponse(CVFeedback feedback);

    CVFeedbackResponseDTO.Feedback toFeedback(Map<String, Object> feedbackJson);

    Map<String, Object> toFeedbackJson(CVFeedbackResponseDTO.Feedback feedback);
}
