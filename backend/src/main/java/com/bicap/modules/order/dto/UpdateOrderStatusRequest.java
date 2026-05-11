package com.bicap.modules.order.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateOrderStatusRequest {
    
    @NotBlank(message = "Trạng thái đơn hàng không được để trống")
    private String status;
    
    private String reason;
    private String idempotencyKey;

    public UpdateOrderStatusRequest() {
    }

    public UpdateOrderStatusRequest(String status, String reason) {
        this.status = status;
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}
