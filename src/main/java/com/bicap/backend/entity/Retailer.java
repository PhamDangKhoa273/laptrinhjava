package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "retailers")
@Getter
@Setter
public class Retailer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "retailer_id")
    private Long retailerId;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "retailer_code", nullable = false, unique = true, length = 50)
    private String retailerCode;

    @Column(name = "retailer_name", nullable = false, length = 150)
    private String retailerName;

    @Column(name = "business_license_no", nullable = false, unique = true, length = 100)
    private String businessLicenseNo;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";
}