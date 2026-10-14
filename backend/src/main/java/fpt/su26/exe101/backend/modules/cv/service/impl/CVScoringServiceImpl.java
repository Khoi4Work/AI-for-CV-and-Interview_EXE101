package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Breakdown;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Contribution;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Evidence;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Extraction;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Quote;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Result;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementAssessment;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.service.CVScoringService;
import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;

/**
 * Calculates the user-facing CV evaluation score from validated JD requirements and CV evidence.
 * Mandatory requirements count twice; each requirement group contributes according to WEIGHTS.
 * The method renormalizes group weights when a JD has no applicable requirements in a group.
 */
@Service
public class CVScoringServiceImpl implements CVScoringService {
    private static final MathContext MC = MathContext.DECIMAL128;
    // Rubric-v1 group weights. Applicable groups are normalized to sum to 100 for each evaluation.
    private static final Map<RequirementGroup, Integer> WEIGHTS = Map.of(
            RequirementGroup.SKILLS, 40,
            RequirementGroup.EXPERIENCE, 35,
            RequirementGroup.EDUCATION, 10,
            RequirementGroup.CLARITY, 15);
    /**
     * Scores MET as full attainment, PARTIAL as half attainment, and NOT_EVIDENCED as zero.
     * NOT_APPLICABLE requirements are excluded from their group's denominator. UNCERTAIN evidence
     * is rejected so the system never presents an ungrounded score as final.
     */
    @Override
    public Result score(Snapshot snapshot, Extraction extraction) {
        List<Evidence> evidence = new ArrayList<>(extraction.requirements());
        evidence.addAll(clarity(snapshot));
        Map<RequirementGroup, BigDecimal> denominators = new EnumMap<>(RequirementGroup.class);
        for (Evidence e : evidence) {
            if (e.assessment() == RequirementAssessment.UNCERTAIN) throw new CVAnalysisValidationException("Minh chứng chưa xác định.");
            if (e.assessment() != RequirementAssessment.NOT_APPLICABLE)
                denominators.merge(e.group(), weight(e), BigDecimal::add);
        }
        int applicable = denominators.keySet().stream().mapToInt(WEIGHTS::get).sum();
        if (applicable <= WEIGHTS.get(RequirementGroup.CLARITY)) throw new CVAnalysisValidationException("JD thiếu yêu cầu có thể đánh giá.");
        List<Contribution> contributions = new ArrayList<>();
        Map<RequirementGroup, BigDecimal> points = new EnumMap<>(RequirementGroup.class);
        for (Evidence e : evidence) {
            BigDecimal value = switch(e.assessment()) {
                case MET -> BigDecimal.ONE; case PARTIAL -> new BigDecimal("0.5");
                case NOT_EVIDENCED, NOT_APPLICABLE -> BigDecimal.ZERO;
                case UNCERTAIN -> throw new CVAnalysisValidationException("Minh chứng chưa xác định.");
            };
            BigDecimal point = e.assessment() == RequirementAssessment.NOT_APPLICABLE ? BigDecimal.ZERO :
                weight(e).multiply(value).divide(denominators.get(e.group()), MC)
                    .multiply(BigDecimal.valueOf(100L * WEIGHTS.get(e.group()))).divide(BigDecimal.valueOf(applicable), MC);
            points.merge(e.group(), point, BigDecimal::add);
            contributions.add(new Contribution(e, point));
        }
        List<Breakdown> breakdown = denominators.keySet().stream().map(group -> {
            BigDecimal adjustedWeight = BigDecimal.valueOf(100L * WEIGHTS.get(group)).divide(BigDecimal.valueOf(applicable), MC);
            return new Breakdown(group, adjustedWeight, points.get(group).divide(adjustedWeight, MC), points.get(group));
        }).toList();
        int score = points.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add).setScale(0, RoundingMode.HALF_UP).intValueExact();
        List<String> evidenced = evidence.stream().filter(e -> e.group() == RequirementGroup.SKILLS && e.assessment() == RequirementAssessment.MET)
            .map(Evidence::description).distinct().toList();
        List<String> missing = evidence.stream().filter(e -> e.group() == RequirementGroup.SKILLS && e.assessment() != RequirementAssessment.MET)
            .map(Evidence::description).distinct().toList();
        return new Result(score, breakdown, contributions, evidenced, missing,
            "Điểm được tính từ yêu cầu JD và minh chứng trong bản CV này theo rubric-v1. Chưa có minh chứng không có nghĩa là bạn chưa có năng lực.");
    }
    private BigDecimal weight(Evidence e) { return BigDecimal.valueOf(e.mandatory() ? 2 : 1); }
    private List<Evidence> clarity(Snapshot s) {
        CVContent cv = s.cv();
        String contact = cv.getPersonalInfo() == null ? "" : Stream.of(cv.getPersonalInfo().getEmail(),cv.getPersonalInfo().getPhone())
            .filter(this::text).filter(value->s.cvText().contains(value)).findFirst().orElse("");
        boolean details = (cv.getExperiences() != null && cv.getExperiences().stream().anyMatch(e -> e != null && text(e.getRole()) && e.getDetails() != null && e.getDetails().stream().anyMatch(this::text)))
            || (cv.getProjects() != null && cv.getProjects().stream().anyMatch(p -> p != null && text(p.getName()) && p.getDetails() != null && p.getDetails().stream().anyMatch(this::text)));
        return List.of(check("clarity-contact", "Thông tin liên hệ đọc được", !contact.isBlank(), contact),
            check("clarity-structure", "Nội dung phân chia theo mục", cv.getSkills() != null && !cv.getSkills().isEmpty()
                && ((cv.getExperiences() != null && !cv.getExperiences().isEmpty()) || (cv.getProjects() != null && !cv.getProjects().isEmpty())), s.cvText()),
            check("clarity-details", "Kinh nghiệm hoặc dự án có mô tả cụ thể", details, s.cvText()));
    }
    private Evidence check(String id, String label, boolean met, String quote) {
        return new Evidence(id, RequirementGroup.CLARITY, label, false, null,
            met ? List.of(new Quote("cv", quote)) : List.of(), met ? RequirementAssessment.MET : RequirementAssessment.NOT_EVIDENCED,
            met ? "Có thông tin trong các mục CV đã lưu." : "Chưa có thông tin ở mục CV tương ứng.",
            met ? "" : "Bổ sung thông tin thực tế vào mục CV tương ứng.");
    }
    private boolean text(String s) { return s != null && !s.isBlank(); }
}
