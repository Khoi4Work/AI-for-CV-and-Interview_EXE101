package fpt.su26.exe101.backend.modules.gallery.controller;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.repository.*;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultActions;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
public class GalleryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GalleryService galleryService;

    @MockBean
    private AccountRepository accountRepository;

    @BeforeEach
    void setUp() {
        // Reset mocks if needed
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getAssets_HappyPath_ShouldReturnAssets() throws Exception {
        GalleryAssetsResponseDTO response = GalleryAssetsResponseDTO.builder()
                .cvs(Collections.emptyList())
                .jds(Collections.emptyList())
                .build();

        when(galleryService.getGalleryAssets()).thenReturn(response);

        mockMvc.perform(get("/api/gallery/assets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cvs").isArray())
                .andExpect(jsonPath("$.jds").isArray());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void createJD_HappyPath_ShouldReturnCreatedJD() throws Exception {
        JDCreateRequestDTO request = JDCreateRequestDTO.builder()
                .title("Software Engineer")
                .content("Develop awesome things")
                .companyName("Tech Corp")
                .build();

        JDResponseDTO response = JDResponseDTO.builder()
                .id(UUID.randomUUID())
                .title("Software Engineer")
                .content("Develop awesome things")
                .companyName("Tech Corp")
                .build();

        when(galleryService.createJobDescription(any(JDCreateRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/gallery/jd")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Software Engineer\",\"content\":\"Develop awesome things\",\"companyName\":\"Tech Corp\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Software Engineer"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void updateJD_HappyPath_ShouldReturnUpdatedJD() throws Exception {
        UUID jdId = UUID.randomUUID();
        JDUpdateRequestDTO request = JDUpdateRequestDTO.builder()
                .title("Senior Software Engineer")
                .content("Develop even more awesome things")
                .companyName("Tech Corp")
                .build();

        JDResponseDTO response = JDResponseDTO.builder()
                .id(jdId)
                .title("Senior Software Engineer")
                .content("Develop even more awesome things")
                .companyName("Tech Corp")
                .build();

        when(galleryService.updateJobDescription(eq(jdId), any(JDUpdateRequestDTO.class))).thenReturn(response);

        mockMvc.perform(put("/api/gallery/jd/" + jdId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"title\":\"Senior Software Engineer\",\"content\":\"Develop even more awesome things\",\"companyName\":\"Tech Corp\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Senior Software Engineer"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteJD_HappyPath_ShouldReturnNoContent() throws Exception {
        UUID jdId = UUID.randomUUID();
        doNothing().when(galleryService).deleteJobDescription(jdId);

        mockMvc.perform(delete("/api/gallery/jd/" + jdId))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteCV_HappyPath_ShouldReturnNoContent() throws Exception {
        UUID cvId = UUID.randomUUID();
        doNothing().when(galleryService).deleteCV(cvId);

        mockMvc.perform(delete("/api/gallery/cv/" + cvId))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getInterviewHistory_HappyPath_ShouldReturnHistory() throws Exception {
        InterviewSessionResponseDTO session = InterviewSessionResponseDTO.builder()
                .id(UUID.randomUUID())
                .sessionDate(java.time.LocalDateTime.now())
                .overallScore(85)
                .build();

        List<InterviewSessionResponseDTO> history = Collections.singletonList(session);
        when(galleryService.getInterviewHistory()).thenReturn(history);

        mockMvc.perform(get("/api/gallery/interviews"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].overallScore").value(85));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void getInterviewAnswers_HappyPath_ShouldReturnAnswers() throws Exception {
        UUID sessionId = UUID.randomUUID();
        InterviewAnswerResponseDTO answer = InterviewAnswerResponseDTO.builder()
                .id(UUID.randomUUID())
                .answerText("Java is a language")
                .build();

        List<InterviewAnswerResponseDTO> answers = Collections.singletonList(answer);
        when(galleryService.getInterviewAnswers(sessionId)).thenReturn(answers);

        mockMvc.perform(get("/api/gallery/interviews/" + sessionId + "/answers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].answerText").value("Java is a language"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteCV_NotFound_ShouldThrowResourceNotFound() throws Exception {
        UUID cvId = UUID.randomUUID();
        doThrow(new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "CV not found"))
                .when(galleryService).deleteCV(cvId);

        mockMvc.perform(delete("/api/gallery/cv/" + cvId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void deleteCV_Forbidden_ShouldThrowForbiddenAction() throws Exception {
        UUID cvId = UUID.randomUUID();
        doThrow(new ApiException(ErrorCode.FORBIDDEN_ACTION))
                .when(galleryService).deleteCV(cvId);

        mockMvc.perform(delete("/api/gallery/cv/" + cvId))
                .andExpect(status().isForbidden());
    }
}
