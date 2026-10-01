package fpt.su26.exe101.backend.modules.interview.entity;

import jakarta.persistence.*;
import lombok.*;
import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import java.util.UUID;

@Entity
@Table(name = "Interview_Answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewAnswer extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private InterviewSession session;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "answer_text", columnDefinition = "TEXT")
    private String answerText;

    @Column(name = "audio_url", columnDefinition = "TEXT")
    private String audioUrl;

    @Builder.Default
    @Column(name = "is_skipped")
    private Boolean isSkipped = false;
}
