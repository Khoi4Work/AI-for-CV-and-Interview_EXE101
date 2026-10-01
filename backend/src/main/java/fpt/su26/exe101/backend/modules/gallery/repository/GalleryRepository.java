package fpt.su26.exe101.backend.modules.gallery.repository;

import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GalleryRepository extends JpaRepository<Gallery, UUID> {
    Optional<Gallery> findByAccountId(UUID accountId);
}
