package fpt.su26.exe101.backend.modules.gallery.exception;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;

/** Signals that another worker owns the requirement-extraction lease; the analysis remains queued. */
public class JobDescriptionRequirementsPendingException extends ApiException {
    public JobDescriptionRequirementsPendingException() {
        super(ErrorCode.SERVICE_UNAVAILABLE, "Các yêu cầu JD đang được xử lý.");
    }
}
