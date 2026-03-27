package com.bicap.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateVehicleRequest {
    private String vehicleType;
    private BigDecimal capacity;
    private String status;
}