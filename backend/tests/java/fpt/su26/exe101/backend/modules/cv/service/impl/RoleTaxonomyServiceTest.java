package fpt.su26.exe101.backend.modules.cv.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
class RoleTaxonomyServiceTest {
    private final RoleTaxonomyServiceImpl taxonomy = new RoleTaxonomyServiceImpl(new ObjectMapper());
    @Test void aliasesAndSeniorityShareOccupation() {
        assertEquals(Set.of("BA"),taxonomy.roles("Senior Chuyên viên Phân tích nghiệp vụ"));
        assertEquals(taxonomy.roles("Junior BA"),taxonomy.roles("Business Analyst"));
    }
    @Test void collaborationDoesNotBecomeRecruitingRole() {
        assertEquals(Set.of("BACKEND"),taxonomy.jobRoles("Backend Developer","Position: Backend Developer\nCollaborate with Business Analyst on requirements."));
        assertEquals(Set.of(),taxonomy.jobRoles("User Provided JD","Phối hợp với BA và nhóm Backend để làm báo cáo."));
    }
    @Test void genericTitleCanUseExplicitContentAndJson() {
        assertEquals(Set.of("BA"),taxonomy.jobRoles("User Provided JD","Vị trí: Business Analyst."));
        assertEquals(Set.of("BA"),taxonomy.jobRoles("User Provided JD","Business Analyst\nGather stakeholder requirements and write user stories."));
        assertEquals(Set.of("QA"),taxonomy.jobRoles("User Provided JD","{\"title\":\"QA Engineer\"}"));
        assertEquals(Set.of("BA"),taxonomy.jobRoles("User Provided JD","{\"title\":\"Business Analyst\",\"details\":\"Work with Backend Developer\"}"));
    }
}
