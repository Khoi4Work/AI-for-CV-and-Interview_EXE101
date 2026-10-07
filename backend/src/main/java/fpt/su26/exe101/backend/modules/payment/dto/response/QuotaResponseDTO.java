package fpt.su26.exe101.backend.modules.payment.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuotaResponseDTO {
    private Integer remainingCvCount;
    private Integer remainingCvFreeCredits;
    private Integer remainingCvMiddleCredits;
    private Integer remainingCvEnhanceCredits;
    private Integer remainingInterviewMinutes;
    private fpt.su26.exe101.backend.base.enums.UserPlan cvPlan;
    private fpt.su26.exe101.backend.base.enums.UserPlan interviewPlan;
    private Boolean cvNonExpiring;
    private Boolean interviewNonExpiring;
    private LocalDateTime cvPeriodEnd;
    private LocalDateTime interviewPeriodEnd;
}
