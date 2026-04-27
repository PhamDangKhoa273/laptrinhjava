package com.bicap.modules.order.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class OrderDepositRequest {

    @NotNull(message = "amount là bắt buộc")
    @DecimalMin(value = "0.0", inclusive = false, message = "amount phải lớn hơn 0")
    private BigDecimal amount;

    @NotBlank(message = "transactionRef là bắt buộc")
    private String transactionRef;

    @NotBlank(message = "method là bắt buộc")
    private String method;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getTransactionRef() {
        return transactionRef;
    }

    public void setTransactionRef(String transactionRef) {
        this.transactionRef = transactionRef;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }
}
