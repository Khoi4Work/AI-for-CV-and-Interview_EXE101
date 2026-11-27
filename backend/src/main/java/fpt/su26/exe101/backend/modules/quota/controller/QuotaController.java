package fpt.su26.exe101.backend.modules.quota.controller;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.base.response.ApiResponse;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.payment.dto.response.QuotaResponseDTO;
import fpt.su26.exe101.backend.modules.quota.dto.TesterPlanSettingsRequestDTO;
import fpt.su26.exe101.backend.modules.quota.entity.UserUsageQuota;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/quota")
@RequiredArgsConstructor
public class QuotaController {

    private final UsageQuotaService usageQuotaService;
    private final AccountRepository accountRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<QuotaResponseDTO>> getMyQuota(@AuthenticationPrincipal UserDetails userDetails) {
        var account = accountRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account not found"));

        usageQuotaService.initializeDefaultQuota(account.getId());
        UserUsageQuota quota = usageQuotaService.getQuota(account.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Quota not found"));

        QuotaResponseDTO response = QuotaResponseDTO.builder()
                .remainingCvCount(quota.getRemainingCvCnt())
                .remainingCvFreeCredits(quota.getRemainingCvFreeCredits())
                .remainingCvMiddleCredits(quota.getRemainingCvMiddleCredits())
                .remainingCvEnhanceCredits(quota.getRemainingCvEnhanceCredits())
                .remainingInterviewMinutes(quota.getRemainingIntMin())
                .cvPlan(usageQuotaService.getCvPlan(account.getId()))
                .interviewPlan(usageQuotaService.getInterviewPlan(account.getId()))
                .cvNonExpiring(true)
                .interviewNonExpiring(true)
                .quotaExempt(usageQuotaService.isQuotaExempt(account.getId()))
                .cvPeriodEnd(quota.getCvPeriodEnd())
                .interviewPeriodEnd(quota.getInterviewPeriodEnd())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/tester-plans")
    @PreAuthorize("hasRole('TESTER')")
    public ResponseEntity<ApiResponse<QuotaResponseDTO>> updateTesterPlans(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody TesterPlanSettingsRequestDTO request) {
        var account = accountRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Account not found"));
        UserUsageQuota quota = usageQuotaService.updateTesterPlans(account.getId(), request.cvPlan(), request.interviewPlan());
        QuotaResponseDTO response = QuotaResponseDTO.builder()
                .remainingCvCount(quota.getRemainingCvCnt())
                .remainingCvFreeCredits(quota.getRemainingCvFreeCredits())
                .remainingCvMiddleCredits(quota.getRemainingCvMiddleCredits())
                .remainingCvEnhanceCredits(quota.getRemainingCvEnhanceCredits())
                .remainingInterviewMinutes(quota.getRemainingIntMin())
                .cvPlan(usageQuotaService.getCvPlan(account.getId()))
                .interviewPlan(usageQuotaService.getInterviewPlan(account.getId()))
                .cvNonExpiring(true)
                .interviewNonExpiring(true)
                .quotaExempt(true)
                .cvPeriodEnd(quota.getCvPeriodEnd())
                .interviewPeriodEnd(quota.getInterviewPeriodEnd())
                .build();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
