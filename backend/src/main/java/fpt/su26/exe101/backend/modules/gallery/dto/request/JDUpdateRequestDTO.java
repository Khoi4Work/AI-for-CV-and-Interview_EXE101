package fpt.su26.exe101.backend.modules.gallery.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JDUpdateRequestDTO {
    private String title;
    private String content;
    private String companyName;
}
