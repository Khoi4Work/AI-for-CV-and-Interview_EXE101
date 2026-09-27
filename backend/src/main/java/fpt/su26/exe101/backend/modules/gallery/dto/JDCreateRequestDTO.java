package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JDCreateRequestDTO {
    private String title;
    private String content;
    private String companyName;
}
