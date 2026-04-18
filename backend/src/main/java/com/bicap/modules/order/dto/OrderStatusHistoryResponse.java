package com.bicap.modules.order.dto;

import java.time.LocalDateTime;

public class OrderStatusHistoryResponse {
    
    private Long historyId;
    private Long orderId;
    private String previousStatus;
    private String newStatus;
    private String reason;
    private String blockchainTxHash;
    private LocalDateTime changedAt;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final OrderStatusHistoryResponse response = new OrderStatusHistoryResponse();

        public Builder historyId(Long historyId) {
            response.historyId = historyId;
            return this;
        }

        public Builder orderId(Long orderId) {
            response.orderId = orderId;
            return this;
        }

        public Builder previousStatus(String previousStatus) {
            response.previousStatus = previousStatus;
            return this;
        }

        public Builder newStatus(String newStatus) {
            response.newStatus = newStatus;
            return this;
        }

        public Builder reason(String reason) {
            response.reason = reason;
            return this;
        }

        public Builder blockchainTxHash(String blockchainTxHash) {
            response.blockchainTxHash = blockchainTxHash;
            return this;
        }

        public Builder changedAt(LocalDateTime changedAt) {
            response.changedAt = changedAt;
            return this;
        }

        public OrderStatusHistoryResponse build() {
            return response;
        }
    }

    public Long getHistoryId() {
        return historyId;
    }

    public void setHistoryId(Long historyId) {
        this.historyId = historyId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(String newStatus) {
        this.newStatus = newStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getBlockchainTxHash() {
        return blockchainTxHash;
    }

    public void setBlockchainTxHash(String blockchainTxHash) {
        this.blockchainTxHash = blockchainTxHash;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }
}
