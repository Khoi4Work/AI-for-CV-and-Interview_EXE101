package fpt.su26.exe101.backend.modules.cv.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Attempt;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Result;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisStatus;
import fpt.su26.exe101.backend.modules.cv.entity.enums.AnalysisQuotaStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name = "cv_analyses", uniqueConstraints = @UniqueConstraint(columnNames = {"gallery_id", "cache_key"}))
@Getter @Setter
public class CVAnalysis extends BaseEntity {
    @Column(name="gallery_id", nullable=false) private UUID galleryId;
    @Column(name="account_id", nullable=false) private UUID accountId;
    @Column(name="cv_id", nullable=false) private UUID cvId;
    @Column(name="jd_id", nullable=false) private UUID jdId;
    @Column(name="cache_key", nullable=false, length=64) private String cacheKey;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private AnalysisStatus status = AnalysisStatus.PENDING;
    private String phase = "QUEUED";
    @Column(name="rubric_version", nullable=false) private String rubricVersion;
    @Column(name="extraction_version", nullable=false) private String extractionVersion;
    @Column(name="taxonomy_version", nullable=false) private String taxonomyVersion;
    @Column(name="config_version", nullable=false) private String configVersion;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition="jsonb", nullable=false) private Snapshot snapshot;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name="result_json", columnDefinition="jsonb") private Result result;
    private Integer score;
    private String error;
    private String provider;
    private String model;
    @Column(name="model_calls", nullable=false) private int modelCalls;
    @Column(nullable=false) private int attempt;
    @Column(name="lease_until") private LocalDateTime leaseUntil;
    @Column(name="internal_analysis", nullable=false) private boolean internalAnalysis;
    @Enumerated(EnumType.STRING)
    @Column(name="quota_status", nullable=false, length=24)
    private AnalysisQuotaStatus quotaStatus = AnalysisQuotaStatus.NOT_CHARGED;
    @JdbcTypeCode(SqlTypes.JSON) @Column(name="attempt_history",columnDefinition="jsonb",nullable=false)
    private List<Attempt> attemptHistory=new ArrayList<>();
}
