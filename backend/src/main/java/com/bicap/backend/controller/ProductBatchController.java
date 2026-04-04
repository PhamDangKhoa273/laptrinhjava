package com.bicap.backend.controller;

import com.bicap.backend.dto.CreateProductBatchRequest;
import com.bicap.backend.dto.ProductBatchResponse;
import com.bicap.backend.dto.UpdateProductBatchRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.security.SecurityUtils;
import com.bicap.backend.service.ProductBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
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

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ApiResponse<ProductBatchResponse> updateProductBatch(@PathVariable Long id,
                                                                @Valid @RequestBody UpdateProductBatchRequest request) {
        return ApiResponse.success(
                "Cập nhật lô sản phẩm thành công",
                productBatchService.updateProductBatch(id, request, SecurityUtils.getCurrentUserId())
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
    public ApiResponse<Map<String, String>> getQrCode(@PathVariable Long id) {
        return ApiResponse.success(productBatchService.getQrCode(id));
    }

    @GetMapping("/{id}/qr-image")
    @PreAuthorize("hasAnyRole('FARM','ADMIN','RETAILER','SHIPPING_MANAGER')")
    public ResponseEntity<byte[]> getQrImage(@PathVariable Long id) {
        Map<String, String> qrResult = productBatchService.getQrCode(id);
        byte[] imageBytes = Base64.getDecoder().decode(qrResult.get("qrCodeBase64"));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=batch-" + id + "-qr.png")
                .contentType(MediaType.IMAGE_PNG)
                .body(imageBytes);
    }

    @GetMapping("/trace/{id}")
    public ApiResponse<Map<String, Object>> traceProductBatch(@PathVariable Long id) {
        return ApiResponse.success(productBatchService.getTraceInfo(id));
    }
}
