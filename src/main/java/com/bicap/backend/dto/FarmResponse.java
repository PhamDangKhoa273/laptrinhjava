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
    private String address;
    private String province;
    private String description;
    private Long ownerUserId;
    private String ownerFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}