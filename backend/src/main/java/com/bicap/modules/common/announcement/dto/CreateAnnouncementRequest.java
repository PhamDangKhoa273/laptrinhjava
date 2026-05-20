package com.bicap.modules.common.announcement.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateAnnouncementRequest {
    @NotBlank(message = "title la bat buoc")
    private String title;

    private String summary;

    @NotBlank(message = "contentHtml la bat buoc")
    private String contentHtml;

    private String category;

    private Boolean pinned;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getContentHtml() { return contentHtml; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Boolean getPinned() { return pinned; }
    public void setPinned(Boolean pinned) { this.pinned = pinned; }
}
