package com.bicap.backend.dto;

import lombok.Data;

@Data
public class UpdateDriverRequest {
    private String licenseNo;
    private String phone;
}