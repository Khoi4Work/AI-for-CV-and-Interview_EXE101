package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CVRepository extends JpaRepository<CV, UUID> {
    List<CV> findByGalleryId(UUID galleryId);
    List<CV> findByTemplateId(String templateId);
    java.util.Optional<CV> findByGalleryIdAndSourceHash(UUID galleryId, String sourceHash);
}
