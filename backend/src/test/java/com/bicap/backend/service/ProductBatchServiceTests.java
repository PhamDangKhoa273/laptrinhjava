package com.bicap.backend.service;

import com.bicap.backend.repository.ProductBatchRepository;
import com.bicap.backend.repository.FarmingSeasonRepository;
import com.bicap.backend.repository.ProductRepository;
import com.bicap.backend.repository.FarmingProcessRepository;
import com.bicap.backend.repository.QrCodeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(MockitoExtension.class)
class ProductBatchServiceTests {

    @Mock private ProductBatchRepository productBatchRepository;
    @Mock private FarmingSeasonRepository farmingSeasonRepository;
    @Mock private ProductRepository productRepository;
    @Mock private FarmingProcessRepository farmingProcessRepository;
    @Mock private QrCodeRepository qrCodeRepository;
    @Mock private BlockchainService blockchainService;
    @Mock private QrCodeService qrCodeService;
    @Mock private SeasonService seasonService;

    @InjectMocks
    private ProductBatchService productBatchService;

    @Test
    void contextLoads() {
        assertNotNull(productBatchService);
    }
}

