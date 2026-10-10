package fpt.su26.exe101.backend.modules.gallery.repository;

import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select j from JobDescription j where j.id=:id")
    java.util.Optional<JobDescription> lock(@org.springframework.data.repository.query.Param("id") UUID id);
    List<JobDescription> findByGalleryId(UUID galleryId);
    java.util.Optional<JobDescription> findByGalleryIdAndContentHash(UUID galleryId, String contentHash);
    List<JobDescription> findBySourceAndActiveTrue(JobDescriptionSource source);
}
