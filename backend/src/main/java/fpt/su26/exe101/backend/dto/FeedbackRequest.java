package fpt.su26.exe101.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackRequest {

    @NotBlank(message = "userName must not be blank")
    private String userName;

    /**
     * Whitelist category, phải khớp với FE widget: bug | ui | performance |
     * idea | question | content | other.
     */
    @NotBlank(message = "category must not be blank")
    @Pattern(
            regexp = "bug|ui|performance|idea|question|content|other",
            message = "category must be one of: bug, ui, performance, idea, question, content, other"
    )
    private String category;

    @NotBlank(message = "content must not be blank")
    @Size(max = 1000, message = "content must be at most 1000 characters")
    private String content;

    private String imageUrl;
}
