package com.bicap.modules.logistics.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateDriverRequest {

    @NotBlank(message = "licenseNo không được để trống")
    private String licenseNo;

    private String status;

    public String getLicenseNo() { return licenseNo; }
    public String getStatus() { return status; }

    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }

    public void setStatus(String status) { this.status = status; }
}
