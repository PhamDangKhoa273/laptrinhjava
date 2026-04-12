package com.bicap.modules.subscription.dto;

import java.math.BigDecimal;

public class CreateSubscriptionPaymentRequest {
    private Long subscriptionId;
    private BigDecimal amount;
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
