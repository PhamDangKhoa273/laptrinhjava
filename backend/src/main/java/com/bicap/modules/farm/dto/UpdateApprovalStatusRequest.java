package com.bicap.modules.farm.dto;

public class UpdateApprovalStatusRequest {
    private String approvalStatus;
    private String comments;

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String s) { this.approvalStatus = s; }
    public String getComments() { return comments; }
    public void setComments(String s) { this.comments = s; }
}
