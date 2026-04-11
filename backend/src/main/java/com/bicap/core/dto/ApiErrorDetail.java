package com.bicap.core.dto;

public class ApiErrorDetail {
    private String field;
    private String code;
    private String message;

    public ApiErrorDetail() {}

    public ApiErrorDetail(String field, String code, String message) {
        this.field = field;
        this.code = code;
        this.message = message;
    }

    public String getField() { return field; }
    public void setField(String s) { this.field = s; }
    public String getCode() { return code; }
    public void setCode(String s) { this.code = s; }
    public String getMessage() { return message; }
    public void setMessage(String s) { this.message = s; }
}
