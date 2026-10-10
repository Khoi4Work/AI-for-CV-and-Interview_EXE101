package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.request.CVAnalysisStartRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisAlternativesResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVAnalysisResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import java.util.UUID;

public interface CVAnalysisService {
    CVAnalysisResponseDTO start(UUID cvId, CVAnalysisStartRequestDTO request, String idempotencyKey, Gallery gallery);
    CVAnalysisResponseDTO read(UUID analysisId, Gallery gallery);
    CVAnalysisAlternativesResponseDTO startAlternatives(UUID analysisId, Gallery gallery);
    CVAnalysisAlternativesResponseDTO readAlternatives(UUID analysisId, Gallery gallery);
}
