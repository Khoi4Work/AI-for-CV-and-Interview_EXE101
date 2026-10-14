package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "Job_Descriptions", uniqueConstraints = @UniqueConstraint(name = "uk_jd_gallery_content_hash", columnNames = {"gallery_id", "content_hash"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescription extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gallery_id")
    private Gallery gallery;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private JobDescriptionSource source = JobDescriptionSource.USER;

    @Column(name = "catalog_key", unique = true, length = 160)
    private String catalogKey;

    @Column(length = 120)
    private String industry;

    @Column(name = "experience_level", length = 80)
    private String experienceLevel;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "company_name", length = 255)
    private String companyName;

    @Column(name = "content_hash", length = 64)
    private String contentHash;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "normalization_metadata", columnDefinition = "jsonb")
    private JobDescriptionNormalizationMetadata normalizationMetadata;

    @Column(name = "normalization_hash", length = 64)
    private String normalizationHash;

    @Column(name = "normalization_version", length = 80)
    private String normalizationVersion;

    @Builder.Default
    @Column(name = "extraction_status", nullable = false, length = 24)
    private String extractionStatus = "IDLE";

    @Column(name = "extraction_lease_until")
    private LocalDateTime extractionLeaseUntil;

    @Column(name = "extraction_claim_token")
    private UUID extractionClaimToken;
}
