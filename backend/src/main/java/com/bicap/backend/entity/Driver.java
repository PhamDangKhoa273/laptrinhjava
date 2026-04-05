package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "drivers")
@Getter
@Setter
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "driver_id")
    private Long driverId;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne
    @JoinColumn(name = "manager_user_id", nullable = false)
    private User managerUser;

    @Column(name = "driver_code", nullable = false, unique = true)
    private String driverCode;

    @Column(name = "license_no", nullable = false, unique = true)
    private String licenseNo;

    @Column(name = "status", nullable = false)
    private String status = "ACTIVE";
}
