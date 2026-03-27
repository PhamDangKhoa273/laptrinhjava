package com.bicap.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CreateSubscriptionPaymentRequest {
    private Long subscriptionId;
    private Long payerUserId;
    private BigDecimal amount;
    private String method;
    private String paymentStatus;
    private String transactionRef;
    private LocalDateTime paidAt;
}