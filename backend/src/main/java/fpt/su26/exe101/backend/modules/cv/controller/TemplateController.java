package fpt.su26.exe101.backend.modules.cv.controller;

import fpt.su26.exe101.backend.modules.cv.dto.request.TemplateFeedbackRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.TemplateFeedbackResponseDTO;
import fpt.su26.exe101.backend.modules.cv.service.TemplateService;
import fpt.su26.exe101.backend.base.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {
    private final TemplateService templateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CVTemplateResponseDTO>>> getAllTemplates() {
        return ResponseEntity.ok(ApiResponse.success(templateService.getAllTemplates()));
    }

    @PostMapping("/feedback")
    public ResponseEntity<ApiResponse<Void>> submitFeedback(@RequestBody TemplateFeedbackRequestDTO request) {
        templateService.submitFeedback(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(null, "Template feedback submitted"));
    }

    @GetMapping("/{templateId}/feedback")
    public ResponseEntity<ApiResponse<List<TemplateFeedbackResponseDTO>>> getFeedback(@PathVariable String templateId) {
        return ResponseEntity.ok(ApiResponse.success(templateService.getFeedbackForTemplate(templateId)));
    }
}
