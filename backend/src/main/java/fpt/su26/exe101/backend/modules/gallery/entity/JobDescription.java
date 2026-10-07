package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.gallery.entity.enums.JobDescriptionSource;

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
}
