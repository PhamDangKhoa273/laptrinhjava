package com.bicap.backend.service;

import com.bicap.backend.dto.CreateBatchRequest;
import com.bicap.backend.dto.QrCodeResponse;
import com.bicap.backend.dto.SeasonReferenceDto;
import com.bicap.backend.dto.TraceBatchResponse;
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
import java.util.List;
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
    @Mock
    private SeasonReferenceService seasonReferenceService;
    @Mock
    private ProcessTraceService processTraceService;

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
        when(seasonReferenceService.isSeasonProductPairValid(10L, 20L)).thenReturn(true);
        when(productBatchRepository.existsByBatchCode("BATCH-001")).thenReturn(true);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> productBatchService.createBatch(request));

        assertTrue(ex.getMessage().contains("batchCode đã tồn tại"));
    }

    @Test
    void createBatch_shouldThrow_whenSeasonProductPairMissingInRealDb() {
        when(seasonReferenceService.isSeasonProductPairValid(10L, 20L)).thenReturn(false);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> productBatchService.createBatch(request));

        assertTrue(ex.getMessage().contains("season/product"));
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
        when(seasonReferenceService.isSeasonProductPairValid(10L, 20L)).thenReturn(true);
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

    @Test
    void traceBatch_shouldReturnDbValidatedSeasonAndProcessData() {
        ProductBatch batch = new ProductBatch();
        batch.setBatchId(1L);
        batch.setBatchCode("BATCH-001");
        batch.setSeasonId(10L);
        batch.setProductId(20L);
        batch.setHarvestDate(LocalDate.of(2026, 4, 5));
        batch.setQuantity(new BigDecimal("100"));
        batch.setAvailableQuantity(new BigDecimal("80"));
        batch.setBatchStatus("CREATED");

        BlockchainTransaction tx = new BlockchainTransaction();
        tx.setTxHash("tx_123");
        tx.setTxStatus("SUCCESS");
        tx.setCreatedAt(LocalDateTime.of(2026, 4, 5, 11, 0));

        when(productBatchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(qrCodeRepository.findByBatchBatchIdAndStatus(1L, "ACTIVE")).thenReturn(Optional.empty());
        when(blockchainTransactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("BATCH", 1L))
                .thenReturn(Optional.of(tx));
        when(seasonReferenceService.findSeasonReference(10L, 20L)).thenReturn(Optional.of(
                SeasonReferenceDto.builder()
                        .seasonId(10L)
                        .productId(20L)
                        .seasonCode("S-001")
                        .seasonName("Vu mua xuan")
                        .productCode("P-001")
                        .productName("Gao huu co")
                        .farmCode("F-001")
                        .farmName("Nong trai A")
                        .status("ACTIVE")
                        .derivedProduct(false)
                        .build()
        ));
        when(processTraceService.findProcessesBySeasonId(10L)).thenReturn(List.of(
                com.bicap.backend.dto.ProcessTraceItemDto.builder()
                        .processCode("PR-001")
                        .processName("Gieo trong")
                        .stage("PLANTING")
                        .status("DONE")
                        .notes("Hoan thanh")
                        .build()
        ));

        TraceBatchResponse response = productBatchService.traceBatch(1L);

        assertNotNull(response);
        assertEquals("ACTIVE", response.getSeasonInfo().get("status"));
        assertEquals(Boolean.TRUE, response.getSeasonInfo().get("validatedFromDb"));
        assertEquals(1, response.getProcessList().size());
        assertEquals("PR-001", response.getProcessList().get(0).get("processCode"));
        assertTrue(response.getNote().contains("validate trực tiếp từ DB thật"));
    }

    @Test
    void traceBatch_shouldMarkMissingReferenceWhenNoSeasonDataFound() {
        ProductBatch batch = new ProductBatch();
        batch.setBatchId(2L);
        batch.setBatchCode("BATCH-002");
        batch.setSeasonId(999L);
        batch.setProductId(888L);
        batch.setHarvestDate(LocalDate.of(2026, 4, 5));
        batch.setQuantity(new BigDecimal("100"));
        batch.setAvailableQuantity(new BigDecimal("80"));
        batch.setBatchStatus("CREATED");

        when(productBatchRepository.findById(2L)).thenReturn(Optional.of(batch));
        when(qrCodeRepository.findByBatchBatchIdAndStatus(2L, "ACTIVE")).thenReturn(Optional.empty());
        when(blockchainTransactionRepository.findTopByRelatedEntityTypeAndRelatedEntityIdOrderByCreatedAtDesc("BATCH", 2L))
                .thenReturn(Optional.empty());
        when(seasonReferenceService.findSeasonReference(999L, 888L)).thenReturn(Optional.empty());
        when(processTraceService.findProcessesBySeasonId(999L)).thenReturn(List.of());

        TraceBatchResponse response = productBatchService.traceBatch(2L);

        assertEquals("MISSING_REFERENCE", response.getSeasonInfo().get("status"));
        assertEquals(Boolean.FALSE, response.getSeasonInfo().get("validatedFromDb"));
        assertTrue(response.getProcessList().isEmpty());
        assertTrue(response.getNote().contains("chưa đọc được từ schema hiện tại"));
    }
}
