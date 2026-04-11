package com.bicap.modules.farm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class FarmReviewRequest {
    @NotBlank(message = "Trạng thái phê duyệt không được để trống")
    @Pattern(regexp = "APPROVED|REJECTED", message = "Trạng thái không hợp lệ")
    private String approvalStatus;
    
    private String reviewComment;

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String s) { this.approvalStatus = s; }
    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String s) { this.reviewComment = s; }
}
