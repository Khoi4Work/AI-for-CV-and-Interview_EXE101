package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Result;
import java.util.List;
import fpt.su26.exe101.backend.modules.cv.entity.CVAnalysis;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.repository.CVAlternativeRecommendationJobRepository;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisQuotaStatus;
import fpt.su26.exe101.backend.modules.cv.repository.CVAnalysisRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisQuotaService;
import fpt.su26.exe101.backend.modules.cv.service.CVEvidenceService;
import fpt.su26.exe101.backend.modules.cv.service.CVScoringService;
import fpt.su26.exe101.backend.modules.gallery.exception.JobDescriptionRequirementsPendingException;
import fpt.su26.exe101.backend.modules.gallery.repository.GalleryRepository;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Consumer;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CVAnalysisWorkerTest {
    @Mock CVAnalysisRepository analyses;
    @Mock CVAlternativeRecommendationJobRepository jobs;
    @Mock CVRepository cvs;
    @Mock JobDescriptionRepository jds;
    @Mock GalleryRepository galleries;
    @Mock CVAnalysisServiceImpl service;
    @Mock CVEvidenceService evidence;
    @Mock CVScoringService scoring;
    @Mock CVAnalysisQuotaService quota;
    @Mock TransactionTemplate transaction;
    @InjectMocks CVAnalysisWorkerImpl worker;
    CVAnalysis analysis;

    @BeforeEach void setup() {
        analysis=new CVAnalysis();analysis.setId(UUID.randomUUID());analysis.setCvId(UUID.randomUUID());analysis.setAccountId(UUID.randomUUID());
        when(analyses.lock(analysis.getId())).thenReturn(Optional.of(analysis));
        when(transaction.execute(any())).thenAnswer(invocation -> ((TransactionCallback<?>)invocation.getArgument(0)).doInTransaction(mock(TransactionStatus.class)));
        lenient().doAnswer(invocation -> {
            Consumer<TransactionStatus> callback=invocation.getArgument(0);
            callback.accept(mock(TransactionStatus.class));return null;
        }).when(transaction).executeWithoutResult(any());
    }
    private void reserveQuota() {
        analysis.setQuotaStatus(AnalysisQuotaStatus.RESERVED);
        when(cvs.existsById(analysis.getCvId())).thenReturn(true);
    }
    @Test void expectedEvidenceFailureRefundsAndStoresTypedTerminal() {
        reserveQuota();
        when(evidence.extract(any())).thenThrow(new CVAnalysisValidationException("Quote absent"));
        worker.process(analysis.getId());
        assertEquals(AnalysisStatus.INSUFFICIENT_EVIDENCE,analysis.getStatus());assertEquals(AnalysisQuotaStatus.REFUNDED,analysis.getQuotaStatus());
        assertEquals(1,analysis.getAttemptHistory().size());verify(quota).refund(analysis.getAccountId(),analysis.getCvId());
    }
    @Test void repeatedProcessingAfterFailureCannotRefundAgain() {
        reserveQuota();
        when(evidence.extract(any())).thenThrow(new CVAnalysisValidationException("Quote absent"));
        worker.process(analysis.getId());worker.process(analysis.getId());
        assertEquals(AnalysisQuotaStatus.REFUNDED,analysis.getQuotaStatus());
        verify(quota).refund(analysis.getAccountId(),analysis.getCvId());
    }
    @Test void successConsumesReservationWithoutRefund() {
        analysis.setQuotaStatus(AnalysisQuotaStatus.RESERVED);
        when(evidence.extract(any())).thenReturn(new CVEvidenceService.Output(null,"fake","fake",1));
        when(scoring.score(any(),any())).thenReturn(new Result(80,List.of(),List.of(),List.of(),List.of(),"summary"));
        worker.process(analysis.getId());worker.process(analysis.getId());
        assertEquals(AnalysisQuotaStatus.CONSUMED,analysis.getQuotaStatus());assertEquals(AnalysisStatus.COMPLETED,analysis.getStatus());
        verifyNoInteractions(quota);
    }
    @Test void internalFailureDoesNotRefundUserQuota() {
        analysis.setInternalAnalysis(true);
        when(evidence.extract(any())).thenThrow(new CVAnalysisValidationException("Quote absent"));
        worker.process(analysis.getId());
        assertEquals(AnalysisQuotaStatus.NOT_CHARGED,analysis.getQuotaStatus());verifyNoInteractions(quota);
    }
    @Test void unrelatedIllegalArgumentIsSystemFailureRatherThanMissingEvidence() {
        reserveQuota();
        when(evidence.extract(any())).thenThrow(new IllegalArgumentException("Provider configuration bug"));
        worker.process(analysis.getId());
        assertEquals(AnalysisStatus.FAILED,analysis.getStatus());assertEquals(AnalysisQuotaStatus.REFUNDED,analysis.getQuotaStatus());
    }
    @Test void anotherRequirementWorkerKeepsAnalysisQueuedWithoutRefundOrAttemptUse() {
        when(evidence.extract(any())).thenThrow(new JobDescriptionRequirementsPendingException());
        worker.process(analysis.getId());
        assertEquals(AnalysisStatus.PENDING,analysis.getStatus());assertEquals(0,analysis.getAttempt());
        assertEquals("WAITING_JD_REQUIREMENTS",analysis.getPhase());verifyNoInteractions(quota,scoring);
    }
    @Test void lateFailureCannotOverwriteAlreadyTerminalState() {
        when(evidence.extract(any())).thenAnswer(invocation -> {analysis.setStatus(AnalysisStatus.COMPLETED);analysis.setScore(80);throw new CVAnalysisValidationException("Late response");});
        worker.process(analysis.getId());
        assertEquals(AnalysisStatus.COMPLETED,analysis.getStatus());assertEquals(80,analysis.getScore());
        verifyNoInteractions(quota);
    }
}
