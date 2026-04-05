package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RetailerResponse {
    private Long retailerId;
    private String retailerCode;
    private String retailerName;
    private String businessLicenseNo;
    private String address;
    private String status;
    private Long userId;
    private String userFullName;
}
