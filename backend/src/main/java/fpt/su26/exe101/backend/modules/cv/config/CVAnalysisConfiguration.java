package fpt.su26.exe101.backend.modules.cv.config;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;
import fpt.su26.exe101.backend.modules.gallery.service.JobDescriptionNormalizationService;
import java.util.List;
import java.util.Map;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

/** Runtime wiring for the persistent CV analysis workflow. Database schema is always applied manually. */
@Configuration
@EnableScheduling
public class CVAnalysisConfiguration {
    /** Fail fast only when the feature is enabled and its manually managed schema is incomplete. */
    @Bean
    @Order(0)
    @ConditionalOnProperty(name="cv.analysis.enabled", havingValue="true")
    public ApplicationRunner cvAnalysisSchemaReadiness(JdbcTemplate jdbc) {
        return args -> {
            for (String table : List.of("cv_analyses","cv_analysis_requests","cv_alternative_jobs","job_descriptions","company_info")) {
                String found = jdbc.queryForObject("select to_regclass(?)::text",String.class,table);
                if(found==null) throw new ApiException(ErrorCode.SERVICE_UNAVAILABLE,"Apply the manual CV analysis migration before enabling CV_ANALYSIS_ENABLED: missing " + table);
            }
            Map<String, List<String>> columns = Map.of(
                "cv_analyses", List.of("quota_status"),
                "job_descriptions", List.of("normalization_metadata", "normalization_hash", "normalization_version",
                    "extraction_status", "extraction_lease_until", "extraction_claim_token"),
                "company_info", List.of("culture_source_url", "culture_reference_date", "culture_verified"));
            for (Map.Entry<String, List<String>> entry : columns.entrySet()) for (String column : entry.getValue()) {
                Boolean found = jdbc.queryForObject("select exists(select 1 from pg_attribute where attrelid=to_regclass(?) and attname=? and not attisdropped)", Boolean.class, entry.getKey(), column);
                if (!Boolean.TRUE.equals(found)) throw new ApiException(ErrorCode.SERVICE_UNAVAILABLE,
                    "Apply the revised manual migration: missing " + entry.getKey() + "." + column);
            }
        };
    }
    /** Short transactions isolate queue claiming from provider calls. */
    @Bean public TransactionTemplate cvAnalysisTransactionTemplate(PlatformTransactionManager manager) {
        return new TransactionTemplate(manager);
    }
    /** Optional metadata-only batch for existing JDs; disabled unless explicitly enabled. */
    @Bean
    @Order(1)
    @ConditionalOnProperty(name="cv.jd-metadata.backfill-enabled", havingValue="true")
    public ApplicationRunner jdMetadataBackfill(JobDescriptionNormalizationService normalization) {
        return args -> {int page=0;while(normalization.backfillMetadata(page++,200)>0) { /* Each JD is its own short transaction; no AI calls. */ }};
    }
}
