package com.bicap.modules.shipment.dto;

import java.time.LocalDateTime;

public class ShipmentResponse {
    private Long shipmentId;
    private Long orderId;
    private Long shippingManagerUserId;
    private Long driverId;
    private Long vehicleId;
    private String status;
    private LocalDateTime pickupConfirmedAt;
    private LocalDateTime deliveryConfirmedAt;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getShippingManagerUserId() { return shippingManagerUserId; }
    public void setShippingManagerUserId(Long shippingManagerUserId) { this.shippingManagerUserId = shippingManagerUserId; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getPickupConfirmedAt() { return pickupConfirmedAt; }
    public void setPickupConfirmedAt(LocalDateTime pickupConfirmedAt) { this.pickupConfirmedAt = pickupConfirmedAt; }
    public LocalDateTime getDeliveryConfirmedAt() { return deliveryConfirmedAt; }
    public void setDeliveryConfirmedAt(LocalDateTime deliveryConfirmedAt) { this.deliveryConfirmedAt = deliveryConfirmedAt; }
    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
