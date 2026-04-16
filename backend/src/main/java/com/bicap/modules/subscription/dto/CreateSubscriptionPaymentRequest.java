package com.bicap.modules.subscription.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateSubscriptionPaymentRequest {
    @NotNull(message = "subscriptionId là bắt buộc")
    private Long subscriptionId;

    @NotNull(message = "amount là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = false, message = "amount phải lớn hơn 0")
    private BigDecimal amount;

    @NotBlank(message = "method là bắt buộc")
    private String method;

    private String transactionRef;
    private String paymentStatus;

    public Long getSubscriptionId() { return subscriptionId; }
    public void setSubscriptionId(Long id) { this.subscriptionId = id; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal d) { this.amount = d; }
    public String getMethod() { return method; }
    public void setMethod(String s) { this.method = s; }
    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String s) { this.transactionRef = s; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String s) { this.paymentStatus = s; }
}
