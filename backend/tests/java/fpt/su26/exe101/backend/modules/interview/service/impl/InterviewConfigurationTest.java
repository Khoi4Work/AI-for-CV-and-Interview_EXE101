package fpt.su26.exe101.backend.modules.interview.service.impl;
import com.fasterxml.jackson.databind.ObjectMapper;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.cv.dto.CVContent;
import fpt.su26.exe101.backend.modules.cv.entity.CV;
import fpt.su26.exe101.backend.modules.cv.service.CVPipelineService;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.service.GalleryService;
import fpt.su26.exe101.backend.modules.interview.dto.InterviewQuestionGenerationDTO;
import fpt.su26.exe101.backend.modules.interview.dto.request.CreateInterviewSessionRequestDTO;
import fpt.su26.exe101.backend.modules.interview.entity.*;
import fpt.su26.exe101.backend.modules.interview.entity.enums.*;
import fpt.su26.exe101.backend.modules.interview.mapper.InterviewMapper;
import fpt.su26.exe101.backend.modules.interview.repository.*;
import fpt.su26.exe101.backend.modules.interview.service.*;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.*;
class InterviewConfigurationTest {
    @ParameterizedTest @CsvSource({"HR,FRESHER,vi","STAR,FRESHER,vi","TECHNICAL,FRESHER,vi","HR,INTERN,en","BEHAVIORAL,JUNIOR,en","TECHNICAL,JUNIOR,en"})
    void selectedTypeLevelLanguageAndJDReachGenerationWithoutSharedPrivateQuestions(String inputType,ExperienceLevel level,String language) {
        InterviewType type="STAR".equals(inputType)?InterviewType.BEHAVIORAL:InterviewType.valueOf(inputType);
        var sessions=mock(InterviewSessionRepository.class);var galleryService=mock(GalleryService.class);
        var questions=mock(InterviewQuestionRepository.class);var banks=mock(InterviewQuestionBankRepository.class);
        var pipeline=mock(CVPipelineService.class);var quota=mock(UsageQuotaService.class);var ai=mock(InterviewAIProvider.class);
        var company=mock(CompanyContextService.class);
        var service=new InterviewServiceImpl(sessions,mock(InterviewAnswerRepository.class),mock(InterviewMapper.class),galleryService,questions,banks,
            pipeline,quota,new ObjectMapper().findAndRegisterModules(),ai,mock(InterviewVoiceService.class),mock(InterviewQuestionRelevanceService.class),company);
        var owner=Gallery.builder().accountId(UUID.randomUUID()).build();owner.setId(UUID.randomUUID());
        var cv=CV.builder().gallery(owner).name("Test CV").content(CVContent.builder().sourceText("Private email and identity")
            .profilePhoto("private-image").skills(List.of(CVContent.Skill.builder().name("Java").build())).build()).build();cv.setId(UUID.randomUUID());
        var jd=JobDescription.builder().title("Backend Developer").companyName("FPT Telecom").content("Develop Java APIs and collaborate with a delivery team.").build();jd.setId(UUID.randomUUID());
        when(galleryService.getCurrentGallery()).thenReturn(owner);when(quota.getInterviewPlan(owner.getAccountId())).thenReturn(UserPlan.FREE);
        when(pipeline.getCVForInterview(cv.getId(),owner)).thenReturn(cv);when(galleryService.findJobDescription(jd.getId(),owner)).thenReturn(jd);
        when(company.resolve(jd)).thenReturn(new CompanyContextService.Context("FPT Telecom","",null,null,false));
        when(ai.generateSessionQuestions(eq(type),eq(level),eq(3),eq(language),anyString(),eq(jd.getContent()),anyString())).thenAnswer(inv->{
            assertFalse(inv.<String>getArgument(4).contains("Private email"));assertFalse(inv.<String>getArgument(4).contains("private-image"));
            assertTrue(inv.<String>getArgument(6).contains("FPT Telecom"));assertTrue(inv.<String>getArgument(6).contains("\"verified\":false"));
            String theme=switch(type){case HR->"Môi trường làm việc và động lực nghề nghiệp";case BEHAVIORAL->"Hãy kể về tình huống cụ thể, hành động và kết quả";default->"Thiết kế và xử lý lỗi API Java";};
            return InterviewQuestionGenerationDTO.builder().questions(java.util.stream.IntStream.range(0,3).mapToObj(i->InterviewQuestionGenerationDTO.QuestionDraft.builder()
                .text(theme+" "+i).category(type.name()).competency(theme).sampleAnswer("Outline").gradingCriteria(Map.of("keyPoints",List.of("Evidence"))).build()).toList()).build();
        });
        when(sessions.save(any())).thenAnswer(inv->{InterviewSession s=inv.getArgument(0);s.setId(UUID.randomUUID());return s;});
        var request=CreateInterviewSessionRequestDTO.builder().interviewType(inputType).experienceLevel(level.name()).durationMinutes(5).language(language)
            .cvId(cv.getId()).jdId(jd.getId()).adaptiveMode(false).build();
        var result=service.createSession(request);
        assertEquals(type,result.getInterviewType());assertEquals(level,result.getExperienceLevel());assertEquals(language,result.getLanguage());
        assertEquals(3,result.getQuestions().size());assertTrue(result.getQuestions().stream().allMatch(q->q.getInterviewType().equals(type.name()) && q.getSource().equals("GENERATED")));
        assertEquals("FPT Telecom",result.getCompanyContext().get("companyName"));assertEquals(false,result.getCompanyContext().get("verified"));
        verify(questions,never()).saveAll(any());verify(banks,never()).save(any());verify(quota).consumeInterviewMinutes(owner.getAccountId(),5);
    }
}
