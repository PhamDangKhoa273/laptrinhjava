package com.bicap.modules.retailer.dto;

import java.util.List;

public class RetailerResponse {
    private Long id;
    private String retailerCode;
    private String name;
    private String businessLicenseNo;
    private String address;
    private String contactPhone;
    private String email;
    private String status;
    private String logoUrl;
    private List<String> certificateUrls;
    private String businessLicenseFileUrl;
    private String businessLicenseFileName;
    private Long businessLicenseFileSize;
    private java.time.LocalDateTime businessLicenseUploadedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRetailerCode() { return retailerCode; }
    public void setRetailerCode(String s) { this.retailerCode = s; }
    public String getName() { return name; }
    public String getRetailerName() { return name; }
    public void setName(String s) { this.name = s; }
    public String getBusinessLicenseNo() { return businessLicenseNo; }
    public void setBusinessLicenseNo(String s) { this.businessLicenseNo = s; }
    public String getAddress() { return address; }
    public void setAddress(String s) { this.address = s; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String s) { this.contactPhone = s; }
    public String getEmail() { return email; }
    public void setEmail(String s) { this.email = s; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String s) { this.logoUrl = s; }
    public List<String> getCertificateUrls() { return certificateUrls; }
    public void setCertificateUrls(List<String> l) { this.certificateUrls = l; }
    public String getBusinessLicenseFileUrl() { return businessLicenseFileUrl; }
    public void setBusinessLicenseFileUrl(String businessLicenseFileUrl) { this.businessLicenseFileUrl = businessLicenseFileUrl; }
    public String getBusinessLicenseFileName() { return businessLicenseFileName; }
    public void setBusinessLicenseFileName(String businessLicenseFileName) { this.businessLicenseFileName = businessLicenseFileName; }
    public Long getBusinessLicenseFileSize() { return businessLicenseFileSize; }
    public void setBusinessLicenseFileSize(Long businessLicenseFileSize) { this.businessLicenseFileSize = businessLicenseFileSize; }
    public java.time.LocalDateTime getBusinessLicenseUploadedAt() { return businessLicenseUploadedAt; }
    public void setBusinessLicenseUploadedAt(java.time.LocalDateTime businessLicenseUploadedAt) { this.businessLicenseUploadedAt = businessLicenseUploadedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private RetailerResponse r = new RetailerResponse();
        public Builder id(Long l) { r.setId(l); return this; }
        public Builder retailerId(Long l) { r.setId(l); return this; }
        public Builder userId(Long l) { return this; }
        public Builder userFullName(String s) { return this; }
        public Builder retailerCode(String s) { r.setRetailerCode(s); return this; }
        public Builder name(String s) { r.setName(s); return this; }
        public Builder retailerName(String s) { r.setName(s); return this; }
        public Builder businessLicenseNo(String s) { r.setBusinessLicenseNo(s); return this; }
        public Builder address(String s) { r.setAddress(s); return this; }
        public Builder contactPhone(String s) { r.setContactPhone(s); return this; }
        public Builder email(String s) { r.setEmail(s); return this; }
        public Builder status(String s) { r.setStatus(s); return this; }
        public Builder logoUrl(String s) { r.setLogoUrl(s); return this; }
        public Builder certificateUrls(List<String> l) { r.setCertificateUrls(l); return this; }
        public Builder businessLicenseFileUrl(String s) { r.setBusinessLicenseFileUrl(s); return this; }
        public Builder businessLicenseFileName(String s) { r.setBusinessLicenseFileName(s); return this; }
        public Builder businessLicenseFileSize(Long l) { r.setBusinessLicenseFileSize(l); return this; }
        public Builder businessLicenseUploadedAt(java.time.LocalDateTime t) { r.setBusinessLicenseUploadedAt(t); return this; }
        public RetailerResponse build() { return r; }
    }
}
