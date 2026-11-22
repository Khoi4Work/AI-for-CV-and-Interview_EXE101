package fpt.su26.exe101.backend.modules.cv.dto.response;

import java.math.BigDecimal;
import java.math.RoundingMode;

final class CVAnalysisScorePrecision {
    private CVAnalysisScorePrecision() {}

    static BigDecimal toTwoDecimalPlaces(BigDecimal value) {
        return value == null ? null : value.setScale(2, RoundingMode.HALF_UP);
    }
}
