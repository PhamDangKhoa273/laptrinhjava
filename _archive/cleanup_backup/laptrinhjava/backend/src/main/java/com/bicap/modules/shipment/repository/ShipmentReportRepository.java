package com.bicap.modules.shipment.repository;

import com.bicap.modules.shipment.entity.ShipmentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentReportRepository extends JpaRepository<ShipmentReport, Long> {
    List<ShipmentReport> findByShipmentIdOrderByCreatedAtDesc(Long shipmentId);
}
