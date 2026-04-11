package com.bicap.modules.product.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "category_name", nullable = false, length = 150)
    private String categoryName;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 20)
    private String icon;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(length = 20)
    private String status;

    private LocalDateTime createdAt;
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
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long id) { this.categoryId = id; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String n) { this.categoryName = n; }
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
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime t) { this.updatedAt = t; }
}
