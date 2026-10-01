package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.request.TemplateFeedbackRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.TemplateFeedbackResponseDTO;

import java.util.List;
import java.util.UUID;

public interface TemplateService {
    List<CVTemplateResponseDTO> getAllTemplates();
    void submitFeedback(TemplateFeedbackRequestDTO request);
    List<TemplateFeedbackResponseDTO> getFeedbackForTemplate(String templateId);
}
