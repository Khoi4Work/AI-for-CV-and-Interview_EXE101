package fpt.su26.exe101.backend.modules.cv.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;
import fpt.su26.exe101.backend.modules.cv.entity.enums.TemplateAccessLevel;

@Entity
@Table(name = "cv_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVTemplate {
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String category;

    @Column(length = 100)
    private String subtitle;

    @Column(length = 50)
    private String style;

    @Column(length = 50)
    private String type;

    @Column(name = "badge_text", length = 50)
    private String badgeText;

    @Column(name = "badge_theme", length = 50)
    private String badgeTheme;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "rating", columnDefinition = "DECIMAL(3,2)")
    private Double rating;

    @Column(nullable = false)
    private Integer downloads = 0;

    @Column(name = "preview_image", columnDefinition = "TEXT")
    private String previewImage;

    @Enumerated(EnumType.STRING)
    @Column(name = "minimum_plan", nullable = false, length = 20)
    @Builder.Default
    private TemplateAccessLevel minimumPlan = TemplateAccessLevel.FREE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "created_by")
    private UUID createdBy;

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
