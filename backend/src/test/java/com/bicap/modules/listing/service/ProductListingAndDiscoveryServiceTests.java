package com.bicap.modules.listing.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.batch.repository.QrCodeRepository;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.discovery.service.DiscoveryService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.listing.dto.CreateListingRequest;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.dto.UpdateListingRequest;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ListingRegistrationRequestRepository;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.season.entity.FarmingSeason;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductListingAndDiscoveryServiceTests {

    @Mock
    private ProductListingRepository listingRepository;

    @Mock
    private ProductBatchRepository batchRepository;

    @Mock
    private ListingRegistrationRequestRepository listingRegistrationRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private QrCodeRepository qrCodeRepository;

    @InjectMocks
    private ProductListingService productListingService;

    private DiscoveryService discoveryService;

    private ProductBatch batch;
    private ProductListing listing;

    @BeforeEach
    void setUp() {
        User owner = new User();
        owner.setUserId(7L);
        owner.setFullName("Farm Owner");

        Farm farm = new Farm();
        farm.setFarmId(11L);
        farm.setFarmName("Green Farm");
        farm.setFarmCode("GF-01");
        farm.setProvince("Lam Dong");
        farm.setOwnerUser(owner);
        farm.setApprovalStatus("APPROVED");

        Product product = new Product();
        product.setProductId(22L);
        product.setProductCode("P-22");
        product.setProductName("Rau cải");

        FarmingSeason season = new FarmingSeason();
        season.setSeasonId(33L);
        season.setFarm(farm);
        season.setProduct(product);
        season.setSeasonStatus("HARVESTED");

        batch = new ProductBatch();
        batch.setBatchId(44L);
        batch.setBatchCode("BATCH-44");
        batch.setSeason(season);
        batch.setProduct(product);
        batch.setAvailableQuantity(BigDecimal.valueOf(120));
        batch.setQuantity(BigDecimal.valueOf(150));
        batch.setQualityGrade("A");
        batch.setHarvestDate(LocalDate.of(2026, 4, 10));
        batch.setExpiryDate(LocalDate.now().plusDays(10));
        batch.setBatchStatus("READY");

        listing = new ProductListing();
        listing.setListingId(55L);
        listing.setBatch(batch);
        listing.setTitle("Rau cải hữu cơ");
        listing.setDescription("Lô rau mới thu hoạch");
        listing.setPrice(BigDecimal.valueOf(45000));
        listing.setQuantityAvailable(BigDecimal.valueOf(80));
        listing.setUnit("kg");
        listing.setStatus("ACTIVE");

        lenient().when(qrCodeRepository.existsByBatchBatchIdAndStatus(any(), eq("ACTIVE"))).thenReturn(true);
        discoveryService = new DiscoveryService(listingRepository, productListingService);
    }

    @Test
    void createListing_shouldRejectExpiredBatch() {
        batch.setExpiryDate(LocalDate.now().minusDays(1));
        when(batchRepository.findById(44L)).thenReturn(Optional.of(batch));

        CreateListingRequest request = new CreateListingRequest();
        request.setBatchId(44L);
        request.setTitle("Rau cải hữu cơ");
        request.setPrice(BigDecimal.valueOf(45000));
        request.setQuantityAvailable(BigDecimal.valueOf(50));

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(7L);
            assertThrows(BusinessException.class, () -> productListingService.createListing(request));
        }
    }

    @Test
    void updateListing_shouldRejectInvalidStatus() {
        when(listingRepository.findById(55L)).thenReturn(Optional.of(listing));

        UpdateListingRequest request = new UpdateListingRequest();
        request.setStatus("PUBLISHED_NOW");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(7L);
            assertThrows(BusinessException.class, () -> productListingService.updateListing(55L, request));
        }
    }

    @Test
    void createListing_shouldEnrichAndPersistCleanValues() {
        when(batchRepository.findById(44L)).thenReturn(Optional.of(batch));
        when(listingRepository.save(any(ProductListing.class))).thenAnswer(invocation -> {
            ProductListing saved = invocation.getArgument(0);
            saved.setListingId(99L);
            return saved;
        });

        CreateListingRequest request = new CreateListingRequest();
        request.setBatchId(44L);
        request.setTitle("  Rau cải hữu cơ  ");
        request.setDescription("  Lô rau mới thu hoạch  ");
        request.setPrice(BigDecimal.valueOf(45000));
        request.setQuantityAvailable(BigDecimal.valueOf(75));
        request.setUnit("  kg  ");
        request.setImageUrl("  https://example.com/rau.png  ");

        try (MockedStatic<com.bicap.core.security.SecurityUtils> security = mockStatic(com.bicap.core.security.SecurityUtils.class)) {
            security.when(com.bicap.core.security.SecurityUtils::getCurrentUserId).thenReturn(7L);
            ListingResponse response = productListingService.createListing(request);

            assertEquals(99L, response.getListingId());
            assertEquals("P-22", response.getProductCode());
            assertEquals("GF-01", response.getFarmCode());
            assertEquals("Lam Dong", response.getProvince());

            ArgumentCaptor<ProductListing> captor = ArgumentCaptor.forClass(ProductListing.class);
            verify(listingRepository).save(captor.capture());
            assertEquals("Rau cải hữu cơ", captor.getValue().getTitle());
            assertEquals("Lô rau mới thu hoạch", captor.getValue().getDescription());
            assertEquals("kg", captor.getValue().getUnit());
            assertEquals("https://example.com/rau.png", captor.getValue().getImageUrl());
        }
    }

    @Test
    void discoverySearch_shouldUseNewestFirstSort() {
        when(listingRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(listing), PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")), 1));

        List<ListingResponse> result = discoveryService.search("rau", BigDecimal.valueOf(10000), BigDecimal.valueOf(50000), "Lam Dong");

        assertEquals(1, result.size());
        assertEquals("P-22", result.get(0).getProductCode());
        assertEquals("GF-01", result.get(0).getFarmCode());
        assertEquals("Lam Dong", result.get(0).getProvince());

        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);
        verify(listingRepository).findAll(any(Specification.class), pageableCaptor.capture());
        assertNotNull(pageableCaptor.getValue().getSort().getOrderFor("createdAt"));
        assertEquals(Sort.Direction.DESC, pageableCaptor.getValue().getSort().getOrderFor("createdAt").getDirection());
    }

    @Test
    void discoverySearch_shouldSupportPriceSortAsc() {
        when(listingRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(listing), PageRequest.of(0, 9, Sort.by(Sort.Direction.ASC, "price")), 1));

        discoveryService.search("rau", null, null, null, null, null, 0, 9, "price,asc");

        ArgumentCaptor<PageRequest> pageableCaptor = ArgumentCaptor.forClass(PageRequest.class);
        verify(listingRepository).findAll(any(Specification.class), pageableCaptor.capture());
        assertEquals(Sort.Direction.ASC, pageableCaptor.getValue().getSort().getOrderFor("price").getDirection());
    }

    @Test
    void discoverySearch_shouldRejectUnsupportedSortField() {
        assertThrows(IllegalArgumentException.class,
                () -> discoveryService.search("rau", null, null, null, null, null, 0, 9, "province,asc"));
    }
}
