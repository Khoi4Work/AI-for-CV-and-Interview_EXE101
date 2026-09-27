package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVUpdateRequestDTO {
    private String name;
    private CVContent content;
    private Long templateId;
}
