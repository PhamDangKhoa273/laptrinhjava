package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrderId(Long orderId);

    List<Shipment> findByDriverId(Long driverId);

    List<Shipment> findByShippingManagerId(Long shippingManagerId);

    List<Shipment> findByStatus(String status);
}
