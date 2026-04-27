package com.bicap.modules.shipment.dto;

import jakarta.validation.constraints.NotNull;

public class CreateShipmentRequest {
    @NotNull
    private Long orderId;
    private Long driverId;
    private Long vehicleId;
    private String note;
    private String idempotencyKey;
    private String expectedBatchCode;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
    public String getExpectedBatchCode() { return expectedBatchCode; }
    public void setExpectedBatchCode(String expectedBatchCode) { this.expectedBatchCode = expectedBatchCode; }
}
