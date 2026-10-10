package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;

import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Alternative;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Attempt;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Result;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;
import fpt.su26.exe101.backend.modules.cv.entity.CVAnalysis;
import fpt.su26.exe101.backend.modules.cv.entity.CVAlternativeRecommendationJob;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisQuotaStatus;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.repository.CVAlternativeRecommendationJobRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVAnalysisRepository;
import fpt.su26.exe101.backend.modules.cv.repository.CVRepository;
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisQuotaService;
import fpt.su26.exe101.backend.modules.cv.service.CVAnalysisWorker;
import fpt.su26.exe101.backend.modules.cv.service.CVEvidenceService;
import fpt.su26.exe101.backend.modules.cv.service.CVScoringService;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.exception.JobDescriptionRequirementsPendingException;
import fpt.su26.exe101.backend.modules.gallery.repository.GalleryRepository;
import fpt.su26.exe101.backend.modules.gallery.repository.JobDescriptionRepository;
import jakarta.annotation.PreDestroy;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Persistent queue: claim and finish in short transactions; all provider work is outside transactions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CVAnalysisWorkerImpl implements CVAnalysisWorker {
    private final CVAnalysisRepository analyses;
    private final CVAlternativeRecommendationJobRepository jobs;
    private final CVRepository cvs;
    private final JobDescriptionRepository jds;
    private final GalleryRepository galleries;
    private final CVAnalysisServiceImpl service;
    private final CVEvidenceService evidence;
    private final CVScoringService scoring;
    private final CVAnalysisQuotaService quota;
    private final TransactionTemplate transaction;
    @Value("${cv.analysis.enabled:false}")
    private boolean enabled;
    private final ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2,
            2,
            0,
            TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(8),
            runnable -> {
                Thread worker = new Thread(runnable, "cv-analysis");
                worker.setDaemon(true);
                return worker;
            },
            new ThreadPoolExecutor.AbortPolicy());
    private final Set<UUID> submitted = ConcurrentHashMap.newKeySet();

    @Scheduled(fixedDelayString = "${cv.analysis.worker-delay-ms:3000}")
    public void poll() {
        if (!enabled) {
            return;
        }

        List<CVAnalysis> staleAnalyses = analyses.findByStatusAndLeaseUntilBefore(
                AnalysisStatus.PROCESSING,
                LocalDateTime.now());
        for (CVAnalysis stale : staleAnalyses) {
            finish(
                    stale.getId(),
                    stale.getAttempt(),
                    null,
                    null,
                    "Tác vụ quá thời gian xử lý. Hãy thử lại.",
                    AnalysisStatus.FAILED);
        }

        List<CVAnalysis> pendingAnalyses = analyses.findTop20ByStatusOrderByCreatedAtAsc(
                AnalysisStatus.PENDING);
        for (CVAnalysis analysis : pendingAnalyses) {
            if (!submitted.add(analysis.getId())) {
                continue;
            }

            try {
                executor.execute(() -> {
                    try {
                        process(analysis.getId());
                    } finally {
                        submitted.remove(analysis.getId());
                    }
                });
            } catch (RejectedExecutionException exception) {
                submitted.remove(analysis.getId());
                break;
            }
        }

        for (CVAlternativeRecommendationJob job : jobs.findTop10ByStatusOrderByCreatedAtAsc("PENDING")) {
            try {
                advanceAlternatives(job.getId());
            } catch (RuntimeException failure) {
                log.warn(
                        "[CV ALTERNATIVES] Failed | jobId={} | errorType={}",
                        job.getId(),
                        failure.getClass().getSimpleName());
                transaction.executeWithoutResult(tx -> jobs.lock(job.getId()).ifPresent(current -> {
                    if ("PENDING".equals(current.getStatus())) {
                        current.setStatus("FAILED");
                    }
                }));
            }
        }
    }

    @Override
    public void process(UUID id) {
        CVAnalysis claimed = transaction.execute(tx -> {
            CVAnalysis analysis = analyses.lock(id).orElse(null);
            if (analysis == null || analysis.getStatus() != AnalysisStatus.PENDING) {
                return null;
            }

            analysis.setStatus(AnalysisStatus.PROCESSING);
            analysis.setPhase("CHECKING_EVIDENCE");
            analysis.setAttempt(analysis.getAttempt() + 1);
            analysis.setLeaseUntil(LocalDateTime.now().plusMinutes(5));
            return analysis;
        });
        if (claimed == null) {
            return;
        }

        long start = System.nanoTime();
        try {
            CVEvidenceService.Output output = evidence.extract(claimed.getSnapshot());
            Result result = scoring.score(claimed.getSnapshot(), output.extraction());
            finish(id, claimed.getAttempt(), result, output, null, AnalysisStatus.COMPLETED);
        } catch (JobDescriptionRequirementsPendingException e) {
            transaction.executeWithoutResult(tx -> {
                CVAnalysis waiting = analyses.lock(id)
                        .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
                if (waiting.getStatus() == AnalysisStatus.PROCESSING
                        && waiting.getAttempt() == claimed.getAttempt()) {
                    waiting.setStatus(AnalysisStatus.PENDING);
                    waiting.setPhase("WAITING_JD_REQUIREMENTS");
                    waiting.setLeaseUntil(null);
                    waiting.setAttempt(Math.max(0, waiting.getAttempt() - 1));
                }
            });
        } catch (CVAnalysisValidationException e) {
            finish(id, claimed.getAttempt(), null, null, "Không đủ minh chứng hợp lệ để đánh giá. Hãy kiểm tra CV/JD.", AnalysisStatus.INSUFFICIENT_EVIDENCE);
        } catch (RuntimeException e) {
            log.warn("[CV ANALYSIS] Failed | analysisId={} | errorType={}", id, e.getClass().getSimpleName());
            finish(id, claimed.getAttempt(), null, null, "Không thể hoàn tất đánh giá. Bạn có thể thử lại.", AnalysisStatus.FAILED);
        } finally {
            log.info(
                    "[CV ANALYSIS] Attempt ended | analysisId={} | attempt={} | durationMs={}",
                    id,
                    claimed.getAttempt(),
                    (System.nanoTime() - start) / 1_000_000);
        }
    }

    private void finish(UUID id, int attempt, Result result, CVEvidenceService.Output output, String error, AnalysisStatus status) {
        transaction.executeWithoutResult(tx -> {
            CVAnalysis analysis = analyses.lock(id).orElse(null);
            if (analysis == null
                    || analysis.getStatus() != AnalysisStatus.PROCESSING
                    || analysis.getAttempt() != attempt) {
                return;
            }

            analysis.setStatus(status);
            analysis.setPhase(status.name());
            analysis.setError(error);
            analysis.setLeaseUntil(null);
            if (result != null) {
                analysis.setResult(result);
                analysis.setScore(result.score());
            }
            if (output != null) {
                analysis.setProvider(output.provider());
                analysis.setModel(output.model());
                analysis.setModelCalls(output.calls());
            }
            analysis.getAttemptHistory().add(new Attempt(
                    attempt,
                    status,
                    error,
                    analysis.getProvider(),
                    analysis.getModel(),
                    analysis.getModelCalls(),
                    LocalDateTime.now().toString()));

            if (analysis.getQuotaStatus() == AnalysisQuotaStatus.RESERVED) {
                if (status == AnalysisStatus.COMPLETED) {
                    analysis.setQuotaStatus(AnalysisQuotaStatus.CONSUMED);
                } else {
                    if (cvs.existsById(analysis.getCvId())) {
                        quota.refund(analysis.getAccountId(), analysis.getCvId());
                    }
                    analysis.setQuotaStatus(AnalysisQuotaStatus.REFUNDED);
                }
            }
        });
    }

    private void advanceAlternatives(UUID jobId) {
        transaction.executeWithoutResult(tx -> {
            CVAlternativeRecommendationJob initial = jobs.findById(jobId).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
            CVAnalysis baseline = analyses.findById(initial.getAnalysisId()).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
            galleries.lock(baseline.getGalleryId()).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
            CVAlternativeRecommendationJob job = jobs.lock(jobId).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
            if (!"PENDING".equals(job.getStatus())) return;
            CVAnalysis parent = analyses.findById(job.getAnalysisId()).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
            List<Alternative> found = new ArrayList<>();
            int failed = 0;
            boolean pending = false;
            if (job.getAnalysisIds().isEmpty()) {
                List<UUID> childIds = new ArrayList<>();
                for (UUID candidateId : job.getCandidateIds()) {
                    JobDescription jd = jds.findById(candidateId).orElse(null);
                    if (jd == null || !jd.isActive()) {
                        continue;
                    }
                    Snapshot candidate = service.snapshot(parent.getSnapshot(), jd);
                    if (candidate.roleCodes().isEmpty()
                            || !Collections.disjoint(candidate.roleCodes(), parent.getSnapshot().roleCodes())) {
                        continue;
                    }
                    String key = service.cacheKey(candidate);
                    CVAnalysis child = analyses.findByGalleryIdAndCacheKey(parent.getGalleryId(), key)
                            .orElseGet(() -> service.create(candidate, parent.getGalleryId(), parent.getAccountId(), key, true));
                    childIds.add(child.getId());
                }
                job.setAnalysisIds(childIds);
            }
            failed += job.getCandidateIds().size() - job.getAnalysisIds().size();
            for (UUID childId : job.getAnalysisIds()) {
                CVAnalysis child = analyses.findById(childId).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
                if (child.getStatus() == AnalysisStatus.PENDING || child.getStatus() == AnalysisStatus.PROCESSING)
                    pending = true;
                else if (child.getStatus() != AnalysisStatus.COMPLETED) failed++;
                else if (child.getScore() > parent.getScore()) found.add(new Alternative(child.getId(), child.getJdId(),
                        child.getSnapshot().jdTitle(), child.getSnapshot().companyName(), child.getSnapshot().source(),
                        child.getScore(), "Có nhiều minh chứng đáp ứng yêu cầu JD này hơn theo cùng rubric: "
                        + String.join(", ", child.getResult().evidencedSkills().stream().limit(3).toList())));
            }
            found.sort(Comparator.comparingInt(Alternative::score).reversed());
            Set<String> roles = new HashSet<>();
            job.setItems(found.stream().filter(item -> {
                CVAnalysis child = analyses.findById(item.analysisId()).orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND));
                if (!Collections.disjoint(roles, child.getSnapshot().roleCodes())) return false;
                roles.addAll(child.getSnapshot().roleCodes());
                return true;
            }).limit(2).toList());
            job.setFailedCount(failed);
            if (!pending) job.setStatus(failed == job.getCandidateIds().size() && failed > 0 ? "FAILED" : "COMPLETED");
        });
    }

    @PreDestroy
    public void close() {
        executor.shutdownNow();
    }
}
