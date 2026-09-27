package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVCreateRequestDTO {
    private String name;
    private CVContent content;
    private Long templateId;
}
