package fpt.su26.exe101.backend.modules.gallery.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import java.util.UUID;

@Entity
@Table(name = "Template_Feedback")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateFeedback extends BaseEntity {
    @Column(name = "template_id", nullable = false, length = 50)
    private String templateId;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;
}
