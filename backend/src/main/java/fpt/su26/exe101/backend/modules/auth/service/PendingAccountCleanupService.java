package fpt.su26.exe101.backend.modules.auth.service;

import fpt.su26.exe101.backend.base.enums.UserPlan;
import fpt.su26.exe101.backend.modules.auth.entity.Account;
import fpt.su26.exe101.backend.modules.auth.entity.enums.AccountProvider;
import fpt.su26.exe101.backend.modules.quota.config.QuotaBenefitConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Removes registration shells only; any evidence of account use prevents deletion. */
@Service
public class PendingAccountCleanupService {
    private final EntityManager entityManager;
    private final JdbcTemplate jdbc;
    private final QuotaBenefitConfig quotaConfig;
    private final int retentionDays;
    private final int resendGraceHours;

    public PendingAccountCleanupService(EntityManager entityManager, JdbcTemplate jdbc,
            QuotaBenefitConfig quotaConfig,
            @Value("${app.auth.pending-cleanup.retention-days:2}") int retentionDays,
            @Value("${app.auth.pending-cleanup.resend-grace-hours:24}") int resendGraceHours) {
        if (retentionDays < 1 || resendGraceHours < 1) {
            throw new IllegalArgumentException("Pending cleanup retention and grace must be positive");
        }
        this.entityManager = entityManager;
        this.jdbc = jdbc;
        this.quotaConfig = quotaConfig;
        this.retentionDays = retentionDays;
        this.resendGraceHours = resendGraceHours;
    }

    public List<UUID> findCandidates(LocalDateTime now, UUID afterId, int batchSize) {
        // Both dates matter: migration gives legacy registrations a fresh two-day grace.
        String sql = """
                SELECT id FROM account
                WHERE provider = 'LOCAL' AND status = 'PENDING_VERIFICATION'
                  AND verified_at IS NULL AND created_at <= ? AND verification_managed_at <= ?
                  AND (verification_last_sent_at IS NULL OR verification_last_sent_at <= ?)
                  AND (verification_expires_at IS NULL OR verification_expires_at <= ?)
                """;
        Object[] args;
        if (afterId == null) {
            args = new Object[]{now.minusDays(retentionDays), now.minusDays(retentionDays),
                    now.minusHours(resendGraceHours), now, batchSize};
        } else {
            sql += " AND id > ?";
            args = new Object[]{now.minusDays(retentionDays), now.minusDays(retentionDays),
                    now.minusHours(resendGraceHours), now, afterId, batchSize};
        }
        return jdbc.query(sql + " ORDER BY id LIMIT ?", (rs, row) -> rs.getObject("id", UUID.class), args);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Result cleanAccount(UUID id, LocalDateTime now, boolean dryRun) {
        // Verification/resend use the same account row lock. Recheck after acquiring it.
        Account account = entityManager.find(Account.class, id, LockModeType.PESSIMISTIC_WRITE);
        if (!eligible(account, now) || hasActivity(id)) return Result.SKIPPED;
        if (dryRun) return Result.WOULD_DELETE;

        jdbc.update("DELETE FROM verification_mail_outbox WHERE account_id = ?", id);
        jdbc.update("DELETE FROM attendance_info WHERE attendance_id IN (SELECT id FROM attendance WHERE account_id = ?)", id);
        jdbc.update("DELETE FROM partner_info WHERE partner_id IN (SELECT id FROM partner WHERE account_id = ?)", id);
        jdbc.update("DELETE FROM attendance WHERE account_id = ?", id);
        jdbc.update("DELETE FROM partner WHERE account_id = ?", id);
        jdbc.update("DELETE FROM gallery WHERE account_id = ?", id);
        jdbc.update("DELETE FROM user_usage_quotas WHERE account_id = ?", id);
        entityManager.remove(account);
        // An unexpected/new FK fails this transaction rather than cascading business data.
        entityManager.flush();
        return Result.DELETED;
    }

    boolean eligible(Account account, LocalDateTime now) {
        return account != null && account.getProvider() == AccountProvider.LOCAL
                && "PENDING_VERIFICATION".equals(account.getStatus()) && account.getVerifiedAt() == null
                && account.getCreatedAt() != null
                && !account.getCreatedAt().isAfter(now.minusDays(retentionDays))
                && account.getVerificationManagedAt() != null
                && !account.getVerificationManagedAt().isAfter(now.minusDays(retentionDays))
                && (account.getVerificationExpiresAt() == null || !account.getVerificationExpiresAt().isAfter(now))
                && (account.getVerificationLastSentAt() == null
                    || !account.getVerificationLastSentAt().isAfter(now.minusHours(resendGraceHours)));
    }

    private boolean hasActivity(UUID id) {
        Boolean businessData = jdbc.queryForObject("""
                SELECT EXISTS (
                  SELECT 1 FROM token WHERE account_id = ?
                  UNION ALL SELECT 1 FROM account_provider WHERE account_id = ?
                  UNION ALL SELECT 1 FROM orders WHERE account_id = ?
                  UNION ALL SELECT 1 FROM template_feedback WHERE account_id = ?
                  UNION ALL SELECT 1 FROM feedbacks WHERE created_by = ?
                  UNION ALL SELECT 1 FROM cv_templates WHERE created_by = ?
                  UNION ALL SELECT 1 FROM question_bank WHERE created_by = ?
                  UNION ALL SELECT 1 FROM questions WHERE created_by = ?
                  UNION ALL SELECT 1 FROM company_info WHERE created_by = ?
                  UNION ALL SELECT 1 FROM invitation WHERE inviter_id = ?
                  UNION ALL SELECT 1 FROM company_member cm JOIN partner p
                    ON p.id = cm.partner_id OR p.id = cm.company_id WHERE p.account_id = ?
                  UNION ALL SELECT 1 FROM invitation i JOIN partner p ON p.id = i.company_id WHERE p.account_id = ?
                  UNION ALL SELECT 1 FROM cvs c JOIN gallery g ON g.id = c.gallery_id WHERE g.account_id = ?
                  UNION ALL SELECT 1 FROM job_descriptions j JOIN gallery g ON g.id = j.gallery_id WHERE g.account_id = ?
                  UNION ALL SELECT 1 FROM interview_sessions s JOIN gallery g ON g.id = s.gallery_id WHERE g.account_id = ?
                  UNION ALL SELECT 1 FROM attendance_info i JOIN attendance a ON a.id = i.attendance_id
                    WHERE a.account_id = ? AND (i.bio IS NOT NULL OR i.career_goal IS NOT NULL
                    OR i.experience_level IS NOT NULL OR i.phone IS NOT NULL OR i.location IS NOT NULL
                    OR i.profession IS NOT NULL OR i.linkedin IS NOT NULL OR i.portfolio IS NOT NULL OR i.github IS NOT NULL)
                  UNION ALL SELECT 1 FROM partner_info i JOIN partner p ON p.id = i.partner_id
                    WHERE p.account_id = ? AND (i.industry IS NOT NULL OR i.company_size IS NOT NULL
                    OR i.phone IS NOT NULL OR i.location IS NOT NULL OR i.profession IS NOT NULL
                    OR i.linkedin IS NOT NULL OR i.portfolio IS NOT NULL OR i.github IS NOT NULL)
                )
                """, Boolean.class, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id, id);
        if (!Boolean.FALSE.equals(businessData)) return true;
        QuotaBenefitConfig.QuotaBenefit free = quotaConfig.getBenefit(UserPlan.FREE);
        Boolean changedQuota = jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM user_usage_quotas WHERE account_id = ? AND (
                  cv_plan <> 'FREE' OR interview_plan <> 'FREE' OR remaining_cv_cnt <> ?
                  OR remaining_cv_ai_cnt <> ? OR remaining_int_min <> 0
                  OR cv_period_start IS NOT NULL OR cv_period_end IS NOT NULL
                  OR interview_period_start IS NOT NULL OR interview_period_end IS NOT NULL))
                """, Boolean.class, id, free.getCvCnt(), free.getAiCvCnt());
        return !Boolean.FALSE.equals(changedQuota);
    }

    public enum Result { SKIPPED, WOULD_DELETE, DELETED }
}
