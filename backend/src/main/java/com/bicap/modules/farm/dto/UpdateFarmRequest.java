package com.bicap.modules.farm.dto;

public class UpdateFarmRequest {
    private String farmName;
    private String farmType;
    private String businessLicenseNo;
    private String address;
    private String province;
    private Double totalArea;
    private String contactPerson;
    private String description;

    public String getFarmName() { return farmName; }
    public void setFarmName(String s) { this.farmName = s; }
    public String getFarmType() { return farmType; }
    public void setFarmType(String s) { this.farmType = s; }
    public String getBusinessLicenseNo() { return businessLicenseNo; }
    public void setBusinessLicenseNo(String s) { this.businessLicenseNo = s; }
    public String getAddress() { return address; }
    public void setAddress(String s) { this.address = s; }
    public String getProvince() { return province; }
    public void setProvince(String s) { this.province = s; }
    public Double getTotalArea() { return totalArea; }
    public void setTotalArea(Double d) { this.totalArea = d; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String s) { this.contactPerson = s; }
    public String getDescription() { return description; }
    public void setDescription(String s) { this.description = s; }
}
