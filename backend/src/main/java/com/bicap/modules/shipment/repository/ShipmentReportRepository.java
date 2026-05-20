package com.bicap.modules.shipment.repository;

import com.bicap.modules.shipment.entity.ShipmentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ShipmentReportRepository extends JpaRepository<ShipmentReport, Long> {
    List<ShipmentReport> findByShipmentIdOrderByCreatedAtDesc(Long shipmentId);
    List<ShipmentReport> findAllByOrderByCreatedAtDesc();

    /**
     * Reports for shipments whose orders belong to the given farm.
     * Used by FARM role per BR-SHP-090 / R-FRM-170: farm có thể xem báo cáo về shipment của farm mình.
     */
    @Query("SELECT r FROM ShipmentReport r " +
           "WHERE r.shipmentId IN (" +
           "  SELECT s.shipmentId FROM Shipment s " +
           "  WHERE s.orderId IN (SELECT o.orderId FROM Order o WHERE o.farmId = :farmId)" +
           ") ORDER BY r.createdAt DESC")
    List<ShipmentReport> findAllByFarmIdOrderByCreatedAtDesc(@Param("farmId") Long farmId);
}
