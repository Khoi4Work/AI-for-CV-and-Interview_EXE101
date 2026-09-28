package fpt.su26.exe101.backend.modules.cv;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVOptimizationJob;
import fpt.su26.exe101.backend.modules.cv.repository.CVFeedbackRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVOptimizationJobRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVOptimizationLogRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.service.AIProviderService;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVImportModelResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVImportResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.request.CVOptimizationRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVOptimizationJobResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVOptimizationResultResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.cv.entity.enums.SkillLevel;
import fpt.su26.exe101.backend.modules.cv.mapper.CVFeedbackMapper;
import fpt.su26.exe101.backend.modules.cv.mapper.CVMapper;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.cv.service.impl.CVPipelineServiceImpl;
import org.springframework.beans.factory.ObjectProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CVPipelineServiceImplTest {

    @Mock
    private CVRepository cvRepository;
    @Mock
    private CVFeedbackRepository feedbackRepository;
    @Mock
    private CVOptimizationLogRepository logRepository;
    @Mock
    private CVOptimizationJobRepository jobRepository;
    @Mock
    private AIProviderService aiProvider;
    @Mock
    private CVMapper cvMapper;
    @Mock
    private GalleryService galleryService;
    @Mock
    private CVFeedbackMapper feedbackMapper;
    @Mock
    private ObjectProvider<CVPipelineServiceImpl> selfProvider;

    @InjectMocks
    private CVPipelineServiceImpl cvPipelineServiceImpl;

    private Gallery mockGallery;
    private CV mockCv;
    private JobDescription mockJd;

    @BeforeEach
    void setUp() {
        UUID accountId = UUID.randomUUID();
        mockGallery = Gallery.builder().accountId(accountId).build();
        mockGallery.setId(UUID.randomUUID());

        mockCv = CV.builder()
                .name("Test CV")
                .content(validCVContent())
                .gallery(mockGallery)
                .build();
        mockCv.setId(UUID.randomUUID());

        lenient().when(selfProvider.getObject()).thenReturn(cvPipelineServiceImpl);

        mockJd = JobDescription.builder()
                .content("JD content")
                .build();
        mockJd.setId(UUID.randomUUID());

    }

    @Test
    void startOptimization_HappyPath_ShouldDeductQuotaAndReturnJob() {
        UUID cvId = mockCv.getId();
        CVOptimizationRequestDTO request = CVOptimizationRequestDTO.builder()
                .jdId(mockJd.getId())
                .build();

        when(cvRepository.findById(cvId)).thenReturn(Optional.of(mockCv));
        when(galleryService.findJobDescription(mockJd.getId(), mockGallery)).thenReturn(mockJd);
        lenient().when(jobRepository.save(any(CVOptimizationJob.class))).thenAnswer(i -> {
            CVOptimizationJob job = i.getArgument(0);
            lenient().when(jobRepository.findByJobId(job.getJobId())).thenReturn(Optional.of(job));
            return job;
        });
        lenient().when(aiProvider.optimizeCV(any(), anyString())).thenReturn(CompletableFuture.completedFuture(
                CVOptimizationResultResponseDTO.builder()
                        .optimizedContent(optimizedCVContent())
                        .improvementSummary("Summary")
                        .predictedScore(90)
                        .build()
        ));

        CVOptimizationJobResponseDTO response = cvPipelineServiceImpl.startOptimization(cvId, request, mockGallery);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        verify(galleryService).consumeCvQuota(mockGallery.getAccountId());
        verify(galleryService).findJobDescription(mockJd.getId(), mockGallery);
        verify(jobRepository, atLeastOnce()).save(any(CVOptimizationJob.class));
    }

    @Test
    void startOptimization_NoQuota_ShouldThrowQuotaExceededException() {
        UUID cvId = mockCv.getId();
        CVOptimizationRequestDTO request = CVOptimizationRequestDTO.builder()
                .jdId(mockJd.getId())
                .build();

        when(cvRepository.findById(cvId)).thenReturn(Optional.of(mockCv));
        doThrow(new ApiException(ErrorCode.QUOTA_EXCEEDED))
                .when(galleryService).consumeCvQuota(mockGallery.getAccountId());

        ApiException exception = assertThrows(ApiException.class,
            () -> cvPipelineServiceImpl.startOptimization(cvId, request, mockGallery));

        assertEquals(ErrorCode.QUOTA_EXCEEDED, exception.getErrorCode());
        verify(jobRepository, never()).save(any());
        verify(galleryService).consumeCvQuota(mockGallery.getAccountId());
    }

    @Test
    void processOptimization_ShouldHandleJdIdLookup() {
        String jobId = "test-job-id";
        CVOptimizationJob job = CVOptimizationJob.builder()
                .jobId(jobId)
                .cvId(mockCv.getId())
                .status("PENDING")
                .build();

        // Test Case: jdId is provided, jdText is null
        CVOptimizationRequestDTO request = CVOptimizationRequestDTO.builder()
                .jdId(mockJd.getId())
                .jdText(null)
                .build();

        when(jobRepository.findByJobId(jobId)).thenReturn(Optional.of(job));
        when(galleryService.findJobDescription(mockJd.getId(), mockGallery)).thenReturn(mockJd);

        CVOptimizationResultResponseDTO aiResult = CVOptimizationResultResponseDTO.builder()
                .optimizedContent(optimizedCVContent())
                .improvementSummary("Summary")
                .predictedScore(90)
                .build();
        when(aiProvider.optimizeCV(any(), anyString())).thenReturn(CompletableFuture.completedFuture(aiResult));

        cvPipelineServiceImpl.processOptimization(jobId, mockCv, request);

        assertEquals("COMPLETED", job.getStatus());
        verify(galleryService).findJobDescription(mockJd.getId(), mockGallery);
    }

    @Test
    void processOptimization_ShouldFail_WhenJdNotFound() {
        String jobId = "test-job-id";
        CVOptimizationJob job = CVOptimizationJob.builder()
                .jobId(jobId)
                .cvId(mockCv.getId())
                .status("PENDING")
                .build();

        CVOptimizationRequestDTO request = CVOptimizationRequestDTO.builder()
                .jdId(UUID.randomUUID()) // Non-existent ID
                .jdText(null)
                .build();

        when(jobRepository.findByJobId(jobId)).thenReturn(Optional.of(job));
        when(galleryService.findJobDescription(any(), eq(mockGallery)))
                .thenThrow(new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "JD not found"));

        cvPipelineServiceImpl.processOptimization(jobId, mockCv, request);

        assertEquals("FAILED", job.getStatus());
        assertTrue(job.getErrorMessage().contains("JD not found"));
    }

    @Test
    void importCV_ValidStructuredCV_ShouldSaveAndReturnTypedContent() {
        byte[] fileContent = "pdf bytes".getBytes();
        CVContent extractedData = validCVContent();
        when(cvRepository.findByGalleryIdAndSourceHash(eq(mockGallery.getId()), anyString()))
                .thenReturn(Optional.empty());
        when(aiProvider.parseCVFile(fileContent, "application/pdf"))
                .thenReturn(CVImportModelResponseDTO.builder()
                        .isCV(true)
                        .extractedData(extractedData)
                        .build());

        CVImportResponseDTO response = cvPipelineServiceImpl.importCV(
                fileContent, "application/pdf", "resume.pdf", mockGallery);

        assertNotNull(response);
        assertEquals(extractedData, response.getExtractedData());
        assertFalse(response.isDuplicate());
        ArgumentCaptor<CV> savedCV = ArgumentCaptor.forClass(CV.class);
        verify(cvRepository).save(savedCV.capture());
        assertEquals(extractedData, savedCV.getValue().getContent());
        assertEquals("resume.pdf", savedCV.getValue().getName());
    }

    @Test
    void importCV_ContentWithoutEnoughCVSections_ShouldRejectAndNotSave() {
        byte[] fileContent = "not enough CV content".getBytes();
        CVContent incompleteContent = CVContent.builder()
                .summary("Only one populated section")
                .build();
        when(cvRepository.findByGalleryIdAndSourceHash(eq(mockGallery.getId()), anyString()))
                .thenReturn(Optional.empty());
        when(aiProvider.parseCVFile(fileContent, "application/pdf"))
                .thenReturn(CVImportModelResponseDTO.builder()
                        .isCV(true)
                        .extractedData(incompleteContent)
                        .build());

        ApiException exception = assertThrows(ApiException.class, () ->
                cvPipelineServiceImpl.importCV(fileContent, "application/pdf", "resume.pdf", mockGallery));

        assertEquals(ErrorCode.INVALID_INPUT, exception.getErrorCode());
        verify(cvRepository, never()).save(any(CV.class));
    }

    private CVContent validCVContent() {
        return CVContent.builder()
                .personalInfo(CVContent.PersonalInfo.builder()
                        .name("Test Candidate")
                        .email("candidate@example.com")
                        .build())
                .experiences(List.of(CVContent.Experience.builder()
                        .company("Example Company")
                        .role("Backend Developer")
                        .build()))
                .skills(List.of(CVContent.Skill.builder()
                        .name("Java")
                        .level(SkillLevel.ADVANCED)
                        .category("backend")
                        .build()))
                .build();
    }

    private CVContent optimizedCVContent() {
        return CVContent.builder()
                .personalInfo(CVContent.PersonalInfo.builder()
                        .name("Test Candidate")
                        .email("candidate@example.com")
                        .build())
                .summary("Optimized backend developer CV")
                .experiences(List.of(CVContent.Experience.builder()
                        .company("Example Company")
                        .role("Backend Developer")
                        .build()))
                .skills(List.of(CVContent.Skill.builder()
                        .name("Java")
                        .level(SkillLevel.ADVANCED)
                        .category("backend")
                        .build()))
                .build();
    }
}
