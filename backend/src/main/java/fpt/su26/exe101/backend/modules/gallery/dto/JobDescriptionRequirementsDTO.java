package fpt.su26.exe101.backend.modules.gallery.dto;

import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.Requirement;
import java.util.List;

/** AI extraction schema for a JD's fixed, source-grounded requirements. */
public record JobDescriptionRequirementsDTO(List<Requirement> requirements) {
}
