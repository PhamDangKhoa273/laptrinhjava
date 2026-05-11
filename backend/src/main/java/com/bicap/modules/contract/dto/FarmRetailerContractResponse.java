package com.bicap.modules.contract.dto;

import java.time.LocalDateTime;

public class FarmRetailerContractResponse {
    private Long contractId;
    private Long farmId;
    private Long retailerId;
    private String farmName;
    private String retailerName;
    private String status;
    private LocalDateTime signedAt;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private String productScope;
    private String agreedPriceRule;
    private String notes;
    private Long createdByUserId;
    private Long reviewedByUserId;
    private LocalDateTime reviewedAt;
    private boolean active;
    private int listingCount;
    private int orderCount;
    private String coverageSummary;

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public Long getRetailerId() { return retailerId; }
    public void setRetailerId(Long retailerId) { this.retailerId = retailerId; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
    public String getRetailerName() { return retailerName; }
    public void setRetailerName(String retailerName) { this.retailerName = retailerName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getSignedAt() { return signedAt; }
    public void setSignedAt(LocalDateTime signedAt) { this.signedAt = signedAt; }
    public LocalDateTime getValidFrom() { return validFrom; }
    public void setValidFrom(LocalDateTime validFrom) { this.validFrom = validFrom; }
    public LocalDateTime getValidTo() { return validTo; }
    public void setValidTo(LocalDateTime validTo) { this.validTo = validTo; }
    public String getProductScope() { return productScope; }
    public void setProductScope(String productScope) { this.productScope = productScope; }
    public String getAgreedPriceRule() { return agreedPriceRule; }
    public void setAgreedPriceRule(String agreedPriceRule) { this.agreedPriceRule = agreedPriceRule; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }
    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public int getListingCount() { return listingCount; }
    public void setListingCount(int listingCount) { this.listingCount = listingCount; }
    public int getOrderCount() { return orderCount; }
    public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
    public String getCoverageSummary() { return coverageSummary; }
    public void setCoverageSummary(String coverageSummary) { this.coverageSummary = coverageSummary; }
}
