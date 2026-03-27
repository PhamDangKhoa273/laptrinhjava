package com.bicap.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateVehicleRequest {
    private String plateNo;
    private String vehicleType;
    private BigDecimal capacity;
    private String status;
    private Long managerUserId;
}