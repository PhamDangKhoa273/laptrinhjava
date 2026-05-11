package com.bicap.modules.common.report.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdatePlatformReportStatusRequest {
    @NotBlank(message = "status là bắt buộc")
    private String status;

    private String note;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
