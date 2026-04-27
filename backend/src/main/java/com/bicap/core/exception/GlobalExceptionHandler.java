package com.bicap.core.exception;

import com.bicap.core.dto.ApiErrorDetail;
import com.bicap.core.dto.ApiErrorResponse;
import com.bicap.core.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @Value("${app.errors.include-stacktrace:false}")
    private boolean includeStacktrace;

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusiness(BusinessException ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(ApiResponse.error("BUSINESS_ERROR", ex.getMessage(), errorPayload(null, request)));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("NOT_FOUND", ex.getMessage(), errorPayload(null, request)));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<ApiErrorDetail> errors = new ArrayList<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.add(new ApiErrorDetail(fieldError.getField(), fieldError.getCode(), fieldError.getDefaultMessage()));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "Dữ liệu không hợp lệ", errorPayload(errors, request)));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        List<ApiErrorDetail> errors = ex.getConstraintViolations().stream()
                .map(v -> new ApiErrorDetail(v.getPropertyPath().toString(), "CONSTRAINT_VIOLATION", v.getMessage()))
                .toList();
        return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", "Dữ liệu không hợp lệ", errorPayload(errors, request)));
    }

    @ExceptionHandler({AuthenticationException.class, UsernameNotFoundException.class})
    public ResponseEntity<ApiResponse<Object>> handleAuthentication(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("UNAUTHORIZED", "Email hoặc mật khẩu không đúng", errorPayload(null, request)));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("FORBIDDEN", "Bạn không có quyền truy cập", errorPayload(null, request)));
    }

    @ExceptionHandler({IllegalArgumentException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(Exception ex, HttpServletRequest request) {
        return ResponseEntity.badRequest().body(ApiResponse.error("VALIDATION_ERROR", ex.getMessage(), errorPayload(null, request)));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleOther(Exception ex, HttpServletRequest request) {
        ex.printStackTrace();
        if (includeStacktrace) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error(
                    "INTERNAL_SERVER_ERROR",
                    ex.getMessage(),
                    errorPayload(List.of(new ApiErrorDetail("exception", ex.getClass().getSimpleName(), buildStackTrace(ex))), request)
            ));
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("INTERNAL_SERVER_ERROR", "Đã có lỗi hệ thống xảy ra", errorPayload(null, request)));
    }

    private ApiErrorResponse errorPayload(List<ApiErrorDetail> fieldErrors, HttpServletRequest request) {
        String traceId = request != null ? request.getHeader("X-Trace-Id") : null;
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString();
        }
        return ApiErrorResponse.of(null, null, traceId, fieldErrors);
    }

    private String buildStackTrace(Exception ex) {
        java.io.StringWriter sw = new java.io.StringWriter();
        java.io.PrintWriter pw = new java.io.PrintWriter(sw);
        ex.printStackTrace(pw);
        return sw.toString();
    }
}
