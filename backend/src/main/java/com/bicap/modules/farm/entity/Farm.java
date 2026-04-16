package com.bicap.modules.farm.entity;

import com.bicap.modules.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "farms")
public class Farm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "farm_id")
    private Long farmId;

    private String farmCode;
    private String farmName;
    private String description;
    
    @Transient
    private String farmType;
    
    private String address;
    private String province;
    
    @Transient
    private Double totalArea;
    
    @Transient
    private String contactPerson;
    
    @Transient
    private String phone;
    
    @Transient
    private String email;
    
    @Transient
    private String logoUrl;
    
    private String businessLicenseNo;
    private String certificationStatus;
    private String approvalStatus;
    private String reviewComment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_user_id")
    private User ownerUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedByUser;

    private LocalDateTime reviewedAt;

    // Getters and Setters
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long id) { this.farmId = id; }
    public String getFarmCode() { return farmCode; }
    public void setFarmCode(String s) { this.farmCode = s; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String s) { this.farmName = s; }
    public String getDescription() { return description; }
    public void setDescription(String s) { this.description = s; }
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
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String s) { this.logoUrl = s; }
    public String getBusinessLicenseNo() { return businessLicenseNo; }
    public void setBusinessLicenseNo(String s) { this.businessLicenseNo = s; }
    public String getCertificationStatus() { return certificationStatus; }
    public void setCertificationStatus(String s) { this.certificationStatus = s; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String s) { this.approvalStatus = s; }
    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String s) { this.reviewComment = s; }
    public User getOwnerUser() { return ownerUser; }
    public void setOwnerUser(User u) { this.ownerUser = u; }
    public User getReviewedByUser() { return reviewedByUser; }
    public void setReviewedByUser(User u) { this.reviewedByUser = u; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime t) { this.reviewedAt = t; }
}
