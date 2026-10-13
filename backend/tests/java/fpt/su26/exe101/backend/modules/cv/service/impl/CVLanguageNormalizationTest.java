package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.persistence.Prompt;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CVLanguageNormalizationTest {
    @Test
    void removesLanguagesDuplicatedAsSkillsButKeepsOtherSkills() {
        CVContent content = CVContent.builder()
                .languages(List.of(CVContent.Language.builder().name("English").level("Fluent").build()))
                .skills(new ArrayList<>(List.of(
                        CVContent.Skill.builder().name(" English ").category("English").build(),
                        CVContent.Skill.builder().name("Communication").category("Soft Skills").build())))
                .build();

        boolean changed = CVPipelineServiceImpl.normalizeLanguageSkills(content);

        assertTrue(changed);
        assertEquals(1, content.getSkills().size());
        assertEquals("Communication", content.getSkills().get(0).getName());
        assertEquals("English", content.getLanguages().get(0).getName());
    }

    @Test
    void importPromptSeparatesLanguagesFromSkills() {
        String prompt = Prompt.cvImport("CV content");

        assertTrue(prompt.contains("Do not also include those languages as"));
        assertTrue(prompt.contains("entries in \"skills\""));
    }
}
