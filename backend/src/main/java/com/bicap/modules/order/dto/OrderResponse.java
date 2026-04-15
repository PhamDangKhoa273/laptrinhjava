package com.bicap.modules.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long orderId;
    private Long retailerId;
    private Long farmId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final OrderResponse response = new OrderResponse();

        public Builder orderId(Long orderId) {
            response.orderId = orderId;
            return this;
        }

        public Builder retailerId(Long retailerId) {
            response.retailerId = retailerId;
            return this;
        }

        public Builder farmId(Long farmId) {
            response.farmId = farmId;
            return this;
        }

        public Builder totalAmount(BigDecimal totalAmount) {
            response.totalAmount = totalAmount;
            return this;
        }

        public Builder status(String status) {
            response.status = status;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            response.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            response.updatedAt = updatedAt;
            return this;
        }

        public Builder items(List<OrderItemResponse> items) {
            response.items = items;
            return this;
        }

        public OrderResponse build() {
            return response;
        }
    }

    public Long getOrderId() {
        return orderId;
    }

    public Long getRetailerId() {
        return retailerId;
    }

    public Long getFarmId() {
        return farmId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public List<OrderItemResponse> getItems() {
        return items;
    }
}
