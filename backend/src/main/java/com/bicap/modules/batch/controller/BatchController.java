package com.bicap.modules.batch.controller;

import com.bicap.core.dto.ApiResponse;

import com.bicap.modules.batch.dto.BatchResponse;
import com.bicap.modules.batch.dto.CreateBatchRequest;
import com.bicap.modules.batch.dto.QrCodeResponse;
import com.bicap.modules.batch.dto.TraceBatchResponse;
import com.bicap.modules.batch.dto.UpdateBatchRequest;
import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.batch.service.ProductBatchService;
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
        return ApiResponse.success("Tạo lô hàng thành công", productBatchService.createBatch(request));
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
        return ApiResponse.success("Cập nhật lô hàng thành công", productBatchService.updateBatch(id, request));
    }

    @PostMapping("/api/batches/{id}/qr")
    public ApiResponse<QrCodeResponse> generateQr(@PathVariable Long id) {
        return ApiResponse.success("Tạo mã QR thành công", productBatchService.generateQrCode(id));
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
