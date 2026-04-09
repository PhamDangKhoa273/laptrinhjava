package com.bicap.backend.service;

import com.bicap.backend.dto.BatchResponse;
import com.bicap.backend.dto.CreateBatchRequest;
import com.bicap.backend.dto.UpdateBatchRequest;
import com.bicap.backend.dto.trace.QrCodeResponse;
import com.bicap.backend.dto.trace.TraceBatchResponse;
import com.bicap.backend.entity.*;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.*;
import com.bicap.backend.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductBatchService {

    private final ProductBatchRepository productBatchRepository;
    private final FarmingSeasonRepository farmingSeasonRepository;
    private final ProductRepository productRepository;
    private final FarmingProcessRepository farmingProcessRepository;
    private final QrCodeRepository qrCodeRepository;
    private final BlockchainService blockchainService;
    private final QrCodeService qrCodeService;
    private final SeasonService seasonService;

    @Transactional
    public BatchResponse createBatch(CreateBatchRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        FarmingSeason season = seasonService.findSeasonAndCheckPermission(request.getSeasonId(), currentUserId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        // Validate consistency: Season must be for this Product
        if (!season.getProduct().getProductId().equals(product.getProductId())) {
            throw new BusinessException("Mùa vụ '" + season.getSeasonCode() + "' không thuộc sản phẩm '" + product.getProductName() + "'.");
        }

        // Validate availableQuantity <= quantity
        if (request.getAvailableQuantity().compareTo(request.getQuantity()) > 0) {
            throw new BusinessException("Số lượng khả dụng không được lớn hơn tổng số lượng.");
        }

        if (productBatchRepository.existsByBatchCode(request.getBatchCode())) {
            throw new BusinessException("Mã lô hàng '" + request.getBatchCode() + "' đã tồn tại.");
        }

        ProductBatch batch = new ProductBatch();
        batch.setSeason(season);
        batch.setProduct(product);
        batch.setBatchCode(request.getBatchCode());
        batch.setHarvestDate(request.getHarvestDate());
        batch.setQuantity(request.getQuantity());
        batch.setAvailableQuantity(request.getAvailableQuantity());
        batch.setQualityGrade(request.getQualityGrade());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setBatchStatus(request.getBatchStatus() != null ? request.getBatchStatus() : "CREATED");

        ProductBatch saved = productBatchRepository.save(batch);

        // Blockchain integration
        blockchainService.saveBatch(saved);

        return toResponse(saved);
    }

    public List<BatchResponse> getAllBatches() {
        return productBatchRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BatchResponse getBatchById(Long id) {
        ProductBatch batch = productBatchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng với ID: " + id));
        return toResponse(batch);
    }

    @Transactional
    public BatchResponse updateBatch(Long id, UpdateBatchRequest request) {
        ProductBatch batch = productBatchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng với ID: " + id));

        // Validate availableQuantity <= quantity
        if (request.getAvailableQuantity().compareTo(request.getQuantity()) > 0) {
            throw new BusinessException("Số lượng khả dụng không được lớn hơn tổng số lượng.");
        }

        batch.setHarvestDate(request.getHarvestDate());
        batch.setQuantity(request.getQuantity());
        batch.setAvailableQuantity(request.getAvailableQuantity());
        batch.setQualityGrade(request.getQualityGrade());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setBatchStatus(request.getBatchStatus());

        ProductBatch saved = productBatchRepository.save(batch);
        
        // Blockchain integration
        blockchainService.saveBatch(saved);

        return toResponse(saved);
    }

    @Transactional
    public QrCodeResponse generateQrCode(Long batchId) {
        ProductBatch batch = productBatchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng với ID: " + batchId));

        String qrValue = "BICAP-BATCH-" + batch.getBatchCode() + "-" + batch.getBatchId();
        String base64Qr = qrCodeService.generateBase64Png(qrValue);

        QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batchId).orElse(new QrCode());
        qrCode.setBatch(batch);
        qrCode.setQrValue(qrValue);
        qrCode.setGeneratedAt(LocalDateTime.now());
        qrCode.setStatus("ACTIVE");

        QrCode saved = qrCodeRepository.save(qrCode);

        return QrCodeResponse.builder()
                .qrCodeId(saved.getQrCodeId())
                .batchId(batchId)
                .qrValue(qrValue)
                .qrImageBase64(base64Qr)
                .status(saved.getStatus())
                .generatedAt(saved.getGeneratedAt())
                .build();
    }

    public QrCodeResponse getQrCode(Long batchId) {
        QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batchId)
                .orElseThrow(() -> new BusinessException("Chưa tạo mã QR cho lô hàng này."));
        
        String base64Qr = qrCodeService.generateBase64Png(qrCode.getQrValue());

        return QrCodeResponse.builder()
                .qrCodeId(qrCode.getQrCodeId())
                .batchId(batchId)
                .qrValue(qrCode.getQrValue())
                .qrImageBase64(base64Qr)
                .status(qrCode.getStatus())
                .generatedAt(qrCode.getGeneratedAt())
                .build();
    }

    /**
     * Core Traceability Logic
     */
    public TraceBatchResponse traceBatch(Long id) {
        ProductBatch batch = productBatchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng để truy xuất: " + id));

        FarmingSeason season = batch.getSeason();
        List<FarmingProcess> processes = farmingProcessRepository.findBySeason_SeasonIdOrderByStepNoAsc(season.getSeasonId());

        QrCodeResponse qrResponse = null;
        try {
            qrResponse = getQrCode(id);
        } catch (Exception ignored) {}

        // Construct Season Info Map
        Map<String, Object> seasonDetails = new HashMap<>();
        seasonDetails.put("seasonId", season.getSeasonId());
        seasonDetails.put("seasonCode", season.getSeasonCode());
        seasonDetails.put("farmingMethod", season.getFarmingMethod());
        seasonDetails.put("startDate", season.getStartDate());
        seasonDetails.put("expectedHarvestDate", season.getExpectedHarvestDate());
        seasonDetails.put("status", season.getSeasonStatus());
        if (season.getFarm() != null) {
            seasonDetails.put("farmName", season.getFarm().getFarmName());
            seasonDetails.put("farmCode", season.getFarm().getFarmCode());
        }

        // Construct Process List
        List<Map<String, Object>> processList = processes.stream().map(p -> {
            Map<String, Object> map = new HashMap<>();
            map.put("stepNo", p.getStepNo());
            map.put("stepName", p.getStepName());
            map.put("performedAt", p.getPerformedAt());
            map.put("description", p.getDescription());
            map.put("imageUrl", p.getImageUrl());
            map.put("recordedBy", p.getRecordedBy() != null ? p.getRecordedBy().getFullName() : "Unknown");
            return map;
        }).collect(Collectors.toList());

        return TraceBatchResponse.builder()
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .seasonId(season.getSeasonId())
                .productId(batch.getProduct() != null ? batch.getProduct().getProductId() : null)
                .harvestDate(batch.getHarvestDate())
                .quantity(batch.getQuantity())
                .availableQuantity(batch.getAvailableQuantity())
                .qualityGrade(batch.getQualityGrade())
                .expiryDate(batch.getExpiryDate())
                .batchStatus(batch.getBatchStatus())
                .qrInfo(qrResponse)
                .seasonInfo(seasonDetails)
                .processList(processList)
                .note("Dữ liệu truy xuất nguồn gốc được xác thực bởi BICAP Platform.")
                .build();
    }

    private BatchResponse toResponse(ProductBatch batch) {
        return BatchResponse.builder()
                .batchId(batch.getBatchId())
                .seasonId(batch.getSeason() != null ? batch.getSeason().getSeasonId() : null)
                .productId(batch.getProduct() != null ? batch.getProduct().getProductId() : null)
                .batchCode(batch.getBatchCode())
                .harvestDate(batch.getHarvestDate())
                .quantity(batch.getQuantity())
                .availableQuantity(batch.getAvailableQuantity())
                .qualityGrade(batch.getQualityGrade())
                .expiryDate(batch.getExpiryDate())
                .batchStatus(batch.getBatchStatus())
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();
    }
}
