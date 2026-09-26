package fpt.su26.exe101.backend.modules.gallery;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.dto.*;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.repository.*;
import fpt.su26.exe101.backend.modules.gallery.service.*;
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
public class CVPipelineServiceTest {

    @Mock
    private CVRepository cvRepository;
    @Mock
    private JobDescriptionRepository jdRepository;
    @Mock
    private CVFeedbackRepository feedbackRepository;
    @Mock
    private CVOptimizationLogRepository logRepository;
    @Mock
    private CVOptimizationJobRepository jobRepository;
    @Mock
    private UserUsageQuotaRepository quotaRepository;
    @Mock
    private AIProviderService aiProvider;

    @InjectMocks
    private CVPipelineService cvPipelineService;

    private Gallery mockGallery;
    private CV mockCv;
    private JobDescription mockJd;
    private UserUsageQuota mockQuota;

    @BeforeEach
    void setUp() {
        UUID accountId = UUID.randomUUID();
        mockGallery = Gallery.builder().accountId(accountId).build();
        mockGallery.setId(UUID.randomUUID());

        mockCv = CV.builder()
                .name("Test CV")
                .content(Map.of("text", "original content"))
                .gallery(mockGallery)
                .build();
        mockCv.setId(UUID.randomUUID());

        mockJd = JobDescription.builder()
                .content("JD content")
                .build();
        mockJd.setId(UUID.randomUUID());

        mockQuota = UserUsageQuota.builder()
                .accountId(accountId)
                .remainingCvCnt(5)
                .build();
    }

    @Test
    void startOptimization_HappyPath_ShouldDeductQuotaAndReturnJob() {
        UUID cvId = mockCv.getId();
        CVOptimizationRequest request = CVOptimizationRequest.builder()
                .jdId(mockJd.getId())
                .build();

        when(cvRepository.findById(cvId)).thenReturn(Optional.of(mockCv));
        when(quotaRepository.findByAccountId(mockGallery.getAccountId())).thenReturn(Optional.of(mockQuota));
        lenient().when(jobRepository.save(any(CVOptimizationJob.class))).thenAnswer(i -> {
            CVOptimizationJob job = i.getArgument(0);
            lenient().when(jobRepository.findByJobId(job.getJobId())).thenReturn(Optional.of(job));
            return job;
        });
        lenient().when(jdRepository.findById(mockJd.getId())).thenReturn(Optional.of(mockJd));
        lenient().when(aiProvider.optimizeCV(any(), anyString())).thenReturn(CompletableFuture.completedFuture(
                CVOptimizationResultResponse.builder()
                        .optimizedContent(Map.of("text", "optimized"))
                        .improvementSummary("Summary")
                        .predictedScore(90)
                        .build()
        ));

        CVOptimizationJobResponse response = cvPipelineService.startOptimization(cvId, request, mockGallery);

        assertNotNull(response);
        assertEquals("PENDING", response.getStatus());
        assertEquals(4, mockQuota.getRemainingCvCnt()); // Verify quota deduction
        verify(quotaRepository).save(mockQuota);
        verify(jobRepository, atLeastOnce()).save(any(CVOptimizationJob.class));
    }

    @Test
    void startOptimization_NoQuota_ShouldThrowQuotaExceededException() {
        UUID cvId = mockCv.getId();
        CVOptimizationRequest request = CVOptimizationRequest.builder()
                .jdId(mockJd.getId())
                .build();

        mockQuota.setRemainingCvCnt(0);

        when(cvRepository.findById(cvId)).thenReturn(Optional.of(mockCv));
        when(quotaRepository.findByAccountId(mockGallery.getAccountId())).thenReturn(Optional.of(mockQuota));

        ApiException exception = assertThrows(ApiException.class,
            () -> cvPipelineService.startOptimization(cvId, request, mockGallery));

        assertEquals(ErrorCode.QUOTA_EXCEEDED, exception.getErrorCode());
        verify(jobRepository, never()).save(any());
        verify(quotaRepository, never()).save(any());
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
        CVOptimizationRequest request = CVOptimizationRequest.builder()
                .jdId(mockJd.getId())
                .jdText(null)
                .build();

        when(jobRepository.findByJobId(jobId)).thenReturn(Optional.of(job));
        when(jdRepository.findById(mockJd.getId())).thenReturn(Optional.of(mockJd));

        CVOptimizationResultResponse aiResult = CVOptimizationResultResponse.builder()
                .optimizedContent(Map.of("text", "optimized content"))
                .improvementSummary("Summary")
                .predictedScore(90)
                .build();
        when(aiProvider.optimizeCV(any(), anyString())).thenReturn(CompletableFuture.completedFuture(aiResult));

        cvPipelineService.processOptimization(jobId, mockCv, request);

        assertEquals("COMPLETED", job.getStatus());
        verify(jdRepository).findById(mockJd.getId());
    }

    @Test
    void processOptimization_ShouldFail_WhenJdNotFound() {
        String jobId = "test-job-id";
        CVOptimizationJob job = CVOptimizationJob.builder()
                .jobId(jobId)
                .cvId(mockCv.getId())
                .status("PENDING")
                .build();

        CVOptimizationRequest request = CVOptimizationRequest.builder()
                .jdId(UUID.randomUUID()) // Non-existent ID
                .jdText(null)
                .build();

        when(jobRepository.findByJobId(jobId)).thenReturn(Optional.of(job));
        when(jdRepository.findById(any())).thenReturn(Optional.empty());

        cvPipelineService.processOptimization(jobId, mockCv, request);

        assertEquals("FAILED", job.getStatus());
        assertTrue(job.getErrorMessage().contains("JD not found"));
    }
}
