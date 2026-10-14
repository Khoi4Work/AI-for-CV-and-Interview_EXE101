package fpt.su26.exe101.backend.modules.cv.exception;

import fpt.su26.exe101.backend.base.exception.ApiException;
import fpt.su26.exe101.backend.base.exception.ErrorCode;

/**
 * Expected invalid or insufficient CV/JD evidence. The shared ApiException handler still maps
 * its ErrorCode for HTTP requests; the worker catches this subtype to persist an evidence state
 * and refund quota instead of treating it as a provider/system failure.
 */
public class CVAnalysisValidationException extends ApiException {
    public CVAnalysisValidationException(String message) {
        super(ErrorCode.INVALID_INPUT, message);
    }

    public CVAnalysisValidationException(String message, Throwable cause) {
        this(message);
        initCause(cause);
    }
}
