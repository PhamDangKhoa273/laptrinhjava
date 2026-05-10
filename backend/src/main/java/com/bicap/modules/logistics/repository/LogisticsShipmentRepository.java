package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LogisticsShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrderOrderId(Long orderId);
    List<Shipment> findByDriverDriverId(Long driverId);
    List<Shipment> findByShippingManagerUserId(Long shippingManagerUserId);
    List<Shipment> findByStatus(String status);
}