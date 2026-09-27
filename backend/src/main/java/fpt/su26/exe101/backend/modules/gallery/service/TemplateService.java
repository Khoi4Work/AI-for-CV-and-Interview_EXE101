package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.request.TemplateFeedbackRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.TemplateFeedbackResponseDTO;

import java.util.List;
import java.util.UUID;

public interface TemplateService {
    List<CVTemplateResponseDTO> getAllTemplates();
    void submitFeedback(TemplateFeedbackRequestDTO request);
    List<TemplateFeedbackResponseDTO> getFeedbackForTemplate(UUID templateId);
}
