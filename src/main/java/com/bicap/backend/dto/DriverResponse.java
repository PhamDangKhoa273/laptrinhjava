package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DriverResponse {
    private Long driverId;
    private String driverCode;
    private String licenseNo;
    private String phone;
    private Long userId;
    private String userFullName;
    private Long managerUserId;
    private String managerFullName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}