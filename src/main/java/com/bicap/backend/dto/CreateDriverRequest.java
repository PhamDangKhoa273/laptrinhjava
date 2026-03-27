package com.bicap.backend.dto;

import lombok.Data;

@Data
public class CreateDriverRequest {
    private String driverCode;
    private String licenseNo;
    private String phone;
    private Long userId;
    private Long managerUserId;
}