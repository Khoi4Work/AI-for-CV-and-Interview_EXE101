package fpt.su26.exe101.backend.modules.gallery.service.impl;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.gallery.dto.request.TemplateFeedbackRequestDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.dto.response.TemplateFeedbackResponseDTO;
import fpt.su26.exe101.backend.modules.gallery.entity.*;
import fpt.su26.exe101.backend.modules.gallery.mapper.GalleryMapper;
import fpt.su26.exe101.backend.modules.gallery.repository.*;
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
public class TemplateServiceImpl implements fpt.su26.exe101.backend.modules.gallery.service.TemplateService {
    private final CVTemplateRepository templateRepository;
    private final TemplateFeedbackRepository feedbackRepository;
    private final GalleryMapper galleryMapper;
    private final AccountRepository accountRepository;

    @Override
    public List<CVTemplateResponseDTO> getAllTemplates() {
        return galleryMapper.templatesToTemplateResponses(templateRepository.findAll());
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

        feedbackRepository.save(feedback);
    }

    @Override
    public List<TemplateFeedbackResponseDTO> getFeedbackForTemplate(UUID templateId) {
        List<TemplateFeedback> feedbacks = feedbackRepository.findByTemplateId(templateId);
        return galleryMapper.feedbacksToFeedbackResponses(feedbacks);
    }

    private UUID getAccountIdFromToken() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        return account.getId();
    }
}
