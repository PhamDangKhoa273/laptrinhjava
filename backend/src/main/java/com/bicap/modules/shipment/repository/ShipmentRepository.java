package com.bicap.modules.shipment.repository;

import com.bicap.modules.shipment.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    Optional<Shipment> findByOrderIdAndVersion(Long orderId, Long version);
    Optional<Shipment> findByOrderId(Long orderId);
    Optional<Shipment> findByOrderIdAndStatusNot(Long orderId, com.bicap.core.enums.ShipmentStatus status);
    Optional<Shipment> findFirstByOrderIdAndStatusNotOrderByCreatedAtDesc(Long orderId, com.bicap.core.enums.ShipmentStatus status);
    boolean existsByOrderIdAndDriverId(Long orderId, Long driverId);
    List<Shipment> findByDriverId(Long driverId);
    List<Shipment> findByShippingManagerUserIdOrderByCreatedAtDesc(Long shippingManagerUserId);

    @Query("SELECT s FROM Shipment s WHERE s.orderId IN (SELECT o.orderId FROM Order o WHERE o.farmId = :farmId) ORDER BY s.createdAt DESC")
    List<Shipment> findAllByFarmId(@Param("farmId") Long farmId);

    @Query("SELECT s FROM Shipment s WHERE s.orderId IN (SELECT o.orderId FROM Order o WHERE o.retailerId = :retailerId) ORDER BY s.createdAt DESC")
    List<Shipment> findAllByRetailerId(@Param("retailerId") Long retailerId);
}
