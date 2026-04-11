package com.bicap.modules.listing.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class CreateListingRequest {

    @NotNull(message = "batch_id là bắt buộc")
    private Long batchId;

    @NotBlank(message = "Tiêu đề là bắt buộc")
    private String title;

    private String description;

    @NotNull(message = "Giá là bắt buộc")
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "Số lượng là bắt buộc")
    @DecimalMin(value = "0.01", message = "Số lượng phải lớn hơn 0")
    private BigDecimal quantityAvailable;

    private String unit;
    private String imageUrl;

    // Getters and Setters
    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(BigDecimal quantityAvailable) { this.quantityAvailable = quantityAvailable; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
