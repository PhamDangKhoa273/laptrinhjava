package com.bicap.modules.batch.entity;

import com.bicap.modules.product.entity.Product;
import com.bicap.modules.season.entity.FarmingSeason;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "product_batches")
public class ProductBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "batch_id")
    private Long batchId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private FarmingSeason season;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private String batchCode;
    private LocalDate harvestDate;
    private BigDecimal quantity;
    private BigDecimal availableQuantity;
    private String qualityGrade;
    private LocalDate expiryDate;
    
    @Column(name = "batch_status")
    private String status;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null || this.status.isBlank()) this.status = "CREATED";
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getBatchId() { return batchId; }
    public void setBatchId(Long id) { this.batchId = id; }
    public FarmingSeason getSeason() { return season; }
    public void setSeason(FarmingSeason s) { this.season = s; }
    public Product getProduct() { return product; }
    public void setProduct(Product p) { this.product = p; }
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String s) { this.batchCode = s; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public void setHarvestDate(LocalDate d) { this.harvestDate = d; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal d) { this.quantity = d; }
    public BigDecimal getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(BigDecimal d) { this.availableQuantity = d; }
    public String getQualityGrade() { return qualityGrade; }
    public void setQualityGrade(String s) { this.qualityGrade = s; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate d) { this.expiryDate = d; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getBatchStatus() { return status; }
    public void setBatchStatus(String s) { this.status = s; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }
}
