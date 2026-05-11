package com.bicap.modules.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class OrderDepositCallbackRequest {

    @NotNull(message = "orderId là bắt buộc")
    private Long orderId;

    @NotBlank(message = "transactionRef là bắt buộc")
    private String transactionRef;

    @NotBlank(message = "gatewayTransactionId là bắt buộc")
    private String gatewayTransactionId;

    @NotNull(message = "amount là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = false, message = "amount phải lớn hơn 0")
    private BigDecimal amount;

    @NotBlank(message = "currency là bắt buộc")
    private String currency;

    @NotBlank(message = "status là bắt buộc")
    private String status;

    @NotBlank(message = "signature là bắt buộc")
    private String signature;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public String getGatewayTransactionId() {
        return gatewayTransactionId;
    }

    public void setGatewayTransactionId(String gatewayTransactionId) {
        this.gatewayTransactionId = gatewayTransactionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
