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
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductBatchService {

    private final ProductBatchRepository productBatchRepository;
    private final QrCodeRepository qrCodeRepository;
    private final BlockchainTransactionRepository blockchainTransactionRepository;
    private final BlockchainService blockchainService;
    private final QrCodeService qrCodeService;

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
                "{\"batch_id\":%d,\"batch_code\":\"%s\",\"trace_url\":\"%s\"}",
                batch.getBatchId(),
                batch.getBatchCode(),
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
                .seasonInfo(Map.of(
                        "seasonId", batch.getSeasonId(),
                        "status", "PENDING_INTEGRATION",
                        "note", "Season detail sẽ được nối với module TV1 khi FarmingSeason hoàn thiện"
                ))
                .processList(List.of())
                .note("Trace API hiện trả đầy đủ dữ liệu batch, QR và blockchain của TV3. Dữ liệu season/process chi tiết phụ thuộc TV1 và TV2 nên đang để trạng thái chờ tích hợp.")
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

        // TV3 note: season tồn tại thật và product khớp season sẽ được validate chặt bằng DB/service khi TV1 hoàn thiện module.
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
