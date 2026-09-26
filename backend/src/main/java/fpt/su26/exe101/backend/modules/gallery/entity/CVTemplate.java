package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cv_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVTemplate extends BaseEntity {
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column
    private String category;

    @Column(name = "preview_image", columnDefinition = "TEXT")
    private String previewImage;
}
