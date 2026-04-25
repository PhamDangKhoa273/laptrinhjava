package com.bicap.modules.listing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ListingResponse {

    private Long listingId;
    private Long batchId;
    private String batchCode;
    private String traceCode;
    private String qrCodeUrl;
    private String productName;
    private String productCode;
    private String productCategory;
    private String farmName;
    private String farmCode;
    private String farmType;
    private String province;
    private String address;
    private String certificationStatus;
    private String seasonCode;
    private String seasonStatus;
    private String farmingMethod;
    private LocalDate harvestDate;
    private LocalDate expiryDate;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal quantityAvailable;
    private String unit;
    private String imageUrl;
    private String status;
    private String approvalStatus;
    private String qualityGrade;
    private Boolean traceable;
    private Boolean farmApproved;
    private Boolean availableForRetailer;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final ListingResponse r = new ListingResponse();
        public Builder listingId(Long v) { r.listingId = v; return this; }
        public Builder batchId(Long v) { r.batchId = v; return this; }
        public Builder batchCode(String v) { r.batchCode = v; return this; }
        public Builder traceCode(String v) { r.traceCode = v; return this; }
        public Builder qrCodeUrl(String v) { r.qrCodeUrl = v; return this; }
        public Builder productName(String v) { r.productName = v; return this; }
        public Builder productCode(String v) { r.productCode = v; return this; }
        public Builder productCategory(String v) { r.productCategory = v; return this; }
        public Builder farmName(String v) { r.farmName = v; return this; }
        public Builder farmCode(String v) { r.farmCode = v; return this; }
        public Builder farmType(String v) { r.farmType = v; return this; }
        public Builder province(String v) { r.province = v; return this; }
        public Builder address(String v) { r.address = v; return this; }
        public Builder certificationStatus(String v) { r.certificationStatus = v; return this; }
        public Builder seasonCode(String v) { r.seasonCode = v; return this; }
        public Builder seasonStatus(String v) { r.seasonStatus = v; return this; }
        public Builder farmingMethod(String v) { r.farmingMethod = v; return this; }
        public Builder harvestDate(LocalDate v) { r.harvestDate = v; return this; }
        public Builder expiryDate(LocalDate v) { r.expiryDate = v; return this; }
        public Builder title(String v) { r.title = v; return this; }
        public Builder description(String v) { r.description = v; return this; }
        public Builder price(BigDecimal v) { r.price = v; return this; }
        public Builder quantityAvailable(BigDecimal v) { r.quantityAvailable = v; return this; }
        public Builder unit(String v) { r.unit = v; return this; }
        public Builder imageUrl(String v) { r.imageUrl = v; return this; }
        public Builder status(String v) { r.status = v; return this; }
        public Builder approvalStatus(String v) { r.approvalStatus = v; return this; }
        public Builder qualityGrade(String v) { r.qualityGrade = v; return this; }
        public Builder traceable(Boolean v) { r.traceable = v; return this; }
        public Builder farmApproved(Boolean v) { r.farmApproved = v; return this; }
        public Builder availableForRetailer(Boolean v) { r.availableForRetailer = v; return this; }
        public Builder createdAt(LocalDateTime v) { r.createdAt = v; return this; }
        public Builder updatedAt(LocalDateTime v) { r.updatedAt = v; return this; }
        public ListingResponse build() { return r; }
    }

    public Long getListingId() { return listingId; }
    public Long getBatchId() { return batchId; }
    public String getBatchCode() { return batchCode; }
    public String getTraceCode() { return traceCode; }
    public String getQrCodeUrl() { return qrCodeUrl; }
    public String getProductName() { return productName; }
    public String getProductCode() { return productCode; }
    public String getProductCategory() { return productCategory; }
    public String getFarmName() { return farmName; }
    public String getFarmCode() { return farmCode; }
    public String getFarmType() { return farmType; }
    public String getProvince() { return province; }
    public String getAddress() { return address; }
    public String getCertificationStatus() { return certificationStatus; }
    public String getSeasonCode() { return seasonCode; }
    public String getSeasonStatus() { return seasonStatus; }
    public String getFarmingMethod() { return farmingMethod; }
    public LocalDate getHarvestDate() { return harvestDate; }
    public LocalDate getExpiryDate() { return expiryDate; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public BigDecimal getQuantityAvailable() { return quantityAvailable; }
    public String getUnit() { return unit; }
    public String getImageUrl() { return imageUrl; }
    public String getStatus() { return status; }
    public String getApprovalStatus() { return approvalStatus; }
    public String getQualityGrade() { return qualityGrade; }
    public Boolean getTraceable() { return traceable; }
    public Boolean getFarmApproved() { return farmApproved; }
    public Boolean getAvailableForRetailer() { return availableForRetailer; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
