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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductBatchService {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

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

        ensureSeasonEligibleForExport(season);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        if (!season.getProduct().getProductId().equals(product.getProductId())) {
            throw new BusinessException("Mùa vụ '" + season.getSeasonCode() + "' không thuộc sản phẩm '" + product.getProductName() + "'.");
        }

        String normalizedBatchCode = normalizeBatchCode(request.getBatchCode());
        String normalizedQualityGrade = normalizeQualityGrade(request.getQualityGrade());
        String normalizedStatus = normalizeBatchStatus(request.getBatchStatus());
        validateBatchDates(season, request.getHarvestDate(), request.getExpiryDate());
        validateBatchQuantities(request.getQuantity(), request.getAvailableQuantity());

        if (productBatchRepository.existsByBatchCode(normalizedBatchCode)) {
            throw new BusinessException("Mã lô hàng '" + normalizedBatchCode + "' đã tồn tại.");
        }

        ProductBatch batch = new ProductBatch();
        batch.setSeason(season);
        batch.setProduct(product);
        batch.setBatchCode(normalizedBatchCode);
        batch.setHarvestDate(request.getHarvestDate());
        batch.setQuantity(request.getQuantity());
        batch.setAvailableQuantity(request.getAvailableQuantity());
        batch.setQualityGrade(normalizedQualityGrade);
        batch.setExpiryDate(request.getExpiryDate());
        batch.setBatchStatus(normalizedStatus);

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
        ensureSeasonEligibleForExport(batch.getSeason());

        BigDecimal nextQuantity = request.getQuantity() != null ? request.getQuantity() : batch.getQuantity();
        BigDecimal nextAvailableQuantity = request.getAvailableQuantity() != null ? request.getAvailableQuantity() : batch.getAvailableQuantity();
        LocalDate nextHarvestDate = request.getHarvestDate() != null ? request.getHarvestDate() : batch.getHarvestDate();
        LocalDate nextExpiryDate = request.getExpiryDate() != null ? request.getExpiryDate() : batch.getExpiryDate();
        String nextQualityGrade = request.getQualityGrade() != null ? normalizeQualityGrade(request.getQualityGrade()) : batch.getQualityGrade();
        String nextStatus = request.getBatchStatus() != null ? normalizeBatchStatus(request.getBatchStatus()) : batch.getBatchStatus();

        validateBatchQuantities(nextQuantity, nextAvailableQuantity);
        validateBatchDates(batch.getSeason(), nextHarvestDate, nextExpiryDate);

        batch.setHarvestDate(nextHarvestDate);
        batch.setQuantity(nextQuantity);
        batch.setAvailableQuantity(nextAvailableQuantity);
        batch.setQualityGrade(nextQualityGrade);
        batch.setExpiryDate(nextExpiryDate);
        batch.setBatchStatus(nextStatus);

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
        ensureBatchEligibleForQr(batch);

        String traceCode = resolveTraceCode(batchId);
        String qrUrl = buildPublicTraceUrl(traceCode);
        String qrValue = qrUrl;
        String base64Qr = qrCodeService.generateBase64Png(qrValue);

        QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batchId).orElse(new QrCode());
        qrCode.setBatch(batch);
        qrCode.setSerialNo(buildQrSerial(batch));
        qrCode.setQrValue(traceCode);
        qrCode.setQrUrl(qrUrl);
        qrCode.setGeneratedAt(LocalDateTime.now());
        qrCode.setStatus(com.bicap.core.enums.QrCodeStatus.ACTIVE);

        QrCode saved = qrCodeRepository.save(qrCode);
        return QrCodeResponse.builder()
                .qrCodeId(saved.getQrCodeId())
                .batchId(batchId)
                .serialNo(saved.getSerialNo())
                .traceCode(traceCode)
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

        String traceCode = qrCode.getQrValue();
        String base64Qr = qrCodeService.generateBase64Png(qrCode.getQrUrl());
        return QrCodeResponse.builder()
                .qrCodeId(qrCode.getQrCodeId())
                .batchId(batchId)
                .serialNo(qrCode.getSerialNo())
                .traceCode(traceCode)
                .qrValue(qrCode.getQrUrl())
                .qrUrl(qrCode.getQrUrl())
                .qrImageBase64(base64Qr)
                .status(qrCode.getStatus())
                .generatedAt(qrCode.getGeneratedAt())
                .build();
    }

    public TraceBatchResponse traceBatch(Long id) {
        ProductBatch batch = productBatchRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy lô hàng để truy xuất: " + id));
        return buildTraceBatchResponse(batch);
    }

    public TraceBatchResponse traceBatchByTraceCode(String traceCode) {
        String normalizedTraceCode = normalizeText(traceCode, "Trace code không hợp lệ.").toUpperCase(Locale.ROOT);
        QrCode qrCode = qrCodeRepository.findByQrValue(normalizedTraceCode)
                .orElseThrow(() -> new BusinessException("Không tìm thấy QR cho trace code này."));
        ProductBatch batch = qrCode.getBatch();
        if (batch == null) {
            throw new BusinessException("QR này chưa được ánh xạ tới batch hợp lệ.");
        }
        return buildTraceBatchResponse(batch);
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
        String localHash = blockchainService.canonicalizeHash(jsonPayload);

        String onChainHash;
        boolean matched;
        try {
            onChainHash = blockchainService.getOnChainHash("BATCH", batchId, "UPSERT");
            matched = onChainHash != null && localHash.equals(onChainHash);
        } catch (Exception ignored) {
            onChainHash = null;
            matched = false;
        }

        return new VerifyTraceResponse(batchId, localHash, onChainHash, matched);
    }

    private TraceBatchResponse buildTraceBatchResponse(ProductBatch batch) {
        FarmingSeason season = batch.getSeason();
        List<FarmingProcess> processes = farmingProcessRepository.findBySeason_SeasonIdOrderByStepNoAsc(season.getSeasonId());

        QrCodeResponse qrResponse = null;
        try {
            qrResponse = getQrCode(batch.getBatchId());
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

    private void ensureSeasonEligibleForExport(FarmingSeason season) {
        String seasonStatus = season.getSeasonStatus() == null ? "" : season.getSeasonStatus().trim().toUpperCase(Locale.ROOT);
        if (!("HARVESTED".equals(seasonStatus) || "COMPLETED".equals(seasonStatus))) {
            throw new BusinessException("Chỉ mùa vụ HARVESTED hoặc COMPLETED mới được export thành batch.");
        }
        if (farmingProcessRepository.findBySeason_SeasonIdOrderByStepNoAsc(season.getSeasonId()).isEmpty()) {
            throw new BusinessException("Mùa vụ phải có nhật ký quy trình trước khi export batch.");
        }
    }

    private void ensureBatchEligibleForQr(ProductBatch batch) {
        if (batch.getBatchId() == null) {
            throw new BusinessException("Batch chưa hợp lệ để tạo QR.");
        }
        if (batch.getAvailableQuantity() == null || batch.getAvailableQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Batch phải còn số lượng khả dụng để tạo QR truy xuất.");
        }
    }

    private void validateBatchDates(FarmingSeason season, LocalDate harvestDate, LocalDate expiryDate) {
        if (harvestDate == null) {
            throw new BusinessException("Ngày thu hoạch là bắt buộc.");
        }
        if (season.getStartDate() != null && harvestDate.isBefore(season.getStartDate())) {
            throw new BusinessException("Ngày thu hoạch batch không được trước ngày bắt đầu mùa vụ.");
        }
        if (season.getActualHarvestDate() != null && harvestDate.isBefore(season.getActualHarvestDate())) {
            throw new BusinessException("Ngày thu hoạch batch không được trước ngày thu hoạch thực tế của mùa vụ.");
        }
        if (expiryDate == null || !expiryDate.isAfter(harvestDate)) {
            throw new BusinessException("Hạn sử dụng phải sau ngày thu hoạch.");
        }
    }


        return new VerifyTraceResponse(batchId, localHash, onChainHash, matched);

    private void validateBatchQuantities(BigDecimal quantity, BigDecimal availableQuantity) {
        if (quantity == null || availableQuantity == null) {
            throw new BusinessException("Số lượng batch không được để trống.");
        }
        if (availableQuantity.compareTo(quantity) > 0) {
            throw new BusinessException("Số lượng khả dụng không được lớn hơn tổng số lượng.");
        }
    }

    private String buildPublicTraceUrl(String traceCode) {
        String base = frontendUrl == null ? "http://localhost:5173" : frontendUrl.trim();
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "/public/trace?traceCode=" + traceCode;
    }

    private String resolveTraceCode(Long batchId) {
        return qrCodeRepository.findByBatch_BatchId(batchId)
                .map(QrCode::getQrValue)
                .filter(value -> value != null && !value.isBlank())
                .orElseGet(() -> "TRACE-" + batchId + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
    }

    private String buildQrSerial(ProductBatch batch) {
        return "QR-BATCH-" + batch.getBatchId();

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
        QrCode qrCode = qrCodeRepository.findByBatch_BatchId(batch.getBatchId()).orElse(null);
        String traceCode = qrCode != null ? qrCode.getQrValue() : null;
        String publicTraceUrl = qrCode != null ? qrCode.getQrUrl() : null;

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
                .traceCode(traceCode)
                .publicTraceUrl(publicTraceUrl)
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();
    }

    private String normalizeBatchCode(String batchCode) {
        return normalizeText(batchCode, "Mã batch không được để trống.")
                .toUpperCase(Locale.ROOT)
                .replaceAll("\\s+", "-");
    }

    private String normalizeQualityGrade(String qualityGrade) {
        return normalizeText(qualityGrade, "Chất lượng batch không được để trống.").toUpperCase(Locale.ROOT);
    }

    private String normalizeBatchStatus(String batchStatus) {
        if (batchStatus == null || batchStatus.isBlank()) {
            return "CREATED";
        }
        return batchStatus.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeText(String value, String message) {
        if (value == null) {
            throw new BusinessException(message);
        }
        String normalized = value.trim().replaceAll("\\s+", " ");
        if (normalized.isBlank()) {
            throw new BusinessException(message);
        }
        return normalized;
    }
}
