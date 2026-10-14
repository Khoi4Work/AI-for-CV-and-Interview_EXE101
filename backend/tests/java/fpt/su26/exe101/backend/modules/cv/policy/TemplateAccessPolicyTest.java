package fpt.su26.exe101.backend.modules.cv.policy;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.cv.entity.enums.TemplateAccessLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TemplateAccessPolicyTest {
    @Test
    void enhanceCanUseEveryCurrentTemplateAccessLevel() {
        for (TemplateAccessLevel required : TemplateAccessLevel.values()) {
            assertTrue(TemplateAccessPolicy.canUse(UserPlan.ENHANCE, required));
        }
    }

    @Test
    void lowerPlansCannotUseHigherTierTemplates() {
        assertFalse(TemplateAccessPolicy.canUse(UserPlan.FREE, TemplateAccessLevel.MIDDLE));
        assertFalse(TemplateAccessPolicy.canUse(UserPlan.FREE, TemplateAccessLevel.ENHANCE));
        assertFalse(TemplateAccessPolicy.canUse(UserPlan.MIDDLE, TemplateAccessLevel.ENHANCE));
    }
}
