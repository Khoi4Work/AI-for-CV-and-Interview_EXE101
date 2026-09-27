package fpt.su26.exe101.backend.modules.gallery.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class SectionFeedback {
    private String sectionName;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> suggestions;
}
