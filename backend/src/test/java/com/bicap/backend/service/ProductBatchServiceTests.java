package com.bicap.backend.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.dto.BatchResponse;
import com.bicap.modules.batch.dto.QrCodeResponse;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.entity.QrCode;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.batch.repository.QrCodeRepository;
import com.bicap.modules.batch.service.BlockchainService;
import com.bicap.modules.batch.service.ProductBatchService;
import com.bicap.modules.batch.service.QrCodeService;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.product.repository.ProductRepository;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.season.repository.FarmingProcessRepository;
import com.bicap.modules.season.service.SeasonService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class ProductBatchServiceTests {

    @Mock
    private ProductBatchRepository productBatchRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private FarmingProcessRepository farmingProcessRepository;
    @Mock
    private QrCodeRepository qrCodeRepository;
    @Mock
    private BlockchainService blockchainService;
    @Mock
    private QrCodeService qrCodeService;
    @Mock
    private SeasonService seasonService;

    @InjectMocks
    private ProductBatchService productBatchService;

    private FarmingSeason season;
    private Product product;
    private ProductBatch batch;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setProductId(20L);
        product.setProductCode("PROD-01");
        product.setProductName("Pepper");

        season = new FarmingSeason();
        season.setSeasonId(10L);
        season.setSeasonCode("SEASON-01");
        season.setProduct(product);

        batch = new ProductBatch();
        batch.setBatchId(30L);
        batch.setSeason(season);
        batch.setProduct(product);
        batch.setBatchCode("BATCH-01");
        batch.setHarvestDate(LocalDate.of(2026, 5, 20));
        batch.setQuantity(BigDecimal.valueOf(100));
        batch.setAvailableQuantity(BigDecimal.valueOf(80));
        batch.setQualityGrade("A");
        batch.setBatchStatus("CREATED");
    }

    @Test
    void getBatchById_shouldThrowWhenMissing() {
        when(productBatchRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(BusinessException.class, () -> productBatchService.getBatchById(999L));
    }

    @Test
    void getBatchById_shouldReturnBatch() {
        when(productBatchRepository.findById(30L)).thenReturn(Optional.of(batch));

        BatchResponse response = productBatchService.getBatchById(30L);

        assertEquals("BATCH-01", response.getBatchCode());
        assertEquals(10L, response.getSeasonId());
    }

    @Test
    void generateQrCode_shouldIncludeTraceUrlAndSerial() {
        when(productBatchRepository.findById(30L)).thenReturn(Optional.of(batch));
        when(seasonService.findSeasonAndCheckPermission(10L, 1L)).thenReturn(season);
        when(qrCodeRepository.findByBatch_BatchId(30L)).thenReturn(Optional.empty());
        when(qrCodeService.generateBase64Png(any())).thenReturn("base64-image");
        when(qrCodeRepository.save(any(QrCode.class))).thenAnswer(invocation -> {
            QrCode qrCode = invocation.getArgument(0);
            qrCode.setQrCodeId(77L);
            return qrCode;
        });

        try (org.mockito.MockedStatic<com.bicap.core.security.SecurityUtils> mocked = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            mocked.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(1L);

            QrCodeResponse response = productBatchService.generateQrCode(30L);

            assertEquals("QR-BATCH-30", response.getSerialNo());
            assertEquals("/trace/batches/30", response.getQrUrl());
            assertTrue(response.getQrCodeData().contains("batchId=30"));
        }
    }
}
