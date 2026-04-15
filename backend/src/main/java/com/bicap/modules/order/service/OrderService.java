package com.bicap.modules.order.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.dto.BlockchainResult;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.order.dto.*;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.entity.OrderItem;
import com.bicap.modules.order.entity.OrderStatusHistory;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.order.repository.OrderStatusHistoryRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final ProductListingRepository listingRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final BlockchainService blockchainService;

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"
    );

    private static final Map<String, Set<String>> STATUS_TRANSITIONS = Map.of(
            "PENDING", Set.of("CONFIRMED", "CANCELLED"),
            "CONFIRMED", Set.of("SHIPPING"),
            "SHIPPING", Set.of("COMPLETED"),
            "COMPLETED", Set.of(),
            "CANCELLED", Set.of()
    );

    private static final Set<String> BLOCKCHAIN_RECORD_STATUSES = Set.of("CONFIRMED", "COMPLETED");

    public OrderService(OrderRepository orderRepository,
                        RetailerRepository retailerRepository,
                        ProductListingRepository listingRepository,
                        OrderStatusHistoryRepository statusHistoryRepository,
                        BlockchainService blockchainService) {
        this.orderRepository = orderRepository;
        this.retailerRepository = retailerRepository;
        this.listingRepository = listingRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.blockchainService = blockchainService;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));

        List<OrderItemRequest> items = request.getItems();
        if (items == null || items.isEmpty()) {
            throw new BusinessException("Danh sách sản phẩm đặt hàng là bắt buộc");
        }

        Order order = new Order();
        order.setRetailerId(retailer.getRetailerId());
        order.setStatus("PENDING");

        BigDecimal totalAmount = BigDecimal.ZERO;
        Long farmId = null;

        Map<Long, BigDecimal> quantityByListing = items.stream()
                .collect(Collectors.toMap(OrderItemRequest::getListingId,
                        OrderItemRequest::getQuantity,
                        BigDecimal::add));

        for (Map.Entry<Long, BigDecimal> entry : quantityByListing.entrySet()) {
            Long listingId = entry.getKey();
            BigDecimal orderQuantity = entry.getValue();

            ProductListing listing = listingRepository.findById(listingId)
                    .orElseThrow(() -> new BusinessException("Listing không tồn tại: " + listingId));
            if (!"ACTIVE".equalsIgnoreCase(listing.getStatus())) {
                throw new BusinessException("Listing " + listingId + " không khả dụng");
            }
            if (listing.getQuantityAvailable() == null || listing.getQuantityAvailable().compareTo(orderQuantity) < 0) {
                throw new BusinessException("Số lượng đặt hàng không được lớn hơn quantity_available của listing " + listingId);
            }

            if (listing.getBatch() == null || listing.getBatch().getSeason() == null || listing.getBatch().getSeason().getFarm() == null) {
                throw new BusinessException("Listing " + listingId + " không liên kết farm hợp lệ");
            }

            Long listingFarmId = listing.getBatch().getSeason().getFarm().getFarmId();
            if (farmId == null) {
                farmId = listingFarmId;
            } else if (!farmId.equals(listingFarmId)) {
                throw new BusinessException("Một đơn hàng chỉ được tạo từ cùng một farm");
            }

            listing.setQuantityAvailable(listing.getQuantityAvailable().subtract(orderQuantity));
            if (listing.getQuantityAvailable().compareTo(BigDecimal.ZERO) <= 0) {
                listing.setStatus("SOLD_OUT");
            }
            listingRepository.save(listing);

            OrderItem orderItem = new OrderItem();
            orderItem.setListing(listing);
            orderItem.setQuantity(orderQuantity);
            orderItem.setPrice(listing.getPrice());
            order.addOrderItem(orderItem);

            totalAmount = totalAmount.add(listing.getPrice().multiply(orderQuantity));
        }

        if (farmId == null) {
            throw new BusinessException("Không xác định được farm của đơn hàng");
        }

        order.setFarmId(farmId);
        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        return toResponse(savedOrder);
    }

    public List<OrderResponse> getOrders() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));
        return orderRepository.findByRetailerId(retailer.getRetailerId()).stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse getOrderById(Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Retailer retailer = retailerRepository.findByUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("Retailer chưa được đăng ký"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + id));
        if (!order.getRetailerId().equals(retailer.getRetailerId())) {
            throw new BusinessException("Bạn không có quyền xem đơn hàng này");
        }
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream()
                .map(this::toItemResponse)
                .toList();
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .retailerId(order.getRetailerId())
                .farmId(order.getFarmId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(items)
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .listingId(item.getListing().getListingId())
                .title(item.getListing().getTitle())
                .batchCode(item.getListing().getBatch().getBatchCode())
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subTotal(item.getPrice().multiply(item.getQuantity()))
                .build();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        // Validate new status
        String newStatus = request.getStatus();
        if (!VALID_STATUSES.contains(newStatus)) {
            throw new BusinessException("Trạng thái không hợp lệ: " + newStatus);
        }

        // Get order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));

        String currentStatus = order.getStatus();

        // Validate status transition
        Set<String> allowedTransitions = STATUS_TRANSITIONS.getOrDefault(currentStatus, new HashSet<>());
        if (!allowedTransitions.contains(newStatus)) {
            throw new BusinessException(
                    String.format("Không thể chuyển từ trạng thái '%s' sang '%s'", currentStatus, newStatus)
            );
        }

        // Record status change in history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrderId(orderId);
        history.setPreviousStatus(currentStatus);
        history.setNewStatus(newStatus);
        history.setReason(request.getReason());

        // Record to blockchain (only for CONFIRMED and COMPLETED statuses)
        if (BLOCKCHAIN_RECORD_STATUSES.contains(newStatus)) {
            try {
                OrderStatusBlockchainPayload payload = new OrderStatusBlockchainPayload(
                        orderId,
                        order.getRetailerId(),
                        order.getFarmId(),
                        currentStatus,
                        newStatus,
                        request.getReason(),
                        LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME)
                );

                BlockchainResult blockchainResult = blockchainService.saveTransaction(
                        "ORDER",
                        orderId,
                        "STATUS_UPDATE",
                        com.bicap.modules.batch.util.HashUtils.toCanonicalJson(payload.toMap())
                );

                history.setBlockchainTxHash(blockchainResult.getTxHash());
            } catch (Exception e) {
                // Log but don't fail - blockchain recording is non-blocking
                // In production, you might want to log this to a separate error tracking system
            }
        }

        statusHistoryRepository.save(history);

        // Update order status
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);

        return toResponse(updatedOrder);
    }

    public List<OrderStatusHistoryResponse> getOrderStatusHistory(Long orderId) {
        // Verify order exists
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy đơn hàng với ID: " + orderId));

        return statusHistoryRepository.findByOrderIdOrderByChangedAtDesc(orderId).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    private OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history) {
        return OrderStatusHistoryResponse.builder()
                .historyId(history.getHistoryId())
                .orderId(history.getOrderId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .reason(history.getReason())
                .blockchainTxHash(history.getBlockchainTxHash())
                .changedAt(history.getChangedAt())
                .build();
    }
}
