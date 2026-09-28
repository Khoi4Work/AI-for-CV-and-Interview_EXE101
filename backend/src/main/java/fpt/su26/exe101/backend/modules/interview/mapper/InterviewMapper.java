package fpt.su26.exe101.backend.modules.interview.mapper;

import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewAnswerResponseDTO;
import fpt.su26.exe101.backend.modules.interview.dto.response.InterviewSessionResponseDTO;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewAnswer;
import fpt.su26.exe101.backend.modules.interview.entity.InterviewSession;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InterviewMapper {
    List<InterviewSessionResponseDTO> sessionsToSessionResponses(List<InterviewSession> sessions);
    List<InterviewAnswerResponseDTO> answersToAnswerResponses(List<InterviewAnswer> answers);
}
