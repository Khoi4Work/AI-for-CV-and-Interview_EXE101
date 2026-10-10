package fpt.su26.exe101.backend.modules.cv.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Entity @Table(name="cv_analysis_requests", uniqueConstraints=@UniqueConstraint(columnNames={"gallery_id", "request_key"}))
@Getter @Setter
public class CVAnalysisRequest extends BaseEntity {
    @Column(name="gallery_id", nullable=false) private UUID galleryId;
    @Column(name="request_key", nullable=false, length=160) private String requestKey;
    @Column(nullable=false, length=64) private String digest;
    @Column(name="analysis_id", nullable=false) private UUID analysisId;
}
