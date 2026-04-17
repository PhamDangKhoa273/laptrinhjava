package com.bicap.modules.common.notification.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateNotificationRequest {
    private Long recipientUserId;
    private String recipientRole;

    @NotBlank(message = "title là bắt buộc")
    private String title;

    @NotBlank(message = "message là bắt buộc")
    private String message;

    @NotBlank(message = "notificationType là bắt buộc")
    private String notificationType;

    private String targetType;
    private Long targetId;

    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }
    public String getRecipientRole() { return recipientRole; }
    public void setRecipientRole(String recipientRole) { this.recipientRole = recipientRole; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
}
