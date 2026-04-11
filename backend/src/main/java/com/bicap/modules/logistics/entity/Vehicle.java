package com.bicap.modules.logistics.entity;
import com.bicap.modules.user.entity.User;

import com.bicap.modules.user.entity.User;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;

    @ManyToOne(optional = false)
    @JoinColumn(name = "manager_user_id", nullable = false)
    private User managerUser;

    @Column(name = "plate_no", nullable = false, unique = true, length = 50)
    private String plateNo;

    @Column(name = "vehicle_type", nullable = false, length = 50)
    private String vehicleType;

    @Column(name = "capacity", nullable = false, precision = 10, scale = 2)
    private BigDecimal capacity;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public User getManagerUser() { return managerUser; }
    public void setManagerUser(User managerUser) { this.managerUser = managerUser; }

    public String getPlateNo() { return plateNo; }
    public void setPlateNo(String plateNo) { this.plateNo = plateNo; }

    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }

    public BigDecimal getCapacity() { return capacity; }
    public void setCapacity(BigDecimal capacity) { this.capacity = capacity; }
}
