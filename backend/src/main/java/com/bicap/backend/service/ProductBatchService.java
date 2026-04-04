package com.bicap.backend.service;

import com.bicap.backend.dto.CreateProductBatchRequest;
import com.bicap.backend.dto.ProductBatchResponse;
import com.bicap.backend.dto.UpdateProductBatchRequest;
import com.bicap.backend.entity.Farm;
import com.bicap.backend.entity.ProductBatch;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.ProductBatchRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductBatchService {

    private final ProductBatchRepository productBatchRepository;
    private final FarmService farmService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    private final BlockchainService blockchainService;
    private final QrCodeService qrCodeService;

    @Transactional
    public ProductBatchResponse createProductBatch(CreateProductBatchRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isFarm = userService.hasRole(currentUser, RoleName.FARM);

        if (!isAdmin && !isFarm) {
            throw new BusinessException("Bạn không có quyền tạo lô sản phẩm");
        }

        if (productBatchRepository.existsByBatchCode(request.getBatchCode().trim())) {
            throw new BusinessException("batchCode đã tồn tại");
        }

        Farm farm = farmService.getFarmEntityById(request.getFarmId());
        validateOwnership(currentUserId, isAdmin, farm);

        ProductBatch productBatch = new ProductBatch();
        productBatch.setFarm(farm);
        productBatch.setSeasonId(request.getSeasonId());
        productBatch.setBatchCode(request.getBatchCode().trim());
        productBatch.setProductName(request.getProductName().trim());
        productBatch.setQuantity(request.getQuantity());
        productBatch.setUnit(request.getUnit().trim());
        productBatch.setExportDate(request.getExportDate());
        productBatch.setStatus("CREATED");

        String traceUrl = normalizeTraceUrl(request.getTraceUrl(), request.getBatchCode().trim());
        productBatch.setTraceUrl(traceUrl);
        productBatch.setQrCodeData(buildQrPayload(productBatch.getBatchCode(), productBatch.getSeasonId(), traceUrl));

        ProductBatch saved = productBatchRepository.save(productBatch);
        saved.setBlockchainTxHash(blockchainService.saveProductBatch(saved));
        saved = productBatchRepository.save(saved);

        auditLogService.log(currentUserId, "CREATE_PRODUCT_BATCH", "PRODUCT_BATCH", saved.getBatchId());

        return toResponse(saved);
    }

    @Transactional
    public ProductBatchResponse updateProductBatch(Long batchId, UpdateProductBatchRequest request, Long currentUserId) {
        ProductBatch productBatch = getProductBatchEntityById(batchId);

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy user hiện tại"));
        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        validateOwnership(currentUserId, isAdmin, productBatch.getFarm());

        productBatch.setSeasonId(request.getSeasonId());
        productBatch.setProductName(request.getProductName().trim());
        productBatch.setQuantity(request.getQuantity());
        productBatch.setUnit(request.getUnit().trim());
        productBatch.setExportDate(request.getExportDate());
        productBatch.setStatus(request.getStatus().trim().toUpperCase());

        String traceUrl = normalizeTraceUrl(request.getTraceUrl(), productBatch.getBatchCode());
        productBatch.setTraceUrl(traceUrl);
        productBatch.setQrCodeData(buildQrPayload(productBatch.getBatchCode(), productBatch.getSeasonId(), traceUrl));
        productBatch.setBlockchainTxHash(blockchainService.saveProductBatch(productBatch));

        ProductBatch saved = productBatchRepository.save(productBatch);
        auditLogService.log(currentUserId, "UPDATE_PRODUCT_BATCH", "PRODUCT_BATCH", saved.getBatchId());

        return toResponse(saved);
    }

    public List<ProductBatchResponse> getAllProductBatches() {
        return productBatchRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductBatchResponse getProductBatchById(Long batchId) {
        return toResponse(getProductBatchEntityById(batchId));
    }

    public List<ProductBatchResponse> getProductBatchesByFarm(Long farmId) {
        return productBatchRepository.findByFarmFarmId(farmId).stream()
                .map(this::toResponse)
                .toList();
    }

    public Map<String, String> getQrCode(Long batchId) {
        ProductBatch productBatch = getProductBatchEntityById(batchId);
        String payload = productBatch.getQrCodeData();
        String base64 = qrCodeService.generateBase64Png(payload);

        Map<String, String> result = new LinkedHashMap<>();
        result.put("batchCode", productBatch.getBatchCode());
        result.put("qrCodeData", payload);
        result.put("qrCodeBase64", base64);
        result.put("contentType", "image/png");
        return result;
    }

    public Map<String, Object> getTraceInfo(Long batchId) {
        ProductBatch productBatch = getProductBatchEntityById(batchId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("batchId", productBatch.getBatchId());
        result.put("batchCode", productBatch.getBatchCode());
        result.put("seasonId", productBatch.getSeasonId());
        result.put("productName", productBatch.getProductName());
        result.put("quantity", productBatch.getQuantity());
        result.put("unit", productBatch.getUnit());
        result.put("exportDate", productBatch.getExportDate());
        result.put("status", productBatch.getStatus());
        result.put("farmId", productBatch.getFarm() != null ? productBatch.getFarm().getFarmId() : null);
        result.put("farmName", productBatch.getFarm() != null ? productBatch.getFarm().getFarmName() : null);
        result.put("traceUrl", productBatch.getTraceUrl());
        result.put("blockchainTxHash", productBatch.getBlockchainTxHash());
        result.put("createdAt", productBatch.getCreatedAt());
        result.put("updatedAt", productBatch.getUpdatedAt());
        return result;
    }

    public ProductBatch getProductBatchEntityById(Long batchId) {
        return productBatchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô sản phẩm"));
    }

    private void validateOwnership(Long currentUserId, boolean isAdmin, Farm farm) {
        boolean isOwner = farm.getOwnerUser() != null
                && farm.getOwnerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Bạn chỉ được thao tác batch cho farm của mình");
        }
    }

    private String normalizeTraceUrl(String rawTraceUrl, String batchCode) {
        if (rawTraceUrl == null || rawTraceUrl.isBlank()) {
            return "/api/product-batches/trace/" + batchCode;
        }
        return rawTraceUrl.trim();
    }

    private String buildQrPayload(String batchCode, Long seasonId, String traceUrl) {
        return String.format(
                "{\"batch_code\":\"%s\",\"season_id\":%s,\"trace_url\":\"%s\"}",
                batchCode,
                seasonId == null ? "null" : seasonId.toString(),
                traceUrl
        );
    }

    private ProductBatchResponse toResponse(ProductBatch productBatch) {
        return ProductBatchResponse.builder()
                .batchId(productBatch.getBatchId())
                .farmId(productBatch.getFarm() != null ? productBatch.getFarm().getFarmId() : null)
                .farmName(productBatch.getFarm() != null ? productBatch.getFarm().getFarmName() : null)
                .seasonId(productBatch.getSeasonId())
                .batchCode(productBatch.getBatchCode())
                .productName(productBatch.getProductName())
                .quantity(productBatch.getQuantity())
                .unit(productBatch.getUnit())
                .exportDate(productBatch.getExportDate())
                .status(productBatch.getStatus())
                .traceUrl(productBatch.getTraceUrl())
                .qrCodeData(productBatch.getQrCodeData())
                .blockchainTxHash(productBatch.getBlockchainTxHash())
                .createdAt(productBatch.getCreatedAt())
                .updatedAt(productBatch.getUpdatedAt())
                .build();
    }
}
