package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CVAnalysisRequest;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CVAnalysisRequestRepository extends JpaRepository<CVAnalysisRequest, UUID> {
    Optional<CVAnalysisRequest> findByGalleryIdAndRequestKey(UUID galleryId, String requestKey);
}
