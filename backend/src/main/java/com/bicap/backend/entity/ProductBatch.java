package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_batches")
@Getter
@Setter
public class ProductBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_id")
    private Long batchId;

    @Column(name = "season_id", nullable = false)
    private Long seasonId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "batch_code", nullable = false, unique = true, length = 50)
    private String batchCode;

    @Column(name = "harvest_date", nullable = false)
    private LocalDate harvestDate;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "available_quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal availableQuantity;

    @Column(name = "quality_grade", length = 30)
    private String qualityGrade;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "batch_status", nullable = false, length = 30)
    private String batchStatus = "CREATED";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

