package fpt.su26.exe101.backend.modules.gallery.dto;

import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata;

/** Result returned by the normalization service, including provider-call accounting. */
public record JobDescriptionRequirementsResultDTO(
        JobDescriptionNormalizationMetadata metadata,
        int calls) {
}
