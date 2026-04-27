package com.bicap.modules.product.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long productId;

    @Column(name = "product_code", nullable = false, unique = true, length = 50)
    private String productCode;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(length = 20)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "ACTIVE";
        if (this.sortOrder == null) this.sortOrder = 0;
    }

    @PreUpdate
    public void onUpdate() { this.updatedAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getProductId() { return productId; }
    public void setProductId(Long id) { this.productId = id; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String s) { this.productCode = s; }
    public String getProductName() { return productName; }
    public void setProductName(String s) { this.productName = s; }
    public String getDescription() { return description; }
    public void setDescription(String s) { this.description = s; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal p) { this.price = p; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String s) { this.imageUrl = s; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer n) { this.sortOrder = n; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public Category getCategory() { return category; }
    public void setCategory(Category c) { this.category = c; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }
}
