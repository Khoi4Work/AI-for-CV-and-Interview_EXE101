package fpt.su26.exe101.backend.modules.cv.controller;

import fpt.su26.exe101.backend.modules.cv.dto.request.TemplateFeedbackRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.TemplateFeedbackResponseDTO;
import fpt.su26.exe101.backend.modules.cv.service.TemplateService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class TemplateControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TemplateService templateService;

    @Test
    @WithMockUser(username = "test@example.com")
    void getAllTemplates_HappyPath_ShouldReturnTemplates() throws Exception {
        CVTemplateResponseDTO template = CVTemplateResponseDTO.builder()
                .id("template-1")
                .name("Modern Professional")
                .category("Professional")
                .previewImage("https://example.com/modern-professional.png")
                .build();

        when(templateService.getAllTemplates()).thenReturn(Collections.singletonList(template));

        mockMvc.perform(get("/api/templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result[0].name").value("Modern Professional"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void submitFeedback_HappyPath_ShouldReturnOk() throws Exception {
        TemplateFeedbackRequestDTO request = TemplateFeedbackRequestDTO.builder()
                .templateId("template-1")
                .rating(5)
                .comment("Great template!")
                .build();

        doNothing().when(templateService).submitFeedback(any(TemplateFeedbackRequestDTO.class));

        mockMvc.perform(post("/api/templates/feedback")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"templateId\":\"" + request.getTemplateId() + "\",\"rating\":5,\"comment\":\"Great template!\"}"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getFeedback_HappyPath_ShouldReturnFeedback() throws Exception {
        String templateId = "template-1";
        TemplateFeedbackResponseDTO feedback = TemplateFeedbackResponseDTO.builder()
                .id(UUID.randomUUID())
                .rating(5)
                .comment("Great template!")
                .build();

        when(templateService.getFeedbackForTemplate(templateId)).thenReturn(Collections.singletonList(feedback));

        mockMvc.perform(get("/api/templates/" + templateId + "/feedback"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result[0].comment").value("Great template!"));
    }
}
