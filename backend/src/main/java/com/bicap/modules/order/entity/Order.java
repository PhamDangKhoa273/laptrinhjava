package com.bicap.modules.order.entity;

import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.core.enums.OrderStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Version
    private Long version;

    @Column(name = "retailer_id", nullable = false)
    private Long retailerId;

    @Column(name = "farm_id", nullable = false)
    private Long farmId;

    @Column(name = "total_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus;

    @Column(name = "deposit_amount", precision = 18, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "deposit_paid_at")
    private LocalDateTime depositPaidAt;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @Column(name = "delivery_confirmed_at")
    private LocalDateTime deliveryConfirmedAt;

    @Column(name = "delivery_confirmed_by_user_id")
    private Long deliveryConfirmedByUserId;

    @Column(name = "delivery_proof_image_url", length = 500)
    private String deliveryProofImageUrl;

    @Column(name = "shipping_proof_image_url", length = 500)
    private String shippingProofImageUrl;



    @Column(name = "deposit_released_at")
    private LocalDateTime depositReleasedAt;

    @Column(name = "deposit_released_by_user_id")
    private Long depositReleasedByUserId;

    @Column(name = "deposit_release_note", length = 500)
    private String depositReleaseNote;

    @Column(name = "dispute_raised_at")
    private LocalDateTime disputeRaisedAt;

    @Column(name = "dispute_note", length = 500)
    private String disputeNote;

    @Column(name = "close_eligible_at")
    private LocalDateTime closeEligibleAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() { LocalDateTime now = LocalDateTime.now(); this.createdAt = now; this.updatedAt = now; if (this.status == null || this.status.isBlank()) this.status = OrderStatus.PENDING.name(); if (this.paymentStatus == null || this.paymentStatus.isBlank()) this.paymentStatus = OrderPaymentStatus.UNPAID.name(); }
    @PreUpdate
    public void onUpdate() { this.updatedAt = LocalDateTime.now(); }
    public void addOrderItem(OrderItem item) { item.setOrder(this); this.orderItems.add(item); }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getVersion() { return version; }
    public void setVersion(Long version) { this.version = version; }
    public Long getRetailerId() { return retailerId; }
    public void setRetailerId(Long retailerId) { this.retailerId = retailerId; }
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<OrderItem> getOrderItems() { return orderItems; }
    public void setOrderItems(List<OrderItem> orderItems) { this.orderItems = orderItems; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }
    public LocalDateTime getDepositPaidAt() { return depositPaidAt; }
    public void setDepositPaidAt(LocalDateTime depositPaidAt) { this.depositPaidAt = depositPaidAt; }
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    public LocalDateTime getDeliveryConfirmedAt() { return deliveryConfirmedAt; }
    public void setDeliveryConfirmedAt(LocalDateTime deliveryConfirmedAt) { this.deliveryConfirmedAt = deliveryConfirmedAt; }
    public Long getDeliveryConfirmedByUserId() { return deliveryConfirmedByUserId; }
    public void setDeliveryConfirmedByUserId(Long deliveryConfirmedByUserId) { this.deliveryConfirmedByUserId = deliveryConfirmedByUserId; }
    public String getDeliveryProofImageUrl() { return deliveryProofImageUrl; }
    public void setDeliveryProofImageUrl(String deliveryProofImageUrl) { this.deliveryProofImageUrl = deliveryProofImageUrl; }
    public String getShippingProofImageUrl() { return shippingProofImageUrl; }
    public void setShippingProofImageUrl(String shippingProofImageUrl) { this.shippingProofImageUrl = shippingProofImageUrl; }
    public LocalDateTime getDepositReleasedAt() { return depositReleasedAt; }
    public void setDepositReleasedAt(LocalDateTime depositReleasedAt) { this.depositReleasedAt = depositReleasedAt; }
    public Long getDepositReleasedByUserId() { return depositReleasedByUserId; }
    public void setDepositReleasedByUserId(Long depositReleasedByUserId) { this.depositReleasedByUserId = depositReleasedByUserId; }
    public String getDepositReleaseNote() { return depositReleaseNote; }
    public void setDepositReleaseNote(String depositReleaseNote) { this.depositReleaseNote = depositReleaseNote; }
    public LocalDateTime getDisputeRaisedAt() { return disputeRaisedAt; }
    public void setDisputeRaisedAt(LocalDateTime disputeRaisedAt) { this.disputeRaisedAt = disputeRaisedAt; }
    public String getDisputeNote() { return disputeNote; }
    public void setDisputeNote(String disputeNote) { this.disputeNote = disputeNote; }
    public LocalDateTime getCloseEligibleAt() { return closeEligibleAt; }
    public void setCloseEligibleAt(LocalDateTime closeEligibleAt) { this.closeEligibleAt = closeEligibleAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public OrderStatus getStatusEnum() { return status == null ? null : OrderStatus.valueOf(status); }
    public void setStatus(OrderStatus status) { this.status = status != null ? status.name() : null; }
    public OrderPaymentStatus getPaymentStatusEnum() { return paymentStatus == null ? null : OrderPaymentStatus.valueOf(paymentStatus); }
    public void setPaymentStatus(OrderPaymentStatus paymentStatus) { this.paymentStatus = paymentStatus != null ? paymentStatus.name() : null; }
}
