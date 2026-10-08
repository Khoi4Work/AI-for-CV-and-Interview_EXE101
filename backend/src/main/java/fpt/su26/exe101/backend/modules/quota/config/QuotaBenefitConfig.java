package fpt.su26.exe101.backend.modules.quota.config;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class QuotaBenefitConfig {
    public static final int FREE_INTERVIEW_MINUTES = 5;

    @Getter
    @RequiredArgsConstructor
    public static class QuotaBenefit {
        private final int cvCnt;
        private final int aiCvCnt;
    }

    private final Map<UserPlan, QuotaBenefit> benefits = new EnumMap<>(UserPlan.class);

    public QuotaBenefitConfig() {
        // CV creation units are one-time credits; aiCvCnt is analyses per CV.
        benefits.put(UserPlan.FREE, new QuotaBenefit(1, 1));
        benefits.put(UserPlan.MIDDLE, new QuotaBenefit(3, 3));
        benefits.put(UserPlan.ENHANCE, new QuotaBenefit(4, 5));
    }

    public QuotaBenefit getBenefit(UserPlan plan) {
        return benefits.getOrDefault(plan, benefits.get(UserPlan.FREE));
    }
}
