package fpt.su26.exe101.backend.modules.quota.config;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class QuotaBenefitConfig {

    @Getter
    @RequiredArgsConstructor
    public static class QuotaBenefit {
        private final int cvCnt;
        private final int aiCvCnt;
    }

    private final Map<UserPlan, QuotaBenefit> benefits = new EnumMap<>(UserPlan.class);

    public QuotaBenefitConfig() {
        // FREE: 1 lượt tạo CV, 1 lượt AI CV.
        benefits.put(UserPlan.FREE, new QuotaBenefit(1, 1));
        // CV AI analysis limits match the monthly packages shown in PricingPage.
        benefits.put(UserPlan.MIDDLE, new QuotaBenefit(5, 5));
        benefits.put(UserPlan.ENHANCE, new QuotaBenefit(10, 10));
    }

    public QuotaBenefit getBenefit(UserPlan plan) {
        return benefits.getOrDefault(plan, benefits.get(UserPlan.FREE));
    }
}
