package com.bicap.modules.logistics.entity;

import com.bicap.modules.order.entity.Order;
import com.bicap.modules.user.entity.User;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "qr_codes")
public class ShippingQRCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "qr_id")
    private Long qrId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "qr_code_value", nullable = false, unique = true, length = 255)
    private String qrCodeValue;

    @Column(name = "qr_type", nullable = false, length = 50)
    private String qrType; // FARM_PICKUP or RETAILER_DELIVERY

    @Column(name = "scanned_at")
    private LocalDateTime scannedAt;

    @ManyToOne
    @JoinColumn(name = "scanned_by")
    private User scannedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getQrId() { return qrId; }
    public void setQrId(Long qrId) { this.qrId = qrId; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getQrCodeValue() { return qrCodeValue; }
    public void setQrCodeValue(String qrCodeValue) { this.qrCodeValue = qrCodeValue; }

    public String getQrType() { return qrType; }
    public void setQrType(String qrType) { this.qrType = qrType; }

    public LocalDateTime getScannedAt() { return scannedAt; }
    public void setScannedAt(LocalDateTime scannedAt) { this.scannedAt = scannedAt; }

    public User getScannedBy() { return scannedBy; }
    public void setScannedBy(User scannedBy) { this.scannedBy = scannedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
