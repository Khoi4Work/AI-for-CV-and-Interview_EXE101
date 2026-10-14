package fpt.su26.exe101.backend.modules.cv.policy;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.cv.entity.enums.TemplateAccessLevel;

public final class TemplateAccessPolicy {
    private TemplateAccessPolicy() {}

    public static boolean canUse(UserPlan plan, TemplateAccessLevel required) {
        UserPlan minimum = required == null ? UserPlan.FREE : UserPlan.valueOf(required.name());
        UserPlan current = plan == null ? UserPlan.FREE : plan;
        return rank(current) >= rank(minimum);
    }

    private static int rank(UserPlan plan) {
        return switch (plan) {
            case FREE -> 0;
            case MIDDLE -> 1;
            case ENHANCE -> 2;
        };
    }
}
