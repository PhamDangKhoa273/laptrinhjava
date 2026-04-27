package com.bicap.modules.logistics.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public class UpdateVehicleRequest {

    @NotBlank(message = "vehicleType không được để trống")
    private String vehicleType;

    @DecimalMin(value = "0.0", inclusive = false, message = "capacity phải lớn hơn 0")
    private BigDecimal capacity;

    private String status;

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public BigDecimal getCapacity() { return capacity; }
    public void setCapacity(BigDecimal capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
