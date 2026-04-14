package com.bicap.modules.batch.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.dto.*;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.entity.QrCode;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.batch.repository.QrCodeRepository;
import com.bicap.modules.batch.util.HashUtils;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.season.entity.FarmingProcess;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingProcessRepository;
import com.bicap.modules.season.service.SeasonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductBatchService {

    private final ProductBatchRepository productBatchRepository;
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

        if (!season.getProduct().getProductId().equals(product.getProductId())) {
            throw new BusinessException("Mùa vụ '" + season.getSeasonCode() + "' không thuộc sản phẩm '" + product.getProductName() + "'.");
        }
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
        BatchBlockchainPayload payload = BatchBlockchainPayload.builder()
                .batchId(saved.getBatchId())
                .batchCode(saved.getBatchCode())
                .seasonId(saved.getSeason().getSeasonId())
                .productId(saved.getProduct().getProductId())
                .harvestDate(saved.getHarvestDate())
                .quantity(saved.getQuantity())
                .qualityGrade(saved.getQualityGrade())
                .build();
        blockchainService.saveBatch(payload);

        return toResponse(saved);
    }

    public List<BatchResponse> getAllBatches() {
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        return productBatchRepository.findAll().stream()
                .filter(batch -> currentUserId == null || canAccessBatch(batch, currentUserId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BatchResponse getBatchById(Long id) {
        ProductBatch batch = productBatchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng với ID: " + id));
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId != null) {
            seasonService.findSeasonAndCheckPermission(batch.getSeason().getSeasonId(), currentUserId);
        }
        return toResponse(batch);
    }

    @Transactional
    public BatchResponse updateBatch(Long id, UpdateBatchRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProductBatch batch = productBatchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng với ID: " + id));
        seasonService.findSeasonAndCheckPermission(batch.getSeason().getSeasonId(), currentUserId);

        java.math.BigDecimal nextQuantity = request.getQuantity() != null ? request.getQuantity() : batch.getQuantity();
        java.math.BigDecimal nextAvailableQuantity = request.getAvailableQuantity() != null ? request.getAvailableQuantity() : batch.getAvailableQuantity();
        if (nextAvailableQuantity != null && nextQuantity != null && nextAvailableQuantity.compareTo(nextQuantity) > 0) {
            throw new BusinessException("Số lượng khả dụng không được lớn hơn tổng số lượng.");
        }

        batch.setHarvestDate(request.getHarvestDate() != null ? request.getHarvestDate() : batch.getHarvestDate());
        batch.setQuantity(nextQuantity);
        batch.setAvailableQuantity(nextAvailableQuantity);
        batch.setQualityGrade(request.getQualityGrade() != null ? request.getQualityGrade() : batch.getQualityGrade());
        batch.setExpiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : batch.getExpiryDate());
        batch.setBatchStatus(request.getBatchStatus() != null ? request.getBatchStatus() : batch.getBatchStatus());

        ProductBatch saved = productBatchRepository.save(batch);
        BatchBlockchainPayload payload = BatchBlockchainPayload.builder()
                .batchId(saved.getBatchId())
                .batchCode(saved.getBatchCode())
                .seasonId(saved.getSeason().getSeasonId())
                .productId(saved.getProduct().getProductId())
                .harvestDate(saved.getHarvestDate())
                .quantity(saved.getQuantity())
                .qualityGrade(saved.getQualityGrade())
                .build();
        blockchainService.saveBatch(payload);

        return toResponse(saved);
    }

    @Transactional
    public QrCodeResponse generateQrCode(Long batchId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProductBatch batch = productBatchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng với ID: " + batchId));
        seasonService.findSeasonAndCheckPermission(batch.getSeason().getSeasonId(), currentUserId);

        String qrUrl = "/trace/batches/" + batch.getBatchId();
        String qrValue = "batchId=" + batch.getBatchId() + "|batchCode=" + batch.getBatchCode() + "|seasonId=" + batch.getSeason().getSeasonId() + "|traceUrl=" + qrUrl;
        String base64Qr = qrCodeService.generateBase64Png(qrValue);

        QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batchId).orElse(new QrCode());
        qrCode.setBatch(batch);
        qrCode.setSerialNo("QR-BATCH-" + batch.getBatchId());
        qrCode.setQrValue(qrValue);
        qrCode.setQrUrl(qrUrl);
        qrCode.setGeneratedAt(LocalDateTime.now());
        qrCode.setStatus("ACTIVE");

        QrCode saved = qrCodeRepository.save(qrCode);
        return QrCodeResponse.builder()
                .qrCodeId(saved.getQrCodeId())
                .batchId(batchId)
                .serialNo(saved.getSerialNo())
                .qrValue(qrValue)
                .qrUrl(saved.getQrUrl())
                .qrImageBase64(base64Qr)
                .status(saved.getStatus())
                .generatedAt(saved.getGeneratedAt())
                .build();
    }

    public QrCodeResponse getQrCode(Long batchId) {
        ProductBatch batch = productBatchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng với ID: " + batchId));
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId != null) {
            seasonService.findSeasonAndCheckPermission(batch.getSeason().getSeasonId(), currentUserId);
        }

        QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batchId)
                .orElseThrow(() -> new BusinessException("Chưa tạo mã QR cho lô hàng này."));

        String base64Qr = qrCodeService.generateBase64Png(qrCode.getQrValue());
        return QrCodeResponse.builder()
                .qrCodeId(qrCode.getQrCodeId())
                .batchId(batchId)
                .serialNo(qrCode.getSerialNo())
                .qrValue(qrCode.getQrValue())
                .qrUrl(qrCode.getQrUrl())
                .qrImageBase64(base64Qr)
                .status(qrCode.getStatus())
                .generatedAt(qrCode.getGeneratedAt())
                .build();
    }

    public TraceBatchResponse traceBatch(Long id) {
        ProductBatch batch = productBatchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng để truy xuất: " + id));

        FarmingSeason season = batch.getSeason();
        List<FarmingProcess> processes = farmingProcessRepository.findBySeason_SeasonIdOrderByStepNoAsc(season.getSeasonId());

        QrCodeResponse qrResponse = null;
        try {
            qrResponse = getQrCode(id);
        } catch (Exception ignored) {
        }

        TraceSeasonInfoDto seasonDetails = TraceSeasonInfoDto.builder()
                .seasonId(season.getSeasonId())
                .seasonCode(season.getSeasonCode())
                .farmingMethod(season.getFarmingMethod())
                .startDate(season.getStartDate())
                .expectedHarvestDate(season.getExpectedHarvestDate())
                .status(season.getSeasonStatus())
                .farmName(season.getFarm() != null ? season.getFarm().getFarmName() : null)
                .farmCode(season.getFarm() != null ? season.getFarm().getFarmCode() : null)
                .build();

        List<TraceProcessStepDto> processList = processes.stream().map(process -> TraceProcessStepDto.builder()
                .stepNo(process.getStepNo())
                .stepName(process.getStepName())
                .performedAt(process.getPerformedAt())
                .description(process.getDescription())
                .imageUrl(process.getImageUrl())
                .recordedBy(process.getRecordedBy() != null ? process.getRecordedBy().getFullName() : "Unknown")
                .build()).collect(Collectors.toList());

        return TraceBatchResponse.builder()
                .batch(toResponse(batch))
                .qrInfo(qrResponse)
                .seasonInfo(seasonDetails)
                .processList(processList)
                .timeline(processes.stream().map(process -> ProcessTraceItemDto.builder()
                        .stepNo(process.getStepNo())
                        .action(process.getStepName())
                        .description(process.getDescription())
                        .timestamp(process.getPerformedAt())
                        .status("RECORDED")
                        .operatorName(process.getRecordedBy() != null ? process.getRecordedBy().getFullName() : "Unknown")
                        .build()).collect(Collectors.toList()))
                .note("Dữ liệu truy xuất nguồn gốc được xác thực bởi BICAP Platform.")
                .build();
    }

    public VerifyTraceResponse verifyBatch(Long batchId) {
        ProductBatch batch = productBatchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy batch"));

        BatchBlockchainPayload payload = BatchBlockchainPayload.builder()
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .seasonId(batch.getSeason().getSeasonId())
                .productId(batch.getProduct().getProductId())
                .harvestDate(batch.getHarvestDate())
                .quantity(batch.getQuantity())
                .qualityGrade(batch.getQualityGrade())
                .build();
        String jsonPayload = HashUtils.toCanonicalJson(payload.toMap());
        System.out.println("DEBUG - Batch JSON Payload: " + jsonPayload);
        String localHash = blockchainService.canonicalizeHash(jsonPayload);

        String onChainHash = null;
        boolean matched = false;
        try {
            onChainHash = blockchainService.getOnChainHash("BATCH", batchId, "UPSERT");
            matched = onChainHash != null && localHash.equals(onChainHash);
        } catch (Exception ignored) {
            onChainHash = null;
            matched = false;
        }

        return VerifyTraceResponse.builder()
                .batchId(batchId)
                .localHash(localHash)
                .onChainHash(onChainHash)
                .matched(matched)
                .build();
    }

    private boolean canAccessBatch(ProductBatch batch, Long currentUserId) {
        try {
            seasonService.findSeasonAndCheckPermission(batch.getSeason().getSeasonId(), currentUserId);
            return true;
        } catch (Exception ignored) {
            return false;
        }
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
