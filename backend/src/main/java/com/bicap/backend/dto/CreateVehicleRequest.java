package com.bicap.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateVehicleRequest {

    @NotBlank(message = "plateNo không được để trống")
    private String plateNo;

    @NotBlank(message = "vehicleType không được để trống")
    private String vehicleType;

    @NotNull(message = "capacity không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "capacity phải lớn hơn 0")
    private BigDecimal capacity;

    private String status;
}