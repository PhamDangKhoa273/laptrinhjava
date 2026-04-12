package com.bicap.modules.logistics.dto;

import java.math.BigDecimal;

public class VehicleResponse {
    private Long vehicleId;
    private String plateNo;
    private String vehicleType;
    private BigDecimal capacity;
    private String status;
    private Long managerUserId;
    private String managerFullName;

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getPlateNo() { return plateNo; }
    public void setPlateNo(String plateNo) { this.plateNo = plateNo; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public BigDecimal getCapacity() { return capacity; }
    public void setCapacity(BigDecimal capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getManagerUserId() { return managerUserId; }
    public void setManagerUserId(Long managerUserId) { this.managerUserId = managerUserId; }

    public String getManagerFullName() { return managerFullName; }
    public void setManagerFullName(String managerFullName) { this.managerFullName = managerFullName; }
}
