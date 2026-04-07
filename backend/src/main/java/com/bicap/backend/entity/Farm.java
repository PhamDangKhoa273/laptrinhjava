package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "farms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "farm_id")
    private Long farmId;

    @OneToOne(optional = false)
    @JoinColumn(name = "owner_user_id", nullable = false, unique = true)
    private User ownerUser;

    @Column(name = "farm_code", nullable = false, unique = true, length = 50)
    private String farmCode;

    @Column(name = "farm_name", nullable = false, length = 150)
    private String farmName;

    @Column(name = "business_license_no", nullable = false, unique = true, length = 100)
    private String businessLicenseNo;

    @Column(name = "certification_status", nullable = false, length = 30)
    private String certificationStatus = "PENDING";

    @Column(name = "approval_status", nullable = false, length = 30)
    private String approvalStatus = "PENDING";

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "province", length = 100)
    private String province;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "reviewed_by_user_id")
    private User reviewedByUser;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // Manual Fallbacks for Lombok
    public Long getFarmId() { return farmId; }
    public void setFarmId(Long farmId) { this.farmId = farmId; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
}
