package com.bicap.modules.contract.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CreateFarmRetailerContractRequest {
    @NotNull private Long farmId;
    @NotNull private Long retailerId;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private String productScope;
    private String agreedPriceRule;
    private String notes;
    private String relatedListingIds;
    private String relatedOrderIds;

    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public Long getRetailerId() { return retailerId; }
    public void setRetailerId(Long retailerId) { this.retailerId = retailerId; }
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
    public String getRelatedListingIds() { return relatedListingIds; }
    public void setRelatedListingIds(String relatedListingIds) { this.relatedListingIds = relatedListingIds; }
    public String getRelatedOrderIds() { return relatedOrderIds; }
    public void setRelatedOrderIds(String relatedOrderIds) { this.relatedOrderIds = relatedOrderIds; }
}
