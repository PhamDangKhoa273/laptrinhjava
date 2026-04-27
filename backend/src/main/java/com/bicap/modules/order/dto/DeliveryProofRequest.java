package com.bicap.modules.order.dto;

import jakarta.validation.constraints.NotBlank;

public class DeliveryProofRequest {
    @NotBlank(message = "imageUrl là bắt buộc")
    private String imageUrl;

    private String note;

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
