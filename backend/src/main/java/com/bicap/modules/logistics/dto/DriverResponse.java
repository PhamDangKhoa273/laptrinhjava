package com.bicap.modules.logistics.dto;


public class DriverResponse {
    private Long driverId;
    private String driverCode;
    private String licenseNo;
    private String status;
    private Long userId;
    private String userFullName;
    private Long managerUserId;
    private String managerFullName;

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }

    public String getLicenseNo() { return licenseNo; }
    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public Long getManagerUserId() { return managerUserId; }
    public void setManagerUserId(Long managerUserId) { this.managerUserId = managerUserId; }

    public String getManagerFullName() { return managerFullName; }
    public void setManagerFullName(String managerFullName) { this.managerFullName = managerFullName; }
}
