package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;

@Entity
@Table(name = "CV_Templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CVTemplate extends BaseEntity {
    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String category;

    @Column(name = "preview_image", columnDefinition = "TEXT")
    private String previewImage;
}
