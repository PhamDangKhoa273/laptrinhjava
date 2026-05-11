package com.bicap.modules.shipment.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateShipmentStatusRequest {
    @NotBlank
    private String status;
    private String note;
    private String evidence;
    private String overrideReason;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getEvidence() { return evidence; }
    public void setEvidence(String evidence) { this.evidence = evidence; }
    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
}
