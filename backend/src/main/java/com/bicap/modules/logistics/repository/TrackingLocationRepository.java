package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.TrackingLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrackingLocationRepository extends JpaRepository<TrackingLocation, Long> {
    
    /**
     * Tìm tất cả vị trí theo dõi cho một đơn vận chuyển, mới nhất trước
     */
    List<TrackingLocation> findByShipmentIdOrderByCreatedAtDesc(Long shipmentId);
    
    /**
     * Tìm tất cả vị trí theo dõi cho một tài xế, mới nhất trước
     */
    List<TrackingLocation> findByDriverIdOrderByCreatedAtDesc(Long driverId);
    
    /**
     * Tìm vị trí gần đây nhất cho một đơn vận chuyển
     */
    Optional<TrackingLocation> findFirstByShipmentIdOrderByCreatedAtDesc(Long shipmentId);
    
    /**
     * Tìm vị trí gần đây nhất cho một tài xế
     */
    Optional<TrackingLocation> findFirstByDriverIdOrderByCreatedAtDesc(Long driverId);
    
    /**
     * Tìm các vị trí theo dõi trong khoảng thời gian nhất định cho một đơn vận chuyển
     */
    @Query("SELECT t FROM TrackingLocation t WHERE t.shipment.shipmentId = :shipmentId " +
           "AND t.createdAt BETWEEN :startTime AND :endTime ORDER BY t.createdAt DESC")
    List<TrackingLocation> findByShipmentIdAndTimeRange(
        @Param("shipmentId") Long shipmentId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}
