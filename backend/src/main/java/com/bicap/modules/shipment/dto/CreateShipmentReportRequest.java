package com.bicap.modules.shipment.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateShipmentReportRequest {
    @NotBlank
    private String issueType; // DELAY, DAMAGED, WRONG_BATCH, SHORTAGE, ROUTE_ISSUE
    @NotBlank
    private String description;
    private String severity; // LOW, MEDIUM, HIGH

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
}
