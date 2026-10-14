package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import fpt.su26.exe101.backend.modules.cv.entity.CVAnalysis;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CVAnalysisRepository extends JpaRepository<CVAnalysis, UUID> {
    Optional<CVAnalysis> findByGalleryIdAndCacheKey(UUID galleryId, String cacheKey);
    List<CVAnalysis> findTop20ByStatusOrderByCreatedAtAsc(AnalysisStatus status);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select a from CVAnalysis a where a.id=:id")
    Optional<CVAnalysis> lock(@Param("id") UUID id);
    List<CVAnalysis> findByStatusAndLeaseUntilBefore(AnalysisStatus status, LocalDateTime cutoff);
}
