package com.bicap.modules.retailer.dto;

public class RetailerReviewRequest {
    private String approvalStatus;
    private String reviewComment;

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
}
