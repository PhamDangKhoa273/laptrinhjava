package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VehicleResponse {
    private Long vehicleId;
    private String plateNo;
    private String vehicleType;
    private BigDecimal capacity;
    private String status;
    private Long managerUserId;
    private String managerFullName;
}