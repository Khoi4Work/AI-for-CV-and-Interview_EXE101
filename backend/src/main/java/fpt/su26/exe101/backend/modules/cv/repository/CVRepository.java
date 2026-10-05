package fpt.su26.exe101.backend.modules.cv.repository;

import fpt.su26.exe101.backend.modules.cv.entity.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.UUID;

@Repository
public interface CVRepository extends JpaRepository<CV, UUID> {
    @EntityGraph(attributePaths = "gallery")
    java.util.Optional<CV> findWithGalleryById(UUID id);
    @EntityGraph(attributePaths = {"gallery", "template"})
    List<CV> findByGalleryId(UUID galleryId);
    List<CV> findByTemplateId(String templateId);
    java.util.Optional<CV> findByGalleryIdAndSourceHash(UUID galleryId, String sourceHash);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CV c where c.id = :id")
    java.util.Optional<CV> findByIdForUpdate(@Param("id") UUID id);
}
