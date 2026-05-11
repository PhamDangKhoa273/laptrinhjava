package com.bicap.modules.shipment.repository;

import com.bicap.modules.shipment.entity.TrackingLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrackingLocationRepository extends JpaRepository<TrackingLocation, Long> {

    List<TrackingLocation> findByShipmentIdOrderByCreatedAtDesc(Long shipmentId);

    Optional<TrackingLocation> findFirstByShipmentIdOrderByCreatedAtDesc(Long shipmentId);

    List<TrackingLocation> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    @Query("SELECT t FROM TrackingLocation t WHERE t.shipmentId = :shipmentId " +
            "AND t.createdAt BETWEEN :startTime AND :endTime ORDER BY t.createdAt DESC")
    List<TrackingLocation> findByShipmentIdAndTimeRange(@Param("shipmentId") Long shipmentId,
                                                       @Param("startTime") LocalDateTime startTime,
                                                       @Param("endTime") LocalDateTime endTime);
}
