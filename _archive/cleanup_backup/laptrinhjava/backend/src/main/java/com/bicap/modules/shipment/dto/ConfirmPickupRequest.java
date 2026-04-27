package com.bicap.modules.shipment.dto;

import jakarta.validation.constraints.NotBlank;

public class ConfirmPickupRequest {
    @NotBlank
    private String qrCode;
    private String note;
    private String location;
    private String expectedCode;
    private String overrideReason;

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getExpectedCode() { return expectedCode; }
    public void setExpectedCode(String expectedCode) { this.expectedCode = expectedCode; }
    public String getOverrideReason() { return overrideReason; }
    public void setOverrideReason(String overrideReason) { this.overrideReason = overrideReason; }
}
