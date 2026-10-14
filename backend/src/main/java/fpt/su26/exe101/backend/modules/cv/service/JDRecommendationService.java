package fpt.su26.exe101.backend.modules.cv.service;

import fpt.su26.exe101.backend.modules.cv.dto.response.JDRecommendationResponseDTO;

import java.util.List;
import java.util.UUID;

public interface JDRecommendationService {
    List<JDRecommendationResponseDTO> recommend(UUID cvId, UUID galleryId);
    List<JDRecommendationResponseDTO> recommendHigherScoringOtherRoles(
            UUID cvId, UUID galleryId, UUID currentJdId, int currentScore);
}
