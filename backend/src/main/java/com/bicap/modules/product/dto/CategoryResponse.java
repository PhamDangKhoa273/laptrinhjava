package com.bicap.modules.product.dto;

import java.time.LocalDateTime;

public class CategoryResponse {
    private Long categoryId;
    private String categoryName;
    private String slug;
    private String imageUrl;
    private String icon;
    private Integer sortOrder;
    private String status;
    private LocalDateTime createdAt;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long id) { this.categoryId = id; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String s) { this.categoryName = s; }
    public String getSlug() { return slug; }
    public void setSlug(String s) { this.slug = s; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String s) { this.imageUrl = s; }
    public String getIcon() { return icon; }
    public void setIcon(String s) { this.icon = s; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer n) { this.sortOrder = n; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime t) { this.createdAt = t; }
}
