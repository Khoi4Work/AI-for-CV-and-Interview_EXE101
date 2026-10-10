package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CVAlternativeRecommendationJob;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CVAlternativeRecommendationJobRepository extends JpaRepository<CVAlternativeRecommendationJob, UUID> {
    Optional<CVAlternativeRecommendationJob> findByAnalysisId(UUID analysisId);
    List<CVAlternativeRecommendationJob> findTop10ByStatusOrderByCreatedAtAsc(String status);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select j from CVAlternativeRecommendationJob j where j.id=:id")
    Optional<CVAlternativeRecommendationJob> lock(@Param("id") UUID id);
}
