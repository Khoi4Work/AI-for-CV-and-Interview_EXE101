package fpt.su26.exe101.backend.modules.cv.mapper;

import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.gallery.entity.JobDescription;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import fpt.su26.exe101.backend.modules.interview.mapper.InterviewMapper;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;

class GalleryResponseMapperTest {
    @Test
    void cvListIncludesPersistedTimestamps() {
        CV cv = CV.builder().name("Developer").build();
        cv.setCreatedAt(LocalDateTime.of(2026, 10, 1, 8, 0));
        cv.setUpdatedAt(LocalDateTime.of(2026, 10, 3, 9, 0));
        var response = Mappers.getMapper(CVMapper.class).cvsToCVResponses(List.of(cv)).getFirst();
        assertEquals(cv.getName(), response.getName());
        assertEquals(cv.getCreatedAt(), response.getCreatedAt());
        assertEquals(cv.getUpdatedAt(), response.getUpdatedAt());
    }

    @Test
    void interviewListLinksTheRealCvAndJobDescription() {
        CV cv = CV.builder().build();
        cv.setId(UUID.randomUUID());
        JobDescription jd = new JobDescription();
        jd.setId(UUID.randomUUID());
        var session = InterviewSession.builder().cv(cv).jobDescription(jd).overallScore(0).build();
        var response = Mappers.getMapper(InterviewMapper.class).sessionsToSessionResponses(List.of(session)).getFirst();
        assertEquals(cv.getId(), response.getCvId());
        assertEquals(jd.getId(), response.getJdId());
        assertEquals(0, response.getOverallScore());
    }
}
