package com.bicap.modules.shipment.repository;

import com.bicap.modules.shipment.entity.ShipmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentLogRepository extends JpaRepository<ShipmentLog, Long> {
    List<ShipmentLog> findByShipmentIdOrderByRecordedAtDesc(Long shipmentId);
}
