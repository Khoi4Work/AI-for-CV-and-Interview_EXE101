package fpt.su26.exe101.backend.modules.cv.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementAssessment;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;

/** Versioned internal analysis and JSONB persistence contract, separate from HTTP request/response DTOs. */
public final class AnalysisContract {
    private AnalysisContract() {}
    public static final String RUBRIC = "rubric-v1";
    public static final String EXTRACTION = "extraction-v1";
    public static final String CONFIG = "evaluation-v1";
    public record Snapshot(UUID cvId, UUID jdId, String cvName, String jdTitle, String companyName,
                           String source, String sourceUrl, String referenceDate, String verification,
                           CVContent cv, String cvText, String jdText, Set<String> roleCodes,
                           boolean truncated) {}
    public record Quote(String anchor, String text) {}
    public record Evidence(String requirementId, RequirementGroup group, String description, boolean mandatory,
                           Quote jdEvidence, List<Quote> cvEvidence, RequirementAssessment assessment,
                           String reason, String suggestion) {}
    public record Extraction(List<Evidence> requirements) {}
    public record Contribution(Evidence evidence, BigDecimal points) {}
    public record Breakdown(RequirementGroup group, BigDecimal weight, BigDecimal attainment, BigDecimal points) {}
    public record Result(int score, List<Breakdown> breakdown, List<Contribution> contributions,
                         List<String> evidencedSkills, List<String> notEvidencedSkills, String summary) {}
    public record Alternative(UUID analysisId, UUID jdId, String title, String companyName,
                              String source, int score, String reason) {}
    public record Attempt(int number, AnalysisStatus status, String error, String provider, String model,
                          int calls, String finishedAt) {}
}
