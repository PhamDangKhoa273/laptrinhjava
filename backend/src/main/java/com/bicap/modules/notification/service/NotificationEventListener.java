package com.bicap.modules.notification.service;

import com.bicap.modules.notification.dto.CreateNotificationRequest;
import com.bicap.core.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe các sự kiện trong hệ thống và tự động tạo thông báo
 * Author: Dinh Khang199
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    // ==================== Order Events ====================

    @Async
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        log.info("Nhận sự kiện OrderCreated cho orderId={}", event.getOrderId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getUserId())
                .title("Đơn hàng mới #" + event.getOrderId())
                .message("Đơn hàng của bạn đã được tạo thành công. Chúng tôi sẽ xử lý sớm nhất có thể.")
                .type(NotificationType.ORDER_CREATED)
                .referenceId(event.getOrderId())
                .referenceType("ORDER")
                .actionUrl("/orders/" + event.getOrderId())
                .build());
    }

    @Async
    @EventListener
    public void onOrderConfirmed(OrderConfirmedEvent event) {
        log.info("Nhận sự kiện OrderConfirmed cho orderId={}", event.getOrderId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getUserId())
                .title("Đơn hàng #" + event.getOrderId() + " đã xác nhận")
                .message("Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị.")
                .type(NotificationType.ORDER_CONFIRMED)
                .referenceId(event.getOrderId())
                .referenceType("ORDER")
                .actionUrl("/orders/" + event.getOrderId())
                .build());
    }

    @Async
    @EventListener
    public void onOrderShipped(OrderShippedEvent event) {
        log.info("Nhận sự kiện OrderShipped cho orderId={}", event.getOrderId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getUserId())
                .title("Đơn hàng #" + event.getOrderId() + " đang được giao")
                .message("Đơn hàng của bạn đang trên đường giao. Mã vận đơn: " + event.getTrackingCode())
                .type(NotificationType.ORDER_SHIPPED)
                .referenceId(event.getOrderId())
                .referenceType("ORDER")
                .actionUrl("/orders/" + event.getOrderId())
                .build());
    }

    @Async
    @EventListener
    public void onOrderDelivered(OrderDeliveredEvent event) {
        log.info("Nhận sự kiện OrderDelivered cho orderId={}", event.getOrderId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getUserId())
                .title("Đơn hàng #" + event.getOrderId() + " đã giao thành công")
                .message("Đơn hàng của bạn đã được giao. Cảm ơn bạn đã mua hàng!")
                .type(NotificationType.ORDER_DELIVERED)
                .referenceId(event.getOrderId())
                .referenceType("ORDER")
                .actionUrl("/orders/" + event.getOrderId())
                .build());
    }

    @Async
    @EventListener
    public void onOrderCancelled(OrderCancelledEvent event) {
        log.info("Nhận sự kiện OrderCancelled cho orderId={}", event.getOrderId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getUserId())
                .title("Đơn hàng #" + event.getOrderId() + " đã bị hủy")
                .message("Đơn hàng của bạn đã bị hủy. Lý do: " + event.getReason())
                .type(NotificationType.ORDER_CANCELLED)
                .referenceId(event.getOrderId())
                .referenceType("ORDER")
                .actionUrl("/orders/" + event.getOrderId())
                .build());
    }

    // ==================== Payment Events ====================

    @Async
    @EventListener
    public void onPaymentSuccess(PaymentSuccessEvent event) {
        log.info("Nhận sự kiện PaymentSuccess cho paymentId={}", event.getPaymentId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getUserId())
                .title("Thanh toán thành công")
                .message(String.format("Bạn đã thanh toán thành công %.0f VNĐ cho đơn hàng #%d",
                        event.getAmount(), event.getOrderId()))
                .type(NotificationType.PAYMENT_SUCCESS)
                .referenceId(event.getPaymentId())
                .referenceType("PAYMENT")
                .actionUrl("/payments/" + event.getPaymentId())
                .build());
    }

    @Async
    @EventListener
    public void onPaymentFailed(PaymentFailedEvent event) {
        log.info("Nhận sự kiện PaymentFailed cho paymentId={}", event.getPaymentId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getUserId())
                .title("Thanh toán thất bại")
                .message("Thanh toán của bạn không thành công. Lý do: " + event.getReason() +
                         ". Vui lòng thử lại.")
                .type(NotificationType.PAYMENT_FAILED)
                .referenceId(event.getPaymentId())
                .referenceType("PAYMENT")
                .actionUrl("/orders/" + event.getOrderId())
                .build());
    }

    // ==================== Product Events ====================

    @Async
    @EventListener
    public void onProductApproved(ProductApprovedEvent event) {
        log.info("Nhận sự kiện ProductApproved cho productId={}", event.getProductId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getSellerId())
                .title("Sản phẩm đã được duyệt")
                .message("Sản phẩm \"" + event.getProductName() + "\" của bạn đã được duyệt và hiển thị trên hệ thống.")
                .type(NotificationType.PRODUCT_APPROVED)
                .referenceId(event.getProductId())
                .referenceType("PRODUCT")
                .actionUrl("/products/" + event.getProductId())
                .build());
    }

    @Async
    @EventListener
    public void onProductLowStock(ProductLowStockEvent event) {
        log.info("Nhận sự kiện ProductLowStock cho productId={}", event.getProductId());
        notificationService.createNotification(CreateNotificationRequest.builder()
                .userId(event.getSellerId())
                .title("Cảnh báo: Sản phẩm sắp hết hàng")
                .message("Sản phẩm \"" + event.getProductName() + "\" chỉ còn " + event.getRemainingStock() + " sản phẩm.")
                .type(NotificationType.PRODUCT_LOW_STOCK)
                .referenceId(event.getProductId())
                .referenceType("PRODUCT")
                .actionUrl("/seller/products/" + event.getProductId())
                .build());
    }

    // ==================== Inner Event Classes ====================

    public record OrderCreatedEvent(Long orderId, Long userId) {}
    public record OrderConfirmedEvent(Long orderId, Long userId) {}
    public record OrderShippedEvent(Long orderId, Long userId, String trackingCode) {}
    public record OrderDeliveredEvent(Long orderId, Long userId) {}
    public record OrderCancelledEvent(Long orderId, Long userId, String reason) {}
    public record PaymentSuccessEvent(Long paymentId, Long orderId, Long userId, Double amount) {}
    public record PaymentFailedEvent(Long paymentId, Long orderId, Long userId, String reason) {}
    public record ProductApprovedEvent(Long productId, Long sellerId, String productName) {}
    public record ProductLowStockEvent(Long productId, Long sellerId, String productName, Integer remainingStock) {}
}
