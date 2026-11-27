package fpt.su26.exe101.backend.modules.payment.dto.response;

import fpt.su26.exe101.backend.base.enums.UserPlan;
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
    private UserPlan cvPlan;
    private UserPlan interviewPlan;
    private Boolean cvNonExpiring;
    private Boolean interviewNonExpiring;
    private Boolean quotaExempt;
    private LocalDateTime cvPeriodEnd;
    private LocalDateTime interviewPeriodEnd;
}
