package com.bicap.modules.listing.dto;

import jakarta.validation.constraints.NotBlank;

public class ListingRegistrationRequestDto {
    @NotBlank(message = "note là bắt buộc")
    private String note;

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
