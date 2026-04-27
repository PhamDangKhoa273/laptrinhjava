package com.bicap.modules.shipment.dto;

import java.time.LocalDateTime;

public class ShipmentResponse {
    private Long shipmentId;
    private Long orderId;
    private String orderStatus;
    private String paymentStatus;
    private String retailerName;
    private String farmName;
    private String batchCode;
    private String traceCode;
    private String qrCodeUrl;
    private Long shippingManagerUserId;
    private Long driverId;
    private String driverCode;
    private String driverName;
    private Long vehicleId;
    private String vehiclePlateNo;
    private String vehicleType;
    private String status;
    private String note;
    private LocalDateTime pickupConfirmedAt;
    private LocalDateTime deliveryConfirmedAt;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private java.util.List<ShipmentLogResponse> logs;
    private java.util.List<ShipmentReportResponse> reports;

    public Long getShipmentId() { return shipmentId; }
    public void setShipmentId(Long shipmentId) { this.shipmentId = shipmentId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getRetailerName() { return retailerName; }
    public void setRetailerName(String retailerName) { this.retailerName = retailerName; }
    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }
    public String getBatchCode() { return batchCode; }
    public void setBatchCode(String batchCode) { this.batchCode = batchCode; }
    public String getTraceCode() { return traceCode; }
    public void setTraceCode(String traceCode) { this.traceCode = traceCode; }
    public String getQrCodeUrl() { return qrCodeUrl; }
    public void setQrCodeUrl(String qrCodeUrl) { this.qrCodeUrl = qrCodeUrl; }
    public Long getShippingManagerUserId() { return shippingManagerUserId; }
    public void setShippingManagerUserId(Long shippingManagerUserId) { this.shippingManagerUserId = shippingManagerUserId; }
    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getVehiclePlateNo() { return vehiclePlateNo; }
    public void setVehiclePlateNo(String vehiclePlateNo) { this.vehiclePlateNo = vehiclePlateNo; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
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

    public java.util.List<ShipmentLogResponse> getLogs() { return logs; }
    public void setLogs(java.util.List<ShipmentLogResponse> logs) { this.logs = logs; }
    public java.util.List<ShipmentReportResponse> getReports() { return reports; }
    public void setReports(java.util.List<ShipmentReportResponse> reports) { this.reports = reports; }
}
