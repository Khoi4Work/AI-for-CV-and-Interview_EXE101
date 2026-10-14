package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.repository.AccountRepository;
import fpt.su26.exe101.backend.modules.cv.dto.response.CVTemplateResponseDTO;
import fpt.su26.exe101.backend.modules.cv.entity.CVTemplate;
import fpt.su26.exe101.backend.modules.cv.entity.enums.TemplateAccessLevel;
import fpt.su26.exe101.backend.modules.cv.mapper.CVMapper;
import fpt.su26.exe101.backend.modules.cv.repository.CVTemplateRepository;
import fpt.su26.exe101.backend.modules.cv.repository.TemplateFeedbackRepository;
import fpt.su26.exe101.backend.modules.quota.service.UsageQuotaService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TemplateServiceImplTest {
    @Mock CVTemplateRepository templates;
    @Mock TemplateFeedbackRepository feedback;
    @Mock CVMapper mapper;
    @Mock AccountRepository accounts;
    @Mock UsageQuotaService quotas;
    @InjectMocks TemplateServiceImpl service;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void enhancePlanUnlocksTemplatesAtEveryCatalogTier() {
        String email = "enhance@example.com";
        UUID accountId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, "", List.of()));
        Account account = new Account();
        account.setId(accountId);
        account.setEmail(email);

        List<CVTemplate> rows = List.of(
                template("free", TemplateAccessLevel.FREE),
                template("middle", TemplateAccessLevel.MIDDLE),
                template("enhance", TemplateAccessLevel.ENHANCE));
        List<CVTemplateResponseDTO> responses = rows.stream()
                .map(row -> CVTemplateResponseDTO.builder().id(row.getId()).build())
                .toList();
        when(accounts.findByEmail(email)).thenReturn(Optional.of(account));
        when(quotas.getCvPlan(accountId)).thenReturn(UserPlan.ENHANCE);
        when(templates.findAll()).thenReturn(rows);
        when(mapper.templatesToTemplateResponses(rows)).thenReturn(responses);

        assertTrue(service.getAllTemplates().stream().noneMatch(CVTemplateResponseDTO::isLocked));
    }

    private CVTemplate template(String id, TemplateAccessLevel minimumPlan) {
        return CVTemplate.builder().id(id).name(id).minimumPlan(minimumPlan).build();
    }
}
