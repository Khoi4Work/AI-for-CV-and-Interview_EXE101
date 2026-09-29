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
        private final int intMin;
    }

    private final Map<UserPlan, QuotaBenefit> benefits = new EnumMap<>(UserPlan.class);

    public QuotaBenefitConfig() {
        // FREE: 1 lượt tạo CV, 1 lượt AI CV, 0 phút Interview.
        benefits.put(UserPlan.FREE, new QuotaBenefit(1, 1, 0));
        // MIDDLE: 5 lượt tạo CV, 10 lượt AI CV, 30 phút Interview.
        benefits.put(UserPlan.MIDDLE, new QuotaBenefit(5, 10, 30));
        // ENHANCE: 10 lượt tạo CV, 50 lượt AI CV, 120 phút Interview.
        benefits.put(UserPlan.ENHANCE, new QuotaBenefit(10, 50, 120));
    }

    public QuotaBenefit getBenefit(UserPlan plan) {
        return benefits.getOrDefault(plan, benefits.get(UserPlan.FREE));
    }
}
