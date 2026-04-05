package com.bicap.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateFarmRequest {

    @NotBlank(message = "Farm code không được để trống")
    private String farmCode;

    @NotBlank(message = "Farm name không được để trống")
    private String farmName;

    @NotBlank(message = "Business license không được để trống")
    private String businessLicenseNo;

    private String address;
    private String province;
    private String description;
}
