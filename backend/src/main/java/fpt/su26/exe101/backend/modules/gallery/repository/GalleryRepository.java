package fpt.su26.exe101.backend.modules.gallery.repository;

import fpt.su26.exe101.backend.modules.gallery.entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GalleryRepository extends JpaRepository<Gallery, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select g from Gallery g where g.id=:id")
    Optional<Gallery> lock(@org.springframework.data.repository.query.Param("id") UUID id);
    Optional<Gallery> findByAccountId(UUID accountId);
}
