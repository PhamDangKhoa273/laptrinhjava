package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateRetailerRequest {

    @NotBlank(message = "retailerCode không được để trống")
    private String retailerCode;

    @NotBlank(message = "retailerName không được để trống")
    private String retailerName;

    @NotBlank(message = "businessLicenseNo không được để trống")
    private String businessLicenseNo;

    @NotBlank(message = "address không được để trống")
    private String address;

    private String status;
}