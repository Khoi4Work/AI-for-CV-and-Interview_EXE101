package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CVCreateRequest {
    private String name;
    private java.util.Map<String, Object> content;
    private Long templateId;
}
