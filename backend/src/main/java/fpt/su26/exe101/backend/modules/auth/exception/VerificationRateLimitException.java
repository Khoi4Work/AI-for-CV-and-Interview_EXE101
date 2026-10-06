package fpt.su26.exe101.backend.modules.auth.exception;

import fpt.su26.exe101.backend.base.exception.*;

public class VerificationRateLimitException extends ApiException {
    private final long retrySeconds;
    public VerificationRateLimitException(long retrySeconds) {
        super(ErrorCode.TOO_MANY_REQUESTS, "Vui lòng chờ trước khi gửi lại email xác thực.");
        this.retrySeconds = Math.max(1, retrySeconds);
    }
    public long getRetrySeconds() { return retrySeconds; }
}
