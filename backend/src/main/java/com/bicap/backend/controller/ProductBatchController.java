package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateProductBatchRequest;
import com.bicap.backend.dto.ProductBatchResponse;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.ProductBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/product-batches")
@RequiredArgsConstructor
public class ProductBatchController {

    private final ProductBatchService productBatchService;

    @PostMapping
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<ProductBatchResponse> createProductBatch(@Valid @RequestBody CreateProductBatchRequest request) {
        return ApiResponse.success(
                "Tạo lô sản phẩm thành công",
                productBatchService.createProductBatch(request, SecurityUtils.getCurrentUserId())
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('FARM','ADMIN','RETAILER','SHIPPING_MANAGER')")
    public ApiResponse<List<ProductBatchResponse>> getAllProductBatches(
            @RequestParam(required = false) Long farmId
    ) {
        if (farmId != null) {
            return ApiResponse.success(productBatchService.getProductBatchesByFarm(farmId));
        }
        return ApiResponse.success(productBatchService.getAllProductBatches());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN','RETAILER','SHIPPING_MANAGER')")
    public ApiResponse<ProductBatchResponse> getProductBatchById(@PathVariable Long id) {
        return ApiResponse.success(productBatchService.getProductBatchById(id));
    }

    @GetMapping("/{id}/qr")
    @PreAuthorize("hasAnyRole('FARM','ADMIN','RETAILER','SHIPPING_MANAGER')")
    public ApiResponse<Map<String, String>> getQrCodeData(@PathVariable Long id) {
        return ApiResponse.success(Map.of("qrCodeData", productBatchService.getQrCodeData(id)));
    }
}
