package com.bicap.modules.shipment.dto;

import jakarta.validation.constraints.NotNull;

public class CreateShipmentRequest {
    @NotNull
    private Long orderId;
    private Long driverId;
    private Long vehicleId;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
}
