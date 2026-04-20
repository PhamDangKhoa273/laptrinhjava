package com.bicap.modules.farm.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateFarmRequest {
    @NotBlank(message = "Tên nông trại là bắt buộc")
    @Size(max = 150, message = "Tên nông trại không được vượt quá 150 ký tự")
    private String farmName;

    @Size(max = 100, message = "Loại nông trại không được vượt quá 100 ký tự")
    private String farmType;

    @NotBlank(message = "Số giấy phép kinh doanh là bắt buộc")
    @Size(max = 100, message = "Số giấy phép kinh doanh không được vượt quá 100 ký tự")
    @Pattern(regexp = "^[A-Za-z0-9\\-/. ]+$", message = "Số giấy phép kinh doanh chứa ký tự không hợp lệ")
    private String businessLicenseNo;

    @NotBlank(message = "Địa chỉ là bắt buộc")
    @Size(max = 255, message = "Địa chỉ không được vượt quá 255 ký tự")
    private String address;

    @NotBlank(message = "Tỉnh/Thành là bắt buộc")
    @Size(max = 100, message = "Tỉnh/Thành không được vượt quá 100 ký tự")
    private String province;

    @DecimalMin(value = "0.0", inclusive = false, message = "Diện tích phải lớn hơn 0")
    private Double totalArea;

    @Size(max = 150, message = "Người liên hệ không được vượt quá 150 ký tự")
    private String contactPerson;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
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
