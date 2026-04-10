package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "farming_seasons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmingSeason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "season_id")
    private Long seasonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "season_code", nullable = false, unique = true)
    private String seasonCode;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expected_harvest_date")
    private LocalDate expectedHarvestDate;

    @Column(name = "actual_harvest_date")
    private LocalDate actualHarvestDate;

    @Column(name = "farming_method")
    private String farmingMethod;

    @Column(name = "season_status", nullable = false)
    @Builder.Default
    private String seasonStatus = "PLANNED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
