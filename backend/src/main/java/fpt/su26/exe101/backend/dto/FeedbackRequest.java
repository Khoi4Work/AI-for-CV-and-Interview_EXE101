package fpt.su26.exe101.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRequest {
    private String userName;
    private String category;
    private String content;
    private String imageUrl;
}
