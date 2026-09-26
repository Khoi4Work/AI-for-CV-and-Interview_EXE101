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
public class InterviewAnswers extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSessions session;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "answer_text", columnDefinition = "text")
    private String answerText;

    @Column(name = "audio_url", columnDefinition = "text")
    private String audioUrl;

    @Column(name = "is_skipped")
    private Boolean isSkipped = false;
}
