package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_payments")
@Getter
@Setter
public class SubscriptionPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subscription_payment_id")
    private Long subscriptionPaymentId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "subscription_id", nullable = false)
    private FarmSubscription subscription;

    @ManyToOne(optional = false)
    @JoinColumn(name = "payer_user_id", nullable = false)
    private User payerUser;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "method", nullable = false, length = 50)
    private String method;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus = "PENDING";

    @Column(name = "transaction_ref", length = 100, unique = true)
    private String transactionRef;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;
}