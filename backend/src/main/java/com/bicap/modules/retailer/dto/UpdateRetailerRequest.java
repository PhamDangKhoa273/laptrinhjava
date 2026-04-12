package com.bicap.modules.retailer.dto;

public class UpdateRetailerRequest {
    private String retailerName;
    private String businessLicenseNo;
    private String address;
    private String phone;
    private String email;
    private String status;

    public String getRetailerName() { return retailerName; }
    public void setRetailerName(String s) { this.retailerName = s; }
    public String getBusinessLicenseNo() { return businessLicenseNo; }
    public void setBusinessLicenseNo(String s) { this.businessLicenseNo = s; }
    public String getAddress() { return address; }
    public void setAddress(String s) { this.address = s; }
    public String getPhone() { return phone; }
    public void setPhone(String s) { this.phone = s; }
    public String getEmail() { return email; }
    public void setEmail(String s) { this.email = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
}
