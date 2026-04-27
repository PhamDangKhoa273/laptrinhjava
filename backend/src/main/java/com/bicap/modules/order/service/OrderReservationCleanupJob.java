package com.bicap.modules.order.service;

import com.bicap.core.enums.OrderStatus;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.entity.OrderItem;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class OrderReservationCleanupJob {

    private final OrderRepository orderRepository;
    private final ProductListingRepository listingRepository;

    public OrderReservationCleanupJob(OrderRepository orderRepository, ProductListingRepository listingRepository) {
        this.orderRepository = orderRepository;
        this.listingRepository = listingRepository;
    }

    @Scheduled(fixedDelayString = "PT5M")
    @Transactional
    public void releaseExpiredReservations() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(30);
        List<Order> expired = orderRepository.findAll().stream()
                .filter(order -> order.getStatusEnum() == OrderStatus.PENDING)
                .filter(order -> order.getCreatedAt() != null && order.getCreatedAt().isBefore(cutoff))
                .toList();
        for (Order order : expired) {
            for (OrderItem item : order.getOrderItems()) {
                ProductListing listing = item.getListing();
                listing.setQuantityReserved(safe(listing.getQuantityReserved()).subtract(item.getQuantity()).max(BigDecimal.ZERO));
                listing.setQuantityAvailable(safe(listing.getQuantityAvailable()).add(item.getQuantity()));
                if ("SOLD_OUT".equalsIgnoreCase(listing.getStatus()) && listing.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0) {
                    listing.setStatus("ACTIVE");
                }
                listingRepository.save(listing);
            }
            order.setStatus(OrderStatus.CANCELLED);
            order.setCancellationReason("Reservation timeout");
            order.setCancelledAt(LocalDateTime.now());
            orderRepository.save(order);
        }
    }

    private BigDecimal safe(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}