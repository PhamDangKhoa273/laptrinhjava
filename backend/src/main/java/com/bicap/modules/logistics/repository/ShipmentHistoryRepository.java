package com.bicap.modules.logistics.repository;

import com.bicap.modules.logistics.entity.ShipmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ShipmentHistoryRepository extends JpaRepository<ShipmentHistory, Long> {
    
    /**
     * Tìm tất cả bản ghi lịch sử cho một đơn vận chuyển, sắp xếp theo mới nhất trước
     */
    List<ShipmentHistory> findByShipmentIdOrderByChangedAtDesc(Long shipmentId);
    
    /**
     * Tìm tất cả bản ghi lịch sử cho một đơn vận chuyển, sắp xếp theo cũ nhất trước
     */
    List<ShipmentHistory> findByShipmentIdOrderByChangedAtAsc(Long shipmentId);
    
    /**
     * Tìm tất cả những thay đổi trạng thái được thực hiện bởi một người dùng cụ thể
     */
    List<ShipmentHistory> findByChangedByIdOrderByChangedAtDesc(Long userId);
}
