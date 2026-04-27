package com.bicap.modules.common.report.dto;

import jakarta.validation.constraints.NotBlank;

public class CreatePlatformReportRequest {
    private Long recipientUserId;
    private String recipientRole;

    @NotBlank(message = "reportType là bắt buộc")
    private String reportType;

    @NotBlank(message = "subject là bắt buộc")
    private String subject;

    @NotBlank(message = "content là bắt buộc")
    private String content;

    private String relatedEntityType;
    private Long relatedEntityId;

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getRelatedEntityType() { return relatedEntityType; }
    public void setRelatedEntityType(String relatedEntityType) { this.relatedEntityType = relatedEntityType; }
    public Long getRelatedEntityId() { return relatedEntityId; }
    public void setRelatedEntityId(Long relatedEntityId) { this.relatedEntityId = relatedEntityId; }
}
