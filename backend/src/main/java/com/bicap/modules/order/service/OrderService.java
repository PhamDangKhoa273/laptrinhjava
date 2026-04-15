package com.bicap.modules.order.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.order.dto.CreateOrderRequest;
import com.bicap.modules.order.dto.OrderItemRequest;
import com.bicap.modules.order.dto.OrderItemResponse;
import com.bicap.modules.order.dto.OrderResponse;
import com.bicap.modules.order.entity.Order;
import com.bicap.modules.order.entity.OrderItem;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.entity.Retailer;
import com.bicap.modules.retailer.repository.RetailerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final RetailerRepository retailerRepository;
    private final ProductListingRepository listingRepository;

    public OrderService(OrderRepository orderRepository,
                        RetailerRepository retailerRepository,
                        ProductListingRepository listingRepository) {
        this.orderRepository = orderRepository;
        this.retailerRepository = retailerRepository;
        this.listingRepository = listingRepository;
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
}
