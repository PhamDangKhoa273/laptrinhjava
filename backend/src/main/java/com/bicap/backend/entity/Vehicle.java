package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
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
}
