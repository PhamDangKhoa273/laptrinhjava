package com.bicap.modules.contract.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farm_retailer_contracts")
public class FarmRetailerContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long contractId;

    @Column(name = "farm_id", nullable = false)
    private Long farmId;

    @Column(name = "retailer_id", nullable = false)
    private Long retailerId;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING";

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_to")
    private LocalDateTime validTo;

    @Column(name = "product_scope", length = 500)
    private String productScope;

    @Column(name = "agreed_price_rule", length = 500)
    private String agreedPriceRule;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "related_listing_ids", length = 1000)
    private String relatedListingIds;

    @Column(name = "related_order_ids", length = 1000)
    private String relatedOrderIds;

    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @Column(name = "reviewed_by_user_id")
    private Long reviewedByUserId;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public Long getContractId() { return contractId; }
    public void setContractId(Long contractId) { this.contractId = contractId; }
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public Long getRetailerId() { return retailerId; }
    public void setRetailerId(Long retailerId) { this.retailerId = retailerId; }
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
    public String getRelatedListingIds() { return relatedListingIds; }
    public void setRelatedListingIds(String relatedListingIds) { this.relatedListingIds = relatedListingIds; }
    public String getRelatedOrderIds() { return relatedOrderIds; }
    public void setRelatedOrderIds(String relatedOrderIds) { this.relatedOrderIds = relatedOrderIds; }
    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }
    public Long getReviewedByUserId() { return reviewedByUserId; }
    public void setReviewedByUserId(Long reviewedByUserId) { this.reviewedByUserId = reviewedByUserId; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
