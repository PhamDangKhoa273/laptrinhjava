package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DriverResponse {
    private Long driverId;
    private String driverCode;
    private String licenseNo;
    private String status;
    private Long userId;
    private String userFullName;
    private Long managerUserId;
    private String managerFullName;
}
