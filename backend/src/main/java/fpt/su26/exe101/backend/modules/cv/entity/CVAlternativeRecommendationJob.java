package fpt.su26.exe101.backend.modules.cv.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Alternative;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity @Table(name="cv_alternative_jobs", uniqueConstraints=@UniqueConstraint(columnNames={"analysis_id"}))
@Getter @Setter
public class CVAlternativeRecommendationJob extends BaseEntity {
    @Column(name="analysis_id", nullable=false) private UUID analysisId;
    @Column(nullable=false) private String status = "PENDING";
    @JdbcTypeCode(SqlTypes.JSON) @Column(name="candidate_ids", columnDefinition="jsonb", nullable=false)
    private List<UUID> candidateIds = new ArrayList<>();
    @JdbcTypeCode(SqlTypes.JSON) @Column(name="analysis_ids", columnDefinition="jsonb", nullable=false)
    private List<UUID> analysisIds = new ArrayList<>();
    @JdbcTypeCode(SqlTypes.JSON) @Column(name="items", columnDefinition="jsonb", nullable=false)
    private List<Alternative> items = new ArrayList<>();
    @Column(name="failed_count", nullable=false) private int failedCount;
}
