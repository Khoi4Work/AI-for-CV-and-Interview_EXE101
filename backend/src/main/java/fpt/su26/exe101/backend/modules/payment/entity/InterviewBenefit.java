package fpt.su26.exe101.backend.modules.payment.entity;

import fpt.su26.exe101.backend.base.persistence.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "interview_benefit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewBenefit extends BaseEntity {
    @OneToOne
    @JoinColumn(name = "service_id", nullable = false, unique = true)
    private PaymentServiceEntity service;

    @Column(name = "max_duration_min", nullable = false)
    private Integer maxDurationMin;

    @Column(name = "allow_recording", nullable = false)
    private Boolean allowRecording = false;

    @Column(name = "allow_deep_feedbk", nullable = false)
    private Boolean allowDeepFeedbk = false;

    @Column(name = "allow_comp_culture", nullable = false)
    private Boolean allowCompCulture = false;
}
