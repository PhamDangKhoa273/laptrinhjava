package com.bicap.modules.subscription.entity;
import com.bicap.modules.user.entity.User;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_payments")
public class SubscriptionPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_payment_id")
    private Long paymentId;

    @Version
    private Long version;

    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private FarmSubscription farmSubscription;

    @ManyToOne
    @JoinColumn(name = "payer_user_id", nullable = false)
    private User payerUser;

    private BigDecimal amount;
    private String method;
    private String transactionRef;
    private String gatewayTransactionId;
    private String gatewaySignature;
    private String currency;
    private String paymentStatus;
    private LocalDateTime paidAt;
    private String idempotencyKey;

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long id) { this.paymentId = id; }
    public Long getSubscriptionPaymentId() { return paymentId; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public FarmSubscription getFarmSubscription() { return farmSubscription; }
    public void setFarmSubscription(FarmSubscription s) { this.farmSubscription = s; }
    public User getPayerUser() { return payerUser; }
    public void setPayerUser(User u) { this.payerUser = u; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal d) { this.amount = d; }
    public String getMethod() { return method; }
    public void setMethod(String s) { this.method = s; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String s) { this.paymentStatus = s; }
    public String getTransactionRef() { return transactionRef; }
    public void setTransactionRef(String s) { this.transactionRef = s; }
    public String getGatewayTransactionId() { return gatewayTransactionId; }
    public void setGatewayTransactionId(String s) { this.gatewayTransactionId = s; }
    public String getGatewaySignature() { return gatewaySignature; }
    public void setGatewaySignature(String s) { this.gatewaySignature = s; }
    public String getCurrency() { return currency; }
    public void setCurrency(String s) { this.currency = s; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime t) { this.paidAt = t; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}
