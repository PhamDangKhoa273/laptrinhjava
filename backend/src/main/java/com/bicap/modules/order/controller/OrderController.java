package com.bicap.modules.order.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.order.dto.*;
import com.bicap.modules.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping({"/api/v1/orders", "/api/orders"})
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng thành công", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrders() {
        List<OrderResponse> orders = orderService.getOrders();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", orders);
        payload.put("totalItems", orders.size());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", payload));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RETAILER') or hasRole('FARM') or hasRole('SHIPPING_MANAGER')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công", response));
    }

    @GetMapping("/{id}/status-history")
    @PreAuthorize("hasRole('RETAILER') or hasRole('FARM') or hasRole('SHIPPING_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderStatusHistory(@PathVariable Long id) {
        List<OrderStatusHistoryResponse> history = orderService.getOrderStatusHistory(id);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", history);
        payload.put("totalItems", history.size());
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử thay đổi trạng thái thành công", payload));
    }
}
