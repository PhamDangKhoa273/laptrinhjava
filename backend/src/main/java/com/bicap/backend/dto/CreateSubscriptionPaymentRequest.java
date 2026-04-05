package com.bicap.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateSubscriptionPaymentRequest {

    @NotNull(message = "subscriptionId không được để trống")
    private Long subscriptionId;

    @NotNull(message = "amount không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "amount phải lớn hơn 0")
    private BigDecimal amount;

    @NotBlank(message = "method không được để trống")
    private String method;

    private String paymentStatus;
    private String transactionRef;
}
