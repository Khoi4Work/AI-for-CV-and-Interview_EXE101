package com.ndnk.exe.pdfservice.base.exception;

import com.ndnk.exe.pdfservice.base.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(
            ApiException exception, HttpServletRequest request) {
        ErrorCode error = exception.getErrorCode();
        return error(error, exception.getMessage(), request.getRequestURI(), null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(
            MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(fieldError ->
                errors.put(fieldError.getField(), fieldError.getDefaultMessage()));
        return error(ErrorCode.VALIDATION_ERROR, ErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                request.getRequestURI(), errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(
            ConstraintViolationException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage()));
        return error(ErrorCode.VALIDATION_ERROR, ErrorCode.VALIDATION_ERROR.getDefaultMessage(),
                request.getRequestURI(), errors);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleMalformedJson(HttpServletRequest request) {
        return error(ErrorCode.MALFORMED_JSON, ErrorCode.MALFORMED_JSON.getDefaultMessage(),
                request.getRequestURI(), null);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(HttpServletRequest request) {
        return error(ErrorCode.UNEXPECTED_ERROR, ErrorCode.UNEXPECTED_ERROR.getDefaultMessage(),
                request.getRequestURI(), null);
    }

    private ResponseEntity<ApiResponse<Object>> error(
            ErrorCode error, String message, String path, Map<String, String> details) {
        ApiResponse<Object> body = ApiResponse.<Object>builder()
                .code(error.getCode())
                .message(message)
                .errors(details)
                .timestamp(Instant.now())
                .path(path)
                .build();
        return ResponseEntity.status(error.getStatus()).body(body);
    }
}
