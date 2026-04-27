package com.bicap.core.dto;

import java.time.Instant;
import java.util.List;

public class ApiErrorResponse {
    private String code;
    private String message;
    private String traceId;
    private List<ApiErrorDetail> fieldErrors;
    private Instant timestamp;

    public ApiErrorResponse() {
        this.timestamp = Instant.now();
    }

    public static ApiErrorResponse of(String code, String message, String traceId, List<ApiErrorDetail> fieldErrors) {
        ApiErrorResponse response = new ApiErrorResponse();
        response.setCode(code);
        response.setMessage(message);
        response.setTraceId(traceId);
        response.setFieldErrors(fieldErrors);
        return response;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getTraceId() { return traceId; }
    public void setTraceId(String traceId) { this.traceId = traceId; }
    public List<ApiErrorDetail> getFieldErrors() { return fieldErrors; }
    public void setFieldErrors(List<ApiErrorDetail> fieldErrors) { this.fieldErrors = fieldErrors; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
