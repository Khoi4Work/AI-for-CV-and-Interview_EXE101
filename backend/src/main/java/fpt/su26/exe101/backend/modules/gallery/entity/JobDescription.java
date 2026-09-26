package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "job_descriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescription extends BaseEntity {
    @Column(name = "gallery_id", nullable = false)
    private UUID galleryId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "company_name")
    private String companyName;
}
