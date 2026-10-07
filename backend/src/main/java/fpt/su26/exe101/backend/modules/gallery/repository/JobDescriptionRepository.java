package fpt.su26.exe101.backend.modules.gallery.repository;

import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, UUID> {
    List<JobDescription> findByGalleryId(UUID galleryId);
    java.util.Optional<JobDescription> findByGalleryIdAndContentHash(UUID galleryId, String contentHash);
    List<JobDescription> findBySourceAndActiveTrue(JobDescriptionSource source);
}
