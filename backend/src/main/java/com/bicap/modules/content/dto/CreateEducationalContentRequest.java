package com.bicap.modules.content.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateEducationalContentRequest {
    @NotBlank(message = "title là bắt buộc")
    private String title;

    private String summary;

    @NotBlank(message = "body là bắt buộc")
    private String body;

    @NotBlank(message = "contentType là bắt buộc")
    private String contentType;

    private String mediaUrl;
    private String status;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
