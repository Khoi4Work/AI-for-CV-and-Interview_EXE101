package fpt.su26.exe101.backend.modules.cv.mapper;

import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Alternative;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Breakdown;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Contribution;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Evidence;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Quote;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Result;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisSnapshotResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisResultResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisBreakdownResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisContributionResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisEvidenceResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisQuoteResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAlternativeRecommendationItemDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.TemplateFeedbackResponseDTO;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.entity.CVAnalysis;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.entity.TemplateFeedback;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescriptionNormalizationMetadata;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CVMapper {
    @Mapping(target = "galleryId", source = "gallery.id")
    CVResponseDTO cvToCVResponse(CV cv);

    @Mapping(target = "analysisId", source = "analysis.id")
    @Mapping(target = "remaining", source = "remaining")
    CVAnalysisResponseDTO toAnalysisResponse(CVAnalysis analysis, boolean reused, Integer remaining);

    CVAlternativeRecommendationItemDTO toAlternativeResponse(Alternative alternative);

    CVAnalysisSnapshotResponseDTO toAnalysisSnapshotResponse(Snapshot snapshot);

    CVAnalysisResultResponseDTO toAnalysisResultResponse(
            Result result);

    CVAnalysisBreakdownResponseDTO toAnalysisBreakdownResponse(
            Breakdown breakdown);

    CVAnalysisContributionResponseDTO toAnalysisContributionResponse(
            Contribution contribution);

    CVAnalysisEvidenceResponseDTO toAnalysisEvidenceResponse(
            Evidence evidence);

    CVAnalysisQuoteResponseDTO toAnalysisQuoteResponse(
            Quote quote);

    @Mapping(target = "cvId", source = "cv.id")
    @Mapping(target = "jdId", source = "jd.id")
    @Mapping(target = "cvName", source = "cv.name")
    @Mapping(target = "jdTitle", source = "jd.title")
    @Mapping(target = "companyName", source = "jd.companyName")
    @Mapping(target = "source", expression = "java(jd.getSource().name())")
    @Mapping(target = "sourceUrl", source = "metadata.sourceUrl")
    @Mapping(target = "referenceDate", source = "metadata.referenceDate")
    @Mapping(target = "verification", source = "metadata.verification")
    @Mapping(target = "cv", source = "cvContent")
    @Mapping(target = "cvText", source = "cvText")
    @Mapping(target = "jdText", source = "jd.content")
    @Mapping(target = "roleCodes", source = "metadata.roleCodes")
    @Mapping(target = "truncated", expression = "java(Boolean.TRUE.equals(cvContent.getSourceTruncated()))")
    Snapshot toAnalysisSnapshot(
            CV cv,
            JobDescription jd,
            CVContent cvContent,
            String cvText,
            JobDescriptionNormalizationMetadata metadata);

    @Mapping(target = "cvId", source = "snapshot.cvId")
    @Mapping(target = "jdId", source = "jd.id")
    @Mapping(target = "cvName", source = "snapshot.cvName")
    @Mapping(target = "jdTitle", source = "jd.title")
    @Mapping(target = "companyName", source = "jd.companyName")
    @Mapping(target = "source", expression = "java(jd.getSource().name())")
    @Mapping(target = "sourceUrl", source = "metadata.sourceUrl")
    @Mapping(target = "referenceDate", source = "metadata.referenceDate")
    @Mapping(target = "verification", source = "metadata.verification")
    @Mapping(target = "cv", source = "snapshot.cv")
    @Mapping(target = "cvText", source = "snapshot.cvText")
    @Mapping(target = "jdText", source = "jd.content")
    @Mapping(target = "roleCodes", source = "metadata.roleCodes")
    @Mapping(target = "truncated", source = "snapshot.truncated")
    Snapshot toAnalysisSnapshot(
            Snapshot snapshot,
            JobDescription jd,
            JobDescriptionNormalizationMetadata metadata);

    CVTemplateResponseDTO templateToTemplateResponse(CVTemplate template);
    TemplateFeedbackResponseDTO feedbackToFeedbackResponse(TemplateFeedback feedback);

    List<CVResponseDTO> cvsToCVResponses(List<CV> cvs);
    List<CVTemplateResponseDTO> templatesToTemplateResponses(List<CVTemplate> templates);
    List<TemplateFeedbackResponseDTO> feedbacksToFeedbackResponses(List<TemplateFeedback> feedbacks);
}
