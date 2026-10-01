package fpt.su26.exe101.backend.modules.cv.dto;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = false)
public class CVFeedbackContent {
    private SWOTAnalysis swot;
    private List<SectionFeedback> sectionAnalysis;
}
