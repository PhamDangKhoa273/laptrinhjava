package com.bicap.modules.order.controller;

// Workspace sync trigger

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.media.dto.MediaFileResponse;
import com.bicap.modules.order.dto.*;
import com.bicap.modules.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    @PreAuthorize("hasAnyRole('RETAILER','FARM','SHIPPING_MANAGER','DRIVER','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrders() {
        List<OrderResponse> orders = orderService.getOrders();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", orders);
        payload.put("totalItems", orders.size());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công", payload));
    }

    @GetMapping("/{id}/status-history")
    @PreAuthorize("hasAnyRole('RETAILER','FARM','SHIPPING_MANAGER','DRIVER','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderStatusHistory(@PathVariable Long id) {
        List<OrderStatusHistoryResponse> history = orderService.getOrderStatusHistory(id);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", history);
        payload.put("totalItems", history.size());
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử thay đổi trạng thái thành công", payload));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('RETAILER','FARM','SHIPPING_MANAGER','DRIVER','ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công", response));
    }

    @PostMapping("/{id}/deposit")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<OrderResponse>> payDeposit(
            @PathVariable Long id,
            @Valid @RequestBody OrderDepositRequest request) {
        OrderResponse response = orderService.payDeposit(id, request);
        return ResponseEntity.ok(ApiResponse.success("Yêu cầu thanh toán đặt cọc đã được ghi nhận", response));
    }

    @PostMapping("/deposit/gateway/callback")
    public ResponseEntity<ApiResponse<OrderResponse>> verifyDepositGatewayCallback(
            @Valid @RequestBody OrderDepositCallbackRequest request) {
        OrderResponse response = orderService.verifyDepositGatewayCallback(request);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận thanh toán đặt cọc thành công", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('RETAILER') or hasRole('FARM') or hasRole('SHIPPING_MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công", response));
    }

    @PostMapping("/{id}/shipping-proof")
    @PreAuthorize("hasRole('SHIPPING_MANAGER') or hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<OrderResponse>> uploadShippingProof(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryProofRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bằng chứng vận chuyển thành công", orderService.uploadShippingProof(id, request)));
    }

    @PostMapping(value = "/{id}/shipping-proof/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('SHIPPING_MANAGER') or hasRole('DRIVER')")
    public ResponseEntity<ApiResponse<MediaFileResponse>> uploadShippingProofFile(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Upload bằng chứng vận chuyển thành công", orderService.uploadShippingProofFile(id, file)));
    }

    @PostMapping("/{id}/confirm-delivery")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmDelivery(
            @PathVariable Long id,
            @Valid @RequestBody ConfirmDeliveryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Xác nhận nhận hàng thành công", orderService.confirmDelivery(id, request)));
    }

    @PostMapping("/{id}/settle")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> settleAfterDeliveryWindow(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean disputeRaised,
            @RequestParam(required = false) String note) {
        return ResponseEntity.ok(ApiResponse.success("Chốt đơn hàng thành công", orderService.settleAfterDeliveryWindow(id, disputeRaised, note)));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody CancelOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công", orderService.cancelOrder(id, request)));
    }

    @PostMapping(value = "/{id}/delivery-proof/upload", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('RETAILER')")
    public ResponseEntity<ApiResponse<MediaFileResponse>> uploadDeliveryProofFile(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Upload bằng chứng giao hàng thành công", orderService.uploadDeliveryProofFile(id, file)));
    }
}
