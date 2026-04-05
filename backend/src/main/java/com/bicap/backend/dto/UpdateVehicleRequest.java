package com.bicap.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateVehicleRequest {

    @NotBlank(message = "vehicleType không được để trống")
    private String vehicleType;

    @DecimalMin(value = "0.0", inclusive = false, message = "capacity phải lớn hơn 0")
    private BigDecimal capacity;

    private String status;
}
