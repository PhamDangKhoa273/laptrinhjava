package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "service_packages")
@Getter
@Setter
public class ServicePackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id")
    private Long packageId;

    @Column(name = "package_code", nullable = false, unique = true, length = 50)
    private String packageCode;

    @Column(name = "package_name", nullable = false, length = 150)
    private String packageName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "max_seasons", nullable = false)
    private Integer maxSeasons;

    @Column(name = "max_listings", nullable = false)
    private Integer maxListings;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ACTIVE";
}