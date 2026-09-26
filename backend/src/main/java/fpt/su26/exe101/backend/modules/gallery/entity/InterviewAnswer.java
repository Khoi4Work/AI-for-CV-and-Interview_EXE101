package fpt.su26.exe101.backend.modules.gallery.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "interview_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer extends BaseEntity {
    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Column(name = "is_skipped")
    private Boolean isSkipped = false;
}
