package com.bicap.modules.order.repository;

import com.bicap.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByRetailerId(Long retailerId);
    List<Order> findByFarmId(Long farmId);
    boolean existsByDepositAmountIsNotNullAndOrderIdNot(Long orderId);
}
