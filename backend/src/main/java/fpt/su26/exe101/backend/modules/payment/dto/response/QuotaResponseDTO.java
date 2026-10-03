package fpt.su26.exe101.backend.modules.payment.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaResponseDTO {
    private Integer remainingCvCount;
    private Integer remainingInterviewMinutes;
    private Integer remainingAiCvCnt;
    private fpt.su26.exe101.backend.base.enums.UserPlan cvPlan;
    private fpt.su26.exe101.backend.base.enums.UserPlan interviewPlan;
    private LocalDateTime cvPeriodEnd;
    private LocalDateTime interviewPeriodEnd;
}
