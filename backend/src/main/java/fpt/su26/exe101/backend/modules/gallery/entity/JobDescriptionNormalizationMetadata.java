package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/** JSONB value stored with a JD after deterministic normalization and requirement extraction. */
public record JobDescriptionNormalizationMetadata(
        Set<String> roleCodes,
        String quality,
        String sourceUrl,
        String referenceDate,
        String verification,
        UUID derivedFromJdId,
        List<Requirement> requirements) {

    public record Requirement(
            String requirementId,
            RequirementGroup group,
            String description,
            boolean mandatory,
            JdEvidence jdEvidence) {
    }

    public record JdEvidence(String anchor, String text) {
    }
}
