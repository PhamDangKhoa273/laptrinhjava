package com.bicap.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
<<<<<<< HEAD:src/main/java/com/bicap/backend/entity/FarmingSeason.java
=======
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/entity/FarmingSeason.java

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "farming_seasons")
@Getter
@Setter
<<<<<<< HEAD:src/main/java/com/bicap/backend/entity/FarmingSeason.java
=======
@NoArgsConstructor
@AllArgsConstructor
@Builder
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/entity/FarmingSeason.java
public class FarmingSeason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "season_id")
    private Long seasonId;

<<<<<<< HEAD:src/main/java/com/bicap/backend/entity/FarmingSeason.java
    @ManyToOne(optional = false)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "plant_name", nullable = false, length = 150)
    private String plantName;
=======
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "season_code", nullable = false, unique = true)
    private String seasonCode;
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/entity/FarmingSeason.java

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

<<<<<<< HEAD:src/main/java/com/bicap/backend/entity/FarmingSeason.java
    @Column(name = "expected_end_date", nullable = false)
    private LocalDate expectedEndDate;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PLANNED";

    @Column(name = "blockchain_tx_hash", length = 100)
    private String blockchainTxHash;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
=======
    @Column(name = "expected_harvest_date")
    private LocalDate expectedHarvestDate;

    @Column(name = "actual_harvest_date")
    private LocalDate actualHarvestDate;

    @Column(name = "farming_method")
    private String farmingMethod;

    @Column(name = "season_status", nullable = false)
    private String seasonStatus = "PLANNED";

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/entity/FarmingSeason.java

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
<<<<<<< HEAD:src/main/java/com/bicap/backend/entity/FarmingSeason.java
=======

    // Manual Fallbacks for Lombok
    public Long getSeasonId() { return seasonId; }
    public String getSeasonCode() { return seasonCode; }
    public Farm getFarm() { return farm; }
    public Product getProduct() { return product; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getExpectedHarvestDate() { return expectedHarvestDate; }
    public LocalDate getActualHarvestDate() { return actualHarvestDate; }
    public String getFarmingMethod() { return farmingMethod; }
    public String getSeasonStatus() { return seasonStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
>>>>>>> d2684be:backend/src/main/java/com/bicap/backend/entity/FarmingSeason.java
}
