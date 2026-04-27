package com.bicap.modules.order.dto;

import jakarta.validation.constraints.NotBlank;

public class ConfirmDeliveryRequest {
    @NotBlank(message = "proofImageUrl là bắt buộc")
    private String proofImageUrl;

    private String note;

    public String getProofImageUrl() { return proofImageUrl; }
    public void setProofImageUrl(String proofImageUrl) { this.proofImageUrl = proofImageUrl; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
