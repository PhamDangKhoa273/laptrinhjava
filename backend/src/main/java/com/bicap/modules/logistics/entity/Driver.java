package com.bicap.modules.logistics.entity;

import com.bicap.modules.user.entity.User;

import jakarta.persistence.*;

@Entity
@Table(name = "drivers")
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

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public User getManagerUser() { return managerUser; }
    public void setManagerUser(User managerUser) { this.managerUser = managerUser; }
    public String getDriverCode() { return driverCode; }
    public void setDriverCode(String driverCode) { this.driverCode = driverCode; }
    public String getLicenseNo() { return licenseNo; }
    public void setLicenseNo(String licenseNo) { this.licenseNo = licenseNo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
