package fpt.su26.exe101.backend.modules.interview.dto.response;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewQuestionResponseDTO {
    private UUID id;
    private String text;
    private String category;
    private String competency;
    private String source;
    private String interviewType;
    private String contextType;
}
