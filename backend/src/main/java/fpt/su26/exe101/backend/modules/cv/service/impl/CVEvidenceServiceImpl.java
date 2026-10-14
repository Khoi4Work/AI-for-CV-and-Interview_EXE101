package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.base.service.AIChatCompletionService;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Evidence;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Extraction;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.service.CVEvidenceService;
import fpt.su26.exe101.backend.modules.cv.service.CVEvidenceValidationService;
import fpt.su26.exe101.backend.modules.gallery.service.JobDescriptionNormalizationService;
import fpt.su26.exe101.backend.modules.gallery.dto.JobDescriptionRequirementsResultDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata.Requirement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CVEvidenceServiceImpl implements CVEvidenceService {
    private final AIChatCompletionService ai;
    private final ObjectMapper mapper;
    private final CVEvidenceValidationService validation;
    private final JobDescriptionNormalizationService normalization;

    @Override
    public Output extract(Snapshot snapshot) {
        JobDescriptionRequirementsResultDTO normalized = normalization.requirements(
                snapshot.jdId(), snapshot.jdTitle(), snapshot.jdText());
        String fixedRequirements;
        try {
            fixedRequirements = mapper.writeValueAsString(normalized.metadata().requirements());
        } catch (JsonProcessingException exception) {
            throw new ApiException(ErrorCode.UNEXPECTED_ERROR, "Không đọc được các yêu cầu JD.");
        }

        String prompt = Prompt.cvEvidenceExtraction(
                fixedRequirements, snapshot.cvText(), snapshot.jdText());
        String repairInstructions = "";
        int calls = normalized.calls();

        for (int attempt = 0; attempt < 2; attempt++) {
            AIChatCompletionService.Completion response = ai.generateJsonWithMetadata(
                    prompt + repairInstructions, null, 8192, "cv", "evidence-extraction");
            calls += response.calls();

            try {
                Extraction extraction = mapper.readValue(response.content(), Extraction.class);
                validation.validate(snapshot, extraction);
                validateAgainstFixedRequirements(extraction, normalized);
                return new Output(extraction, response.provider(), response.model(), calls);
            } catch (JsonProcessingException | CVAnalysisValidationException exception) {
                repairInstructions = "\nThe previous response failed validation: " + exception.getMessage()
                        + "\nReturn a corrected complete response using the original documents.";
            }
        }

        throw new CVAnalysisValidationException(
                "Không đủ minh chứng hợp lệ để chấm điểm. Hãy kiểm tra nội dung CV và JD.");
    }

    private void validateAgainstFixedRequirements(
            Extraction extraction, JobDescriptionRequirementsResultDTO normalized) {
        if (extraction.requirements().size() != normalized.metadata().requirements().size()) {
            throw new CVAnalysisValidationException("Thiếu yêu cầu JD đã trích.");
        }

        for (Requirement expected
                : normalized.metadata().requirements()) {
            Evidence actual = extraction.requirements().stream()
                    .filter(requirement -> requirement.requirementId().equals(expected.requirementId()))
                    .findFirst()
                    .orElseThrow(() -> new CVAnalysisValidationException("Thiếu yêu cầu JD đã trích."));

            if (actual.group() != expected.group()
                    || actual.mandatory() != expected.mandatory()
                    || !actual.description().equals(expected.description())
                    || !actual.jdEvidence().anchor().equals(expected.jdEvidence().anchor())
                    || !actual.jdEvidence().text().equals(expected.jdEvidence().text())) {
                throw new CVAnalysisValidationException("AI đã thay đổi yêu cầu JD cố định.");
            }
        }
    }
}
