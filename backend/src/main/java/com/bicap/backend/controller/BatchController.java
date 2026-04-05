package com.bicap.backend.controller;

import com.bicap.backend.dto.BatchResponse;
import com.bicap.backend.dto.CreateBatchRequest;
import com.bicap.backend.dto.trace.QrCodeResponse;
import com.bicap.backend.dto.trace.TraceBatchResponse;
import com.bicap.backend.dto.UpdateBatchRequest;
import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.service.ProductBatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BatchController {

    private final ProductBatchService productBatchService;

    @PostMapping("/api/batches")
    public ApiResponse<BatchResponse> createBatch(@Valid @RequestBody CreateBatchRequest request) {
        return ApiResponse.success("Tạo batch thành công", productBatchService.createBatch(request));
    }

    @GetMapping("/api/batches")
    public ApiResponse<List<BatchResponse>> getAllBatches() {
        return ApiResponse.success(productBatchService.getAllBatches());
    }

    @GetMapping("/api/batches/{id}")
    public ApiResponse<BatchResponse> getBatchById(@PathVariable Long id) {
        return ApiResponse.success(productBatchService.getBatchById(id));
    }

    @PutMapping("/api/batches/{id}")
    public ApiResponse<BatchResponse> updateBatch(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateBatchRequest request) {
        return ApiResponse.success("Cập nhật batch thành công", productBatchService.updateBatch(id, request));
    }

    @PostMapping("/api/batches/{id}/qr")
    public ApiResponse<QrCodeResponse> generateQr(@PathVariable Long id) {
        return ApiResponse.success("Tạo QR thành công", productBatchService.generateQrCode(id));
    }

    @GetMapping("/api/batches/{id}/qr")
    public ApiResponse<QrCodeResponse> getQr(@PathVariable Long id) {
        return ApiResponse.success(productBatchService.getQrCode(id));
    }

    @GetMapping("/api/trace/batches/{id}")
    public ApiResponse<TraceBatchResponse> traceBatch(@PathVariable Long id) {
        return ApiResponse.success(productBatchService.traceBatch(id));
    }
}

