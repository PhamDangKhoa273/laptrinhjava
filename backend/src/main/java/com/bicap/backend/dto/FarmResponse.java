package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FarmResponse {
    private Long farmId;
    private String farmCode;
    private String farmName;
    private String businessLicenseNo;
    private String certificationStatus;
    private String approvalStatus;
    private String address;
    private String province;
    private String description;
    private Long ownerUserId;
    private String ownerFullName;
    private Long reviewedByUserId;
    private String reviewedByFullName;
    private LocalDateTime reviewedAt;
}
