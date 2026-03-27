package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRetailerRequest {

    @NotBlank(message = "Retailer code không được để trống")
    private String retailerCode;

    @NotBlank(message = "Retailer name không được để trống")
    private String retailerName;

    @NotBlank(message = "Business license không được để trống")
    private String businessLicenseNo;

    private String address;
    private String province;

    @NotNull(message = "User id không được để trống")
    private Long userId;
}