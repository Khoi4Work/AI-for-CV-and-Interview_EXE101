package fpt.su26.exe101.backend.modules.gallery.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JDResponseDTO {
    private UUID id;
    private String title;
    private String content;
    private String companyName;
    private LocalDateTime createdAt;
}
