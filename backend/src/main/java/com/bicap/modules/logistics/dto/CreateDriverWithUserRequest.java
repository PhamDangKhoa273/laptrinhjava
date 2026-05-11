package com.bicap.modules.logistics.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateDriverWithUserRequest {

    @NotBlank(message = "fullName không được để trống")
    private String fullName;

    @NotBlank(message = "email không được để trống")
    @Email(message = "email không hợp lệ")
    private String email;

    @NotBlank(message = "password không được để trống")
    @Size(min = 6, message = "password phải có ít nhất 6 ký tự")
    private String password;

    @NotBlank(message = "driverCode không được để trống")
    private String driverCode;

    @NotBlank(message = "licenseNo không được để trống")
    private String licenseNo;

    private String status;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }

    public String getLicenseNo() { return licenseNo; }
    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
