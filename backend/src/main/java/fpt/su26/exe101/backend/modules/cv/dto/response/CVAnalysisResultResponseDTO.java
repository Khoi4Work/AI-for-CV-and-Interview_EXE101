package fpt.su26.exe101.backend.modules.cv.dto.response;

import java.util.List;

public record CVAnalysisResultResponseDTO(
        int score,
        List<CVAnalysisBreakdownResponseDTO> breakdown,
        List<CVAnalysisContributionResponseDTO> contributions,
        List<String> evidencedSkills,
        List<String> notEvidencedSkills,
        String summary) {
}
