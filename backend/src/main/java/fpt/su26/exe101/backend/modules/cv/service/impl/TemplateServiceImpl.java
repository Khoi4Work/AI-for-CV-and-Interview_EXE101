package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.entity.TemplateFeedback;
import fpt.su26.exe101.backend.modules.cv.repository.CVTemplateRepository;
import fpt.su26.exe101.backend.modules.cv.repository.TemplateFeedbackRepository;
import fpt.su26.exe101.backend.modules.cv.dto.request.TemplateFeedbackRequestDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.cv.dto.response.TemplateFeedbackResponseDTO;
import fpt.su26.exe101.backend.modules.cv.mapper.CVMapper;
import fpt.su26.exe101.backend.modules.cv.service.TemplateService;
import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateServiceImpl implements TemplateService {
    private final CVTemplateRepository templateRepository;
    private final TemplateFeedbackRepository feedbackRepository;
    private final CVMapper cvMapper;
    private final AccountRepository accountRepository;
    private final UsageQuotaService quotaService;

    @Override
    public List<CVTemplateResponseDTO> getAllTemplates() {
        UUID accountId = getAccountIdFromToken();
        UserPlan plan = quotaService.getPlan(accountId);
        int userPlanLevel = plan.ordinal();

        return cvMapper.templatesToTemplateResponses(templateRepository.findAll().stream()
                .filter(template -> {
                    if (template.getMinimumPlan() == null) return true;
                    return userPlanLevel >= template.getMinimumPlan().ordinal();
                }).toList());
    }

    @Override
    @Transactional
    public void submitFeedback(TemplateFeedbackRequestDTO request) {
        CVTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ApiException(ErrorCode.RESOURCE_NOT_FOUND, "Template not found"));

        UUID accountId = getAccountIdFromToken();

        TemplateFeedback feedback = TemplateFeedback.builder()
                .template(template)
                .accountId(accountId)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        TemplateFeedback saved = feedbackRepository.save(feedback);
        log.info("[CV TEMPLATE] Feedback submitted | templateId={} | feedbackId={} | rating={}",
                template.getId(), saved.getId(), saved.getRating());
    }

    @Override
    public List<TemplateFeedbackResponseDTO> getFeedbackForTemplate(String templateId) {
        List<TemplateFeedback> feedbacks = feedbackRepository.findByTemplateId(templateId);
        return cvMapper.feedbacksToFeedbackResponses(feedbacks);
    }

    private UUID getAccountIdFromToken() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        return account.getId();
    }
}
