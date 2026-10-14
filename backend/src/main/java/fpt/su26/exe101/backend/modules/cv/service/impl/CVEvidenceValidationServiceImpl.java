package fpt.su26.exe101.backend.modules.cv.service.impl;

import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementAssessment;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Evidence;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Extraction;
import fpt.su26.exe101.backend.modules.cv.entity.enums.RequirementGroup;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Quote;
import fpt.su26.exe101.backend.modules.cv.dto.AnalysisContract.Snapshot;
import fpt.su26.exe101.backend.modules.cv.exception.CVAnalysisValidationException;
import fpt.su26.exe101.backend.modules.cv.service.CVEvidenceValidationService;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class CVEvidenceValidationServiceImpl implements CVEvidenceValidationService {
    @Override public void validate(Snapshot snapshot, Extraction extraction) {
        if (snapshot.truncated()) throw new CVAnalysisValidationException("CV đọc chưa đầy đủ; cần bản CV có nội dung đọc được.");
        if (extraction == null || extraction.requirements() == null || extraction.requirements().isEmpty()
                || extraction.requirements().size() > 80) throw new CVAnalysisValidationException("Không đủ yêu cầu JD để đối chiếu.");
        Set<String> ids = new HashSet<>();
        for (Evidence e : extraction.requirements()) {
            if (e == null || e.requirementId() == null || !ids.add(e.requirementId()) || e.group() == null
                    || e.group() == RequirementGroup.CLARITY || e.assessment() == null || e.assessment() == RequirementAssessment.UNCERTAIN
                    || e.assessment() == RequirementAssessment.NOT_APPLICABLE || e.description() == null || e.description().isBlank()
                    || e.reason() == null || e.reason().isBlank()) throw new CVAnalysisValidationException("Yêu cầu hoặc kết luận chưa đủ cơ sở.");
            checkQuote(snapshot.jdText(), e.jdEvidence(), "jd");
            if (e.cvEvidence() == null) throw new CVAnalysisValidationException("cvEvidence phải là một danh sách.");
            for (Quote q : e.cvEvidence()) checkQuote(snapshot.cvText(), q, "cv");
            if (e.assessment() == RequirementAssessment.NOT_EVIDENCED && !e.cvEvidence().isEmpty())
                throw new CVAnalysisValidationException("Chưa có minh chứng không được kèm minh chứng đã đạt.");
            if ((e.assessment() == RequirementAssessment.MET || e.assessment() == RequirementAssessment.PARTIAL) && e.cvEvidence().isEmpty())
                throw new CVAnalysisValidationException("Kết luận đạt cần minh chứng CV.");
        }
    }
    private void checkQuote(String input, Quote quote, String anchor) {
        if (quote == null || !anchor.equals(quote.anchor()) || quote.text() == null || quote.text().trim().length() < 3
                || !normalize(input).contains(normalize(quote.text())))
            throw new CVAnalysisValidationException("Trích đoạn hoặc anchor không có trong snapshot " + anchor + ".");
    }
    private String normalize(String text) { return Objects.toString(text, "").replaceAll("\\s+", " ").trim(); }
}
