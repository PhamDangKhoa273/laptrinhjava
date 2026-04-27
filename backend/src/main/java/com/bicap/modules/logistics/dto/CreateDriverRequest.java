package com.bicap.modules.logistics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateDriverRequest {

    @NotBlank(message = "driverCode không được để trống")
    private String driverCode;

    @NotBlank(message = "licenseNo không được để trống")
    private String licenseNo;

    @NotNull(message = "userId không được để trống")
    private Long userId;

    private String status;

    public String getDriverCode() { return driverCode; }
    public String getLicenseNo() { return licenseNo; }
    public Long getUserId() { return userId; }
    public String getStatus() { return status; }

    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }

    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }

    public void setUserId(Long userId) { this.userId = userId; }

    public void setStatus(String status) { this.status = status; }
}
