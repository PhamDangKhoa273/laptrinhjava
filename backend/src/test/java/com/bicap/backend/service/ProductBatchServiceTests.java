package com.bicap.backend.service;

import com.bicap.backend.dto.CreateBatchRequest;
import com.bicap.backend.dto.QrCodeResponse;
import com.bicap.backend.entity.BlockchainTransaction;
import com.bicap.backend.entity.ProductBatch;
import com.bicap.backend.entity.QrCode;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.BlockchainTransactionRepository;
import com.bicap.backend.repository.ProductBatchRepository;
import com.bicap.backend.repository.QrCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductBatchServiceTests {

    @Mock
    private ProductBatchRepository productBatchRepository;
    @Mock
    private QrCodeRepository qrCodeRepository;
    @Mock
    private BlockchainTransactionRepository blockchainTransactionRepository;
    @Mock
    private BlockchainService blockchainService;
    @Mock
    private QrCodeService qrCodeService;

    @InjectMocks
    private ProductBatchService productBatchService;

    private CreateBatchRequest request;

    @BeforeEach
    void setUp() {
        request = new CreateBatchRequest();
        request.setSeasonId(10L);
        request.setProductId(20L);
        request.setBatchCode("BATCH-001");
        request.setHarvestDate(LocalDate.of(2026, 4, 5));
        request.setQuantity(new BigDecimal("100"));
        request.setAvailableQuantity(new BigDecimal("80"));
        request.setQualityGrade("A");
        request.setBatchStatus("CREATED");
    }

    @Test
    void createBatch_shouldThrow_whenAvailableQuantityGreaterThanQuantity() {
        request.setAvailableQuantity(new BigDecimal("120"));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> productBatchService.createBatch(request));

        assertTrue(ex.getMessage().contains("availableQuantity"));
    }

    @Test
    void createBatch_shouldThrow_whenBatchCodeExists() {
        when(productBatchRepository.existsByBatchCode("BATCH-001")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> productBatchService.createBatch(request));

        assertTrue(ex.getMessage().contains("batchCode đã tồn tại"));
    }

    @Test
    void generateQrCode_shouldThrow_whenActiveQrAlreadyExists() {
        ProductBatch batch = new ProductBatch();
        batch.setBatchId(1L);
        batch.setBatchCode("BATCH-001");
        batch.setSeasonId(10L);

        QrCode qrCode = new QrCode();
        qrCode.setBatch(batch);
        qrCode.setStatus("ACTIVE");

        when(productBatchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(qrCodeRepository.findByBatchBatchIdAndStatus(1L, "ACTIVE")).thenReturn(Optional.of(qrCode));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> productBatchService.generateQrCode(1L));

        assertTrue(ex.getMessage().contains("QR active"));
    }

    @Test
    void generateQrCode_shouldIncludeSeasonIdInPayload() {
        ProductBatch batch = new ProductBatch();
        batch.setBatchId(1L);
        batch.setBatchCode("BATCH-001");
        batch.setSeasonId(10L);

        when(productBatchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(qrCodeRepository.findByBatchBatchIdAndStatus(1L, "ACTIVE")).thenReturn(Optional.empty());
        when(qrCodeRepository.save(any(QrCode.class))).thenAnswer(invocation -> {
            QrCode saved = invocation.getArgument(0);
            saved.setQrCodeId(99L);
            saved.setGeneratedAt(LocalDateTime.now());
            return saved;
        });
        when(qrCodeService.generateBase64Png(anyString())).thenReturn("base64png");

        QrCodeResponse response = productBatchService.generateQrCode(1L);

        assertNotNull(response);
        assertTrue(response.getQrValue().contains("\"season_id\":10"));
        assertTrue(response.getQrValue().contains("\"trace_url\":\"/api/trace/batches/1\""));
    }

    @Test
    void createBatch_shouldSaveBlockchainTransactionAsBatchCreate() {
        when(productBatchRepository.existsByBatchCode("BATCH-001")).thenReturn(false);
        when(productBatchRepository.save(any(ProductBatch.class))).thenAnswer(invocation -> {
            ProductBatch saved = invocation.getArgument(0);
            if (saved.getBatchId() == null) {
                saved.setBatchId(1L);
            }
            return saved;
        });
        when(blockchainService.saveBatch(any(ProductBatch.class)))
                .thenReturn(BlockchainService.BlockchainResult.builder()
                        .txHash("tx_123")
                        .status("SUCCESS")
                        .message("ok")
                        .build());
        when(blockchainTransactionRepository.save(any(BlockchainTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        productBatchService.createBatch(request);

        ArgumentCaptor<BlockchainTransaction> captor = ArgumentCaptor.forClass(BlockchainTransaction.class);
        verify(blockchainTransactionRepository).save(captor.capture());
        BlockchainTransaction tx = captor.getValue();

        assertEquals("BATCH", tx.getRelatedEntityType());
        assertEquals("CREATE", tx.getActionType());
        assertEquals("tx_123", tx.getTxHash());
    }
}
