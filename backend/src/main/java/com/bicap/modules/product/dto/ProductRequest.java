package com.bicap.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ProductRequest {
    @NotBlank private String productName;
    private String productCode;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Integer sortOrder;
    private String status;
    private Long categoryId;

    public String getProductName() { return productName; }
    public void setProductName(String s) { this.productName = s; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String s) { this.productCode = s; }
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
}
