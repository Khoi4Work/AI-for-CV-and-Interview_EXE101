package fpt.su26.exe101.backend.modules.gallery.controller;

import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.service.TemplateService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<List<CVTemplateResponseDTO>> getAllTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @PostMapping("/feedback")
    public ResponseEntity<Void> submitFeedback(@RequestBody TemplateFeedbackRequestDTO request) {
        templateService.submitFeedback(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{templateId}/feedback")
    public ResponseEntity<List<TemplateFeedbackResponseDTO>> getFeedback(@PathVariable UUID templateId) {
        return ResponseEntity.ok(templateService.getFeedbackForTemplate(templateId));
    }
}
