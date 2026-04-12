package com.bicap.modules.product.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ProductResponse {
    private Long productId;
    private String productCode;
    private String productName;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer sortOrder;
    private String status;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long id) { this.categoryId = id; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String s) { this.categoryName = s; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }
}
