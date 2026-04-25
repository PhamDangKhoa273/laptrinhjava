package com.bicap.modules.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long orderId;
    private Long retailerId;
    private Long farmId;
    private String retailerName;
    private String farmName;
    private BigDecimal totalAmount;
    private String status;
    private String paymentStatus;
    private BigDecimal depositAmount;

    private LocalDateTime depositPaidAt;

    private BigDecimal minimumDepositAmount;
    private LocalDateTime depositPaidAt;
    private LocalDateTime depositReleasedAt;
    private Long depositReleasedByUserId;
    private String depositReleaseNote;

    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime deliveryConfirmedAt;
    private Long deliveryConfirmedByUserId;
    private String deliveryProofImageUrl;
    private String shippingProofImageUrl;


    private Boolean canPayDeposit;
    private Boolean canCancel;
    private Boolean canConfirmDelivery;
    private Boolean canUploadDeliveryProof;
    private Boolean canUpdateShippingProof;
    private List<String> allowedActions;

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

        public Builder paymentStatus(String paymentStatus) {
            response.paymentStatus = paymentStatus;
            return this;
        }

        public Builder depositAmount(BigDecimal depositAmount) {
            response.depositAmount = depositAmount;
            return this;
        }

        public Builder depositPaidAt(LocalDateTime depositPaidAt) {
            response.depositPaidAt = depositPaidAt;
            return this;
        }

        public Builder cancellationReason(String cancellationReason) {
            response.cancellationReason = cancellationReason;
            return this;
        }

        public Builder cancelledAt(LocalDateTime cancelledAt) {
            response.cancelledAt = cancelledAt;
            return this;
        }

        public Builder deliveryConfirmedAt(LocalDateTime deliveryConfirmedAt) {
            response.deliveryConfirmedAt = deliveryConfirmedAt;
            return this;
        }

        public Builder deliveryConfirmedByUserId(Long deliveryConfirmedByUserId) {
            response.deliveryConfirmedByUserId = deliveryConfirmedByUserId;
            return this;
        }

        public Builder deliveryProofImageUrl(String deliveryProofImageUrl) {
            response.deliveryProofImageUrl = deliveryProofImageUrl;
            return this;
        }

        public Builder shippingProofImageUrl(String shippingProofImageUrl) {
            response.shippingProofImageUrl = shippingProofImageUrl;
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

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public LocalDateTime getDepositPaidAt() {
        return depositPaidAt;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public LocalDateTime getDeliveryConfirmedAt() {
        return deliveryConfirmedAt;
    }

    public Long getDeliveryConfirmedByUserId() {
        return deliveryConfirmedByUserId;
    }

    public String getDeliveryProofImageUrl() {
        return deliveryProofImageUrl;
    }

    public String getShippingProofImageUrl() {
        return shippingProofImageUrl;
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

      public Builder orderId(Long orderId) { response.orderId = orderId; return this; }
        public Builder retailerId(Long retailerId) { response.retailerId = retailerId; return this; }
        public Builder farmId(Long farmId) { response.farmId = farmId; return this; }
        public Builder retailerName(String retailerName) { response.retailerName = retailerName; return this; }
        public Builder farmName(String farmName) { response.farmName = farmName; return this; }
        public Builder totalAmount(BigDecimal totalAmount) { response.totalAmount = totalAmount; return this; }
        public Builder status(String status) { response.status = status; return this; }
        public Builder paymentStatus(String paymentStatus) { response.paymentStatus = paymentStatus; return this; }
        public Builder depositAmount(BigDecimal depositAmount) { response.depositAmount = depositAmount; return this; }
        public Builder minimumDepositAmount(BigDecimal minimumDepositAmount) { response.minimumDepositAmount = minimumDepositAmount; return this; }
        public Builder depositPaidAt(LocalDateTime depositPaidAt) { response.depositPaidAt = depositPaidAt; return this; }
        public Builder depositReleasedAt(LocalDateTime depositReleasedAt) { response.depositReleasedAt = depositReleasedAt; return this; }
        public Builder depositReleasedByUserId(Long depositReleasedByUserId) { response.depositReleasedByUserId = depositReleasedByUserId; return this; }
        public Builder depositReleaseNote(String depositReleaseNote) { response.depositReleaseNote = depositReleaseNote; return this; }
        public Builder cancellationReason(String cancellationReason) { response.cancellationReason = cancellationReason; return this; }
        public Builder cancelledAt(LocalDateTime cancelledAt) { response.cancelledAt = cancelledAt; return this; }
        public Builder deliveryConfirmedAt(LocalDateTime deliveryConfirmedAt) { response.deliveryConfirmedAt = deliveryConfirmedAt; return this; }
        public Builder deliveryConfirmedByUserId(Long deliveryConfirmedByUserId) { response.deliveryConfirmedByUserId = deliveryConfirmedByUserId; return this; }
        public Builder deliveryProofImageUrl(String deliveryProofImageUrl) { response.deliveryProofImageUrl = deliveryProofImageUrl; return this; }
        public Builder shippingProofImageUrl(String shippingProofImageUrl) { response.shippingProofImageUrl = shippingProofImageUrl; return this; }
        public Builder canPayDeposit(Boolean canPayDeposit) { response.canPayDeposit = canPayDeposit; return this; }
        public Builder canCancel(Boolean canCancel) { response.canCancel = canCancel; return this; }
        public Builder canConfirmDelivery(Boolean canConfirmDelivery) { response.canConfirmDelivery = canConfirmDelivery; return this; }
        public Builder canUploadDeliveryProof(Boolean canUploadDeliveryProof) { response.canUploadDeliveryProof = canUploadDeliveryProof; return this; }
        public Builder canUpdateShippingProof(Boolean canUpdateShippingProof) { response.canUpdateShippingProof = canUpdateShippingProof; return this; }
        public Builder allowedActions(List<String> allowedActions) { response.allowedActions = allowedActions; return this; }
        public Builder createdAt(LocalDateTime createdAt) { response.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { response.updatedAt = updatedAt; return this; }
        public Builder items(List<OrderItemResponse> items) { response.items = items; return this; }
        public OrderResponse build() { return response; }
    }

    public Long getOrderId() { return orderId; }
    public Long getRetailerId() { return retailerId; }
    public Long getFarmId() { return farmId; }
    public String getRetailerName() { return retailerName; }
    public String getFarmName() { return farmName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getStatus() { return status; }
    public String getPaymentStatus() { return paymentStatus; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public BigDecimal getMinimumDepositAmount() { return minimumDepositAmount; }
    public LocalDateTime getDepositPaidAt() { return depositPaidAt; }
    public LocalDateTime getDepositReleasedAt() { return depositReleasedAt; }
    public Long getDepositReleasedByUserId() { return depositReleasedByUserId; }
    public String getDepositReleaseNote() { return depositReleaseNote; }
    public String getCancellationReason() { return cancellationReason; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public LocalDateTime getDeliveryConfirmedAt() { return deliveryConfirmedAt; }
    public Long getDeliveryConfirmedByUserId() { return deliveryConfirmedByUserId; }
    public String getDeliveryProofImageUrl() { return deliveryProofImageUrl; }
    public String getShippingProofImageUrl() { return shippingProofImageUrl; }
    public Boolean getCanPayDeposit() { return canPayDeposit; }
    public Boolean getCanCancel() { return canCancel; }
    public Boolean getCanConfirmDelivery() { return canConfirmDelivery; }
    public Boolean getCanUploadDeliveryProof() { return canUploadDeliveryProof; }
    public Boolean getCanUpdateShippingProof() { return canUpdateShippingProof; }
    public List<String> getAllowedActions() { return allowedActions; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<OrderItemResponse> getItems() { return items; }

}
