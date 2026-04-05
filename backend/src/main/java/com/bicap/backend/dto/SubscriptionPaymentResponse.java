package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class SubscriptionPaymentResponse {
    private Long subscriptionPaymentId;
    private Long subscriptionId;
    private Long payerUserId;
    private String payerFullName;
    private BigDecimal amount;
    private String method;
    private String paymentStatus;
    private String transactionRef;
    private LocalDateTime paidAt;
}
