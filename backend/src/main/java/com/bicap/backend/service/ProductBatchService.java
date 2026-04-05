package com.bicap.backend.service;

import com.bicap.backend.dto.*;
import com.bicap.backend.entity.BlockchainTransaction;
import com.bicap.backend.entity.ProductBatch;
import com.bicap.backend.entity.QrCode;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.BlockchainTransactionRepository;
import com.bicap.backend.repository.ProductBatchRepository;
import com.bicap.backend.repository.QrCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductBatchService {

    private final ProductBatchRepository productBatchRepository;
    private final QrCodeRepository qrCodeRepository;
    private final BlockchainTransactionRepository blockchainTransactionRepository;
    private final BlockchainService blockchainService;
    private final QrCodeService qrCodeService;
    private final SeasonReferenceService seasonReferenceService;
    private final ProcessTraceService processTraceService;

    @Transactional
    public BatchResponse createBatch(CreateBatchRequest request) {
        validateBatchRequest(request.getSeasonId(), request.getProductId(), request.getQuantity(), request.getAvailableQuantity());

        String normalizedBatchCode = request.getBatchCode().trim();
        if (productBatchRepository.existsByBatchCode(normalizedBatchCode)) {
            throw new BusinessException("batchCode đã tồn tại");
        }

        ProductBatch batch = new ProductBatch();
        batch.setSeasonId(request.getSeasonId());
        batch.setProductId(request.getProductId());
        batch.setBatchCode(normalizedBatchCode);
        batch.setHarvestDate(request.getHarvestDate());
        batch.setQuantity(request.getQuantity());
        batch.setAvailableQuantity(request.getAvailableQuantity());
        batch.setQualityGrade(trimOrNull(request.getQualityGrade()));
        batch.setExpiryDate(request.getExpiryDate());
        batch.setBatchStatus(normalizeStatus(request.getBatchStatus()));

        ProductBatch saved = productBatchRepository.save(batch);
        BlockchainTransaction blockchainTransaction = saveBlockchainTransaction(saved, "CREATE");

        return toBatchResponse(saved, blockchainTransaction.getTxHash());
    }

    @Transactional
    public BatchResponse updateBatch(Long batchId, UpdateBatchRequest request) {
        validateBatchRequest(request.getSeasonId(), request.getProductId(), request.getQuantity(), request.getAvailableQuantity());

        ProductBatch batch = getBatchEntityById(batchId);
        batch.setSeasonId(request.getSeasonId());
        batch.setProductId(request.getProductId());
        batch.setHarvestDate(request.getHarvestDate());
        batch.setQuantity(request.getQuantity());
        batch.setAvailableQuantity(request.getAvailableQuantity());
        batch.setQualityGrade(trimOrNull(request.getQualityGrade()));
        batch.setExpiryDate(request.getExpiryDate());
        batch.setBatchStatus(normalizeStatus(request.getBatchStatus()));

        ProductBatch saved = productBatchRepository.save(batch);
        BlockchainTransaction blockchainTransaction = saveBlockchainTransaction(saved, "UPDATE");

        return toBatchResponse(saved, blockchainTransaction.getTxHash());
    }

    public List<BatchResponse> getAllBatches() {
        return productBatchRepository.findAll().stream()
                .map(batch -> toBatchResponse(batch, getLatestTxHash(batch.getBatchId())))
                .toList();
    }

    public BatchResponse getBatchById(Long batchId) {
        ProductBatch batch = getBatchEntityById(batchId);
        return toBatchResponse(batch, getLatestTxHash(batch.getBatchId()));
    }

    @Transactional
    public QrCodeResponse generateQrCode(Long batchId) {
        ProductBatch batch = getBatchEntityById(batchId);

        qrCodeRepository.findByBatchBatchIdAndStatus(batchId, "ACTIVE")
                .ifPresent(existing -> {
                    throw new BusinessException("Batch này đã có QR active");
                });

        String qrUrl = "/api/trace/batches/" + batch.getBatchId();
        String qrValue = String.format(
                "{\"batch_id\":%d,\"batch_code\":\"%s\",\"season_id\":%d,\"trace_url\":\"%s\"}",
                batch.getBatchId(),
                batch.getBatchCode(),
                batch.getSeasonId(),
                qrUrl
        );

        QrCode qrCode = new QrCode();
        qrCode.setBatch(batch);
        qrCode.setQrValue(qrValue);
        qrCode.setQrUrl(qrUrl);
        qrCode.setStatus("ACTIVE");

        QrCode saved = qrCodeRepository.save(qrCode);
        return toQrCodeResponse(saved);
    }

    public QrCodeResponse getQrCode(Long batchId) {
        QrCode qrCode = qrCodeRepository.findByBatchBatchIdAndStatus(batchId, "ACTIVE")
                .orElseThrow(() -> new BusinessException("Batch này chưa có QR active"));
        return toQrCodeResponse(qrCode);
    }

    public TraceBatchResponse traceBatch(Long batchId) {
        ProductBatch batch = getBatchEntityById(batchId);
        QrCode qrCode = qrCodeRepository.findByBatchBatchIdAndStatus(batchId, "ACTIVE").orElse(null);
        BlockchainTransaction tx = blockchainTransactionRepository
                .findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("BATCH", batchId)
                .orElse(null);

        Optional<SeasonReferenceDto> seasonReference = seasonReferenceService.findSeasonReference(batch.getSeasonId(), batch.getProductId());
        List<Map<String, Object>> processList = processTraceService.findProcessesBySeasonId(batch.getSeasonId()).stream()
                .map(process -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("processCode", process.getProcessCode());
                    item.put("processName", process.getProcessName());
                    item.put("stage", process.getStage());
                    item.put("status", process.getStatus());
                    item.put("processDate", process.getProcessDate());
                    item.put("operatorName", process.getOperatorName());
                    item.put("notes", process.getNotes());
                    item.put("recordedAt", process.getRecordedAt());
                    return item;
                })
                .toList();

        return TraceBatchResponse.builder()
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .seasonId(batch.getSeasonId())
                .productId(batch.getProductId())
                .harvestDate(batch.getHarvestDate())
                .quantity(batch.getQuantity())
                .availableQuantity(batch.getAvailableQuantity())
                .qualityGrade(batch.getQualityGrade())
                .expiryDate(batch.getExpiryDate())
                .batchStatus(batch.getBatchStatus())
                .qrInfo(qrCode != null ? toQrCodeResponse(qrCode) : null)
                .txHash(tx != null ? tx.getTxHash() : null)
                .txStatus(tx != null ? tx.getTxStatus() : null)
                .lastBlockchainSyncAt(tx != null ? tx.getCreatedAt() : null)
                .seasonInfo(buildSeasonInfo(batch, seasonReference))
                .processList(processList)
                .note(buildTraceNote(seasonReference.isPresent(), !processList.isEmpty(), tx != null))
                .build();
    }

    public ProductBatch getBatchEntityById(Long batchId) {
        return productBatchRepository.findById(batchId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy batch"));
    }

    private void validateBatchRequest(Long seasonId, Long productId, BigDecimal quantity, BigDecimal availableQuantity) {
        if (seasonId == null || seasonId <= 0) {
            throw new BusinessException("season phải tồn tại");
        }
        if (productId == null || productId <= 0) {
            throw new BusinessException("product phải tồn tại");
        }
        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("quantity phải lớn hơn 0");
        }
        if (availableQuantity == null || availableQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("availableQuantity không được âm");
        }
        if (availableQuantity.compareTo(quantity) > 0) {
            throw new BusinessException("availableQuantity phải nhỏ hơn hoặc bằng quantity");
        }
        if (!seasonReferenceService.isSeasonProductPairValid(seasonId, productId)) {
            throw new BusinessException("season/product không tồn tại trong DB thật hoặc không khớp nhau");
        }
    }

    private BlockchainTransaction saveBlockchainTransaction(ProductBatch batch, String actionType) {
        BlockchainService.BlockchainResult result = blockchainService.saveBatch(batch);
        if (!"SUCCESS".equalsIgnoreCase(result.getStatus()) || result.getTxHash() == null || result.getTxHash().isBlank()) {
            throw new BusinessException("Ghi dữ liệu lên blockchain thất bại: " + result.getMessage());
        }

        BlockchainTransaction transaction = new BlockchainTransaction();
        transaction.setRelatedEntityType("BATCH");
        transaction.setRelatedEntityId(batch.getBatchId());
        transaction.setActionType(actionType);
        transaction.setTxHash(result.getTxHash());
        transaction.setTxStatus(result.getStatus());
        transaction.setMessage(result.getMessage());
        return blockchainTransactionRepository.save(transaction);
    }

    private String getLatestTxHash(Long batchId) {
        return blockchainTransactionRepository
                .findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("BATCH", batchId)
                .map(BlockchainTransaction::getTxHash)
                .orElse(null);
    }

    private Map<String, Object> buildSeasonInfo(ProductBatch batch, Optional<SeasonReferenceDto> seasonReference) {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("seasonId", batch.getSeasonId());
        info.put("productId", batch.getProductId());

        if (seasonReference.isPresent()) {
            SeasonReferenceDto ref = seasonReference.get();
            info.put("status", ref.getStatus() != null ? ref.getStatus() : "FOUND");
            info.put("seasonCode", ref.getSeasonCode());
            info.put("seasonName", ref.getSeasonName());
            info.put("productCode", ref.getProductCode());
            info.put("productName", ref.getProductName());
            info.put("cropName", ref.getCropName());
            info.put("farmCode", ref.getFarmCode());
            info.put("farmName", ref.getFarmName());
            info.put("validatedFromDb", true);
        } else {
            info.put("status", "MISSING_REFERENCE");
            info.put("validatedFromDb", false);
            info.put("note", "Không tìm thấy season/product tương ứng trong schema DB hiện tại.");
        }

        return info;
    }

    private String buildTraceNote(boolean hasSeasonReference, boolean hasProcesses, boolean hasBlockchain) {
        StringBuilder note = new StringBuilder("Trace batch đang trả dữ liệu end-to-end trong phạm vi dữ liệu hiện có.");

        if (hasSeasonReference) {
            note.append(" Season/product đã được validate từ DB thật.");
        } else {
            note.append(" Season/product chưa đọc được từ schema hiện tại nên cần kiểm tra lại dữ liệu TV1 đã merge chưa.");
        }

        if (hasProcesses) {
            note.append(" Process list đã được nạp từ dữ liệu thật theo season.");
        } else {
            note.append(" Chưa có process thực tế cho season này hoặc module TV2 chưa merge schema/process data.");
        }

        if (hasBlockchain) {
            note.append(" Blockchain sync đã có bản ghi gần nhất cho batch.");
        } else {
            note.append(" Batch chưa có bản ghi blockchain.");
        }

        return note.toString();
    }

    private String normalizeStatus(String rawStatus) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return "CREATED";
        }
        return rawStatus.trim().toUpperCase();
    }

    private String trimOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private BatchResponse toBatchResponse(ProductBatch batch, String latestTxHash) {
        return BatchResponse.builder()
                .batchId(batch.getBatchId())
                .seasonId(batch.getSeasonId())
                .productId(batch.getProductId())
                .batchCode(batch.getBatchCode())
                .harvestDate(batch.getHarvestDate())
                .quantity(batch.getQuantity())
                .availableQuantity(batch.getAvailableQuantity())
                .qualityGrade(batch.getQualityGrade())
                .expiryDate(batch.getExpiryDate())
                .batchStatus(batch.getBatchStatus())
                .latestTxHash(latestTxHash)
                .createdAt(batch.getCreatedAt())
                .updatedAt(batch.getUpdatedAt())
                .build();
    }

    private QrCodeResponse toQrCodeResponse(QrCode qrCode) {
        return QrCodeResponse.builder()
                .qrCodeId(qrCode.getQrCodeId())
                .batchId(qrCode.getBatch().getBatchId())
                .qrValue(qrCode.getQrValue())
                .qrUrl(qrCode.getQrUrl())
                .qrImageBase64(qrCodeService.generateBase64Png(qrCode.getQrValue()))
                .status(qrCode.getStatus())
                .generatedAt(qrCode.getGeneratedAt())
                .build();
    }
}
