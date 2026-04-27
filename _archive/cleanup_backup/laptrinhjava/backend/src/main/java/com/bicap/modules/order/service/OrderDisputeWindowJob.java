package com.bicap.modules.order.service;

import com.bicap.core.enums.OrderPaymentStatus;
import com.bicap.core.enums.OrderStatus;
import com.bicap.modules.order.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class OrderDisputeWindowJob {

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public OrderDisputeWindowJob(OrderRepository orderRepository,
                                 OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }
    
    @Scheduled(fixedDelayString = "${app.order.dispute-window-hours:24}0000")
    @Transactional
    public void closeEligibleOrders() {
        LocalDateTime now = LocalDateTime.now();
        orderRepository.findAll().stream()
                .filter(order -> order.getStatusEnum() == OrderStatus.DELIVERED)
                .filter(order -> order.getCloseEligibleAt() != null && !order.getCloseEligibleAt().isAfter(now))
                .filter(order -> order.getPaymentStatusEnum() == OrderPaymentStatus.DEPOSIT_PAID)
                .forEach(order -> orderService.resolveAfterDisputeWindow(order.getOrderId(), false, "Auto close after dispute window"));
    }
}
