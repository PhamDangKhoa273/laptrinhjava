package com.bicap.modules.shipment.dto;

import jakarta.validation.constraints.NotBlank;

public class AddShipmentLogRequest {
    @NotBlank
    private String type; // CHECKPOINT, NOTE
    private String note;
    private String location;
    private String imageUrl;
    private String qrEvidence;
    private String overrideReason;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getQrEvidence() { return qrEvidence; }
    public void setQrEvidence(String qrEvidence) { this.qrEvidence = qrEvidence; }
    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
}
