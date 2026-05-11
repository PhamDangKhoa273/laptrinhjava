package com.bicap.modules.common.announcement.dto;

import jakarta.validation.constraints.NotBlank;

public class UpsertSystemAnnouncementRequest {
    @NotBlank(message = "contentHtml là bắt buộc")
    private String contentHtml;

    public String getContentHtml() { return contentHtml; }
    public void setContentHtml(String contentHtml) { this.contentHtml = contentHtml; }
}
