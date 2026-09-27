package fpt.su26.exe101.backend.modules.gallery.dto.request;

import fpt.su26.exe101.backend.modules.gallery.dto.CVContent;
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
