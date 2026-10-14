package fpt.su26.exe101.backend.modules.gallery.service;

import fpt.su26.exe101.backend.modules.gallery.dto.JobDescriptionRequirementsResultDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import java.util.UUID;

public interface JobDescriptionNormalizationService {
    JobDescriptionNormalizationMetadata normalize(JobDescription jd, UUID derivedFromJdId);
    JobDescriptionRequirementsResultDTO requirements(UUID jdId, String title, String content);
    int backfillMetadata(int page, int size);
}
