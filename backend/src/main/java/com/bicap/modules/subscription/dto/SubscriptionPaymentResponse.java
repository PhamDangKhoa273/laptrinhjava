package com.bicap.modules.subscription.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SubscriptionPaymentResponse {
    private Long paymentId;
    private Long subscriptionId;
    private String farmName;
    private Long payerUserId;
    private String payerName;
    private BigDecimal amount;
    private String method;
    private String paymentStatus;
    private String transactionRef;
    private LocalDateTime paidAt;

    public void setPaymentId(Long id) { this.paymentId = id; }
    public void setSubscriptionId(Long id) { this.subscriptionId = id; }
    public void setFarmName(String s) { this.farmName = s; }
    public void setPayerUserId(Long id) { this.payerUserId = id; }
    public void setPayerName(String s) { this.payerName = s; }
    public void setAmount(BigDecimal d) { this.amount = d; }
    public void setMethod(String s) { this.method = s; }
    public void setPaymentStatus(String s) { this.paymentStatus = s; }
    public void setTransactionRef(String s) { this.transactionRef = s; }
    public void setPaidAt(LocalDateTime t) { this.paidAt = t; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private SubscriptionPaymentResponse r = new SubscriptionPaymentResponse();
        public Builder paymentId(Long l) { r.setPaymentId(l); return this; }
        public Builder subscriptionPaymentId(Long l) { r.setPaymentId(l); return this; }
        public Builder subscriptionId(Long l) { r.setSubscriptionId(l); return this; }
        public Builder farmName(String s) { r.setFarmName(s); return this; }
        public Builder payerUserId(Long l) { r.setPayerUserId(l); return this; }
        public Builder payerFullName(String s) { r.setPayerName(s); return this; }
        public Builder amount(BigDecimal d) { r.setAmount(d); return this; }
        public Builder method(String s) { r.setMethod(s); return this; }
        public Builder paymentStatus(String s) { r.setPaymentStatus(s); return this; }
        public Builder transactionRef(String s) { r.setTransactionRef(s); return this; }
        public Builder paidAt(LocalDateTime t) { r.setPaidAt(t); return this; }
        public SubscriptionPaymentResponse build() { return r; }
    }
}
