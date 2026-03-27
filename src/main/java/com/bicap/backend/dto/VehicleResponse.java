package com.bicap.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}