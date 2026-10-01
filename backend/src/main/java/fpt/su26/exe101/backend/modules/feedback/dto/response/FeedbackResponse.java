package fpt.su26.exe101.backend.modules.feedback.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    private UUID id;
    private String userName;
    private String category;
    private String content;
    private String imageUrl;
    private LocalDateTime createdAt;
}
