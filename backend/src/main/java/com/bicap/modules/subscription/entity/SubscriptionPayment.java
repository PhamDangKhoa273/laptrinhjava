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

    @ManyToOne
    @JoinColumn(name = "subscription_id", nullable = false)
    private FarmSubscription farmSubscription;

    @ManyToOne
    @JoinColumn(name = "payer_user_id", nullable = false)
    private User payerUser;

    private BigDecimal amount;
    private String method;
    private String transactionRef;
    private String paymentStatus;
    private LocalDateTime paidAt;

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long id) { this.paymentId = id; }
    public Long getSubscriptionPaymentId() { return paymentId; }
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
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime t) { this.paidAt = t; }
}
