package fpt.su26.exe101.backend.modules.quota.dto;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import jakarta.validation.constraints.NotNull;

public record TesterPlanSettingsRequestDTO(
        @NotNull UserPlan cvPlan,
        @NotNull UserPlan interviewPlan
) {}
