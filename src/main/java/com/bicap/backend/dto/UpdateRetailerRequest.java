package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateRetailerRequest {

    @NotBlank(message = "Retailer name không được để trống")
    private String retailerName;

    @NotBlank(message = "Business license không được để trống")
    private String businessLicenseNo;

    private String address;
    private String province;
}