package com.bicap.modules.farm.dto;

import java.time.LocalDateTime;

public class FarmResponse {
    private Long farmId;
    private String farmCode;
    private String farmName;
    private String farmType;
    private String address;
    private String province;
    private Double totalArea;
    private String contactPerson;
    private String phone;
    private String email;
    private String businessLicenseNo;
    private String certificationStatus;
    private String approvalStatus;
    private Long ownerId;
    private String ownerName;

    // Getters and Setters
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long id) { this.farmId = id; }
    public String getFarmCode() { return farmCode; }
    public void setFarmCode(String s) { this.farmCode = s; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String s) { this.farmName = s; }
    public String getFarmType() { return farmType; }
    public void setFarmType(String s) { this.farmType = s; }
    public String getAddress() { return address; }
    public void setAddress(String s) { this.address = s; }
    public String getProvince() { return province; }
    public void setProvince(String s) { this.province = s; }
    public Double getTotalArea() { return totalArea; }
    public void setTotalArea(Double d) { this.totalArea = d; }
    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String s) { this.contactPerson = s; }
    public String getPhone() { return phone; }
    public void setPhone(String s) { this.phone = s; }
    public String getEmail() { return email; }
    public void setEmail(String s) { this.email = s; }
    public String getBusinessLicenseNo() { return businessLicenseNo; }
    public void setBusinessLicenseNo(String s) { this.businessLicenseNo = s; }
    public String getCertificationStatus() { return certificationStatus; }
    public void setCertificationStatus(String s) { this.certificationStatus = s; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String s) { this.approvalStatus = s; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long id) { this.ownerId = id; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String s) { this.ownerName = s; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private FarmResponse r = new FarmResponse();
        public Builder farmId(Long l) { r.setFarmId(l); return this; }
        public Builder farmCode(String s) { r.setFarmCode(s); return this; }
        public Builder farmName(String s) { r.setFarmName(s); return this; }
        public Builder farmType(String s) { r.setFarmType(s); return this; }
        public Builder address(String s) { r.setAddress(s); return this; }
        public Builder province(String s) { r.setProvince(s); return this; }
        public Builder totalArea(Double d) { r.setTotalArea(d); return this; }
        public Builder contactPerson(String s) { r.setContactPerson(s); return this; }
        public Builder phone(String s) { r.setPhone(s); return this; }
        public Builder email(String s) { r.setEmail(s); return this; }
        public Builder businessLicenseNo(String s) { r.setBusinessLicenseNo(s); return this; }
        public Builder certificationStatus(String s) { r.setCertificationStatus(s); return this; }
        public Builder approvalStatus(String s) { r.setApprovalStatus(s); return this; }
        public Builder ownerId(Long l) { r.setOwnerId(l); return this; }
        public Builder ownerName(String s) { r.setOwnerName(s); return this; }
        public FarmResponse build() { return r; }
    }
}
