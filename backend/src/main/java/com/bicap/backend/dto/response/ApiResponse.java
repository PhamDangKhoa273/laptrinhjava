package com.bicap.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String code;
    private String message;
    private T data;
    private Object errors;
    private Instant timestamp;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .code("SUCCESS")
                .message(message)
                .data(data)
                .errors(null)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success("OK", data);
    }

    public static <T> ApiResponse<T> error(String code, String message, Object errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(code)
                .message(message)
                .data(null)
                .errors(errors)
                .timestamp(Instant.now())
                .build();
    }
}
