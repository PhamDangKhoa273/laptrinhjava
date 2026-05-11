package com.bicap.modules.common.announcement.dto;

import java.time.LocalDateTime;

public class SystemAnnouncementResponse {
    private Long announcementId;
    private String title;
    private String summary;
    private String contentHtml;
    private String category;
    private boolean pinned;
    private java.time.LocalDateTime publishAt;
    private java.time.LocalDateTime expireAt;
    private boolean active;
    private Long createdByUserId;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getAnnouncementId() { return announcementId; }
    public void setAnnouncementId(Long announcementId) { this.announcementId = announcementId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getContentHtml() { return contentHtml; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public boolean isPinned() { return pinned; }
    public void setPinned(boolean pinned) { this.pinned = pinned; }
    public java.time.LocalDateTime getPublishAt() { return publishAt; }
    public void setPublishAt(java.time.LocalDateTime publishAt) { this.publishAt = publishAt; }
    public java.time.LocalDateTime getExpireAt() { return expireAt; }
    public void setExpireAt(java.time.LocalDateTime expireAt) { this.expireAt = expireAt; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Long getCreatedByUserId() { return createdByUserId; }
    public void setCreatedByUserId(Long createdByUserId) { this.createdByUserId = createdByUserId; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
