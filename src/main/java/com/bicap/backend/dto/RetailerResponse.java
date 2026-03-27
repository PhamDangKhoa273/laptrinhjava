package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RetailerResponse {
    private Long retailerId;
    private String retailerCode;
    private String retailerName;
    private String businessLicenseNo;
    private String address;
    private String province;
    private Long userId;
    private String userFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}