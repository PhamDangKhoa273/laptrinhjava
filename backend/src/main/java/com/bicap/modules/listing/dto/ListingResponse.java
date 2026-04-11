package com.bicap.modules.listing.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ListingResponse {

    private Long listingId;
    private Long batchId;
    private String batchCode;
    private String productName;
    private String farmName;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal quantityAvailable;
    private String unit;
    private String imageUrl;
    private String status;
    private String qualityGrade;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ListingResponse r = new ListingResponse();
        public Builder listingId(Long v) { r.listingId = v; return this; }
        public Builder batchId(Long v) { r.batchId = v; return this; }
        public Builder batchCode(String v) { r.batchCode = v; return this; }
        public Builder productName(String v) { r.productName = v; return this; }
        public Builder farmName(String v) { r.farmName = v; return this; }
        public Builder title(String v) { r.title = v; return this; }
        public Builder description(String v) { r.description = v; return this; }
        public Builder price(BigDecimal v) { r.price = v; return this; }
        public Builder quantityAvailable(BigDecimal v) { r.quantityAvailable = v; return this; }
        public Builder unit(String v) { r.unit = v; return this; }
        public Builder imageUrl(String v) { r.imageUrl = v; return this; }
        public Builder status(String v) { r.status = v; return this; }
        public Builder qualityGrade(String v) { r.qualityGrade = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }
        public ListingResponse build() { return r; }
    }

    // Getters
    public Long getListingId() { return listingId; }
    public Long getBatchId() { return batchId; }
    public String getBatchCode() { return batchCode; }
    public String getProductName() { return productName; }
    public String getFarmName() { return farmName; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getQuantityAvailable() { return quantityAvailable; }
    public String getUnit() { return unit; }
    public String getImageUrl() { return imageUrl; }
    public String getStatus() { return status; }
    public String getQualityGrade() { return qualityGrade; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
