package fpt.su26.exe101.backend.modules.interview.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.interview.entity.enums.QuestionContextType;
import fpt.su26.exe101.backend.modules.interview.entity.enums.QuestionRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bank_id", nullable = false)
    private InterviewQuestionBank bank;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "sample_answer", columnDefinition = "TEXT")
    private String sampleAnswer;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "grading_criteria", columnDefinition = "jsonb")
    private Map<String, Object> gradingCriteria;

    @Column(length = 100)
    private String category;

    @Column(length = 100)
    private String competency;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_role", nullable = false, length = 30)
    @Builder.Default
    private QuestionRole questionRole = QuestionRole.PRIMARY;

    @Enumerated(EnumType.STRING)
    @Column(name = "context_type", nullable = false, length = 30)
    @Builder.Default
    private QuestionContextType contextType = QuestionContextType.GENERAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_question_id")
    private InterviewQuestion parentQuestion;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
