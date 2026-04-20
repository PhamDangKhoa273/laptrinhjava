package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.Shipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    
    /**
     * Tìm tất cả các đơn vận chuyển được giao cho một tài xế
     */
    List<Shipment> findByDriverId(Long driverId);
    
    /**
     * Tìm đơn vận chuyển của một đơn hàng (quan hệ one-to-one)
     */
    Optional<Shipment> findByOrderId(Long orderId);
    
    /**
     * Tìm tất cả các đơn vận chuyển được quản lý bởi một nhân viên vận chuyển
     */
    List<Shipment> findByShippingManagerId(Long shippingManagerId);
    
    /**
     * Tìm tất cả các đơn vận chuyển có trạng thái cụ thể
     */
    List<Shipment> findByStatus(String status);
}
