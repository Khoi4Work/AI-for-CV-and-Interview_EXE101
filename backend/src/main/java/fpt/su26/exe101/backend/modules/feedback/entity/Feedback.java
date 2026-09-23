package fpt.su26.exe101.backend.modules.feedback.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Feedback extends BaseEntity {
    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private String imageUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
