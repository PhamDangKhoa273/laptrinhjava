package com.bicap.modules.logistics.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateVehicleRequest {

    @NotBlank(message = "plateNo không được để trống")
    private String plateNo;

    @NotBlank(message = "vehicleType không được để trống")
    private String vehicleType;

    @NotNull(message = "capacity không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "capacity phải lớn hơn 0")
    private BigDecimal capacity;

    private String status;

    public String getPlateNo() { return plateNo; }
    public void setPlateNo(String plateNo) { this.plateNo = plateNo; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public BigDecimal getCapacity() { return capacity; }
    public void setCapacity(BigDecimal capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
