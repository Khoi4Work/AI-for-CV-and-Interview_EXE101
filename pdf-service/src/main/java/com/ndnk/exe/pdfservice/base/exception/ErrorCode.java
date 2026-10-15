package com.ndnk.exe.pdfservice.base.exception;


import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * Centralized error codes for the entire application.
 */
@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    SUCCESS(1000, "Success", HttpStatus.OK),
    VALIDATION_ERROR(4000, "Validation failed", HttpStatus.BAD_REQUEST),
    MALFORMED_JSON(4001, "Malformed JSON request", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(4002, "Invalid request", HttpStatus.BAD_REQUEST),
    PDF_RENDER_FAILED(4220, "Chromium could not render the supplied HTML", HttpStatus.UNPROCESSABLE_ENTITY),
    UNSUPPORTED_MEDIA_TYPE(4150, "Unsupported media type", HttpStatus.UNSUPPORTED_MEDIA_TYPE),
    TOO_MANY_REQUESTS(4290, "Too many requests", HttpStatus.TOO_MANY_REQUESTS),
    UNEXPECTED_ERROR(5000, "Unexpected error", HttpStatus.INTERNAL_SERVER_ERROR),
    SERVICE_UNAVAILABLE(5030, "Service temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE);

    private final int code;
    private final String defaultMessage;
    private final HttpStatus status;
}
