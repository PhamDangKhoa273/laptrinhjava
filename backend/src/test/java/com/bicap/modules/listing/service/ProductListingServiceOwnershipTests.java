package com.bicap.modules.listing.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.batch.repository.QrCodeRepository;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.listing.dto.CreateListingRequest;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ListingRegistrationRequestRepository;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductListingServiceOwnershipTests {

    @Mock ProductListingRepository listingRepository;
    @Mock ProductBatchRepository batchRepository;
    @Mock ListingRegistrationRequestRepository listingRegistrationRequestRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;
    @Mock QrCodeRepository qrCodeRepository;
    @Mock FarmSubscriptionRepository farmSubscriptionRepository;

    @InjectMocks ProductListingService service;

    private ProductBatch batch;

    @BeforeEach
    void setUp() {
        User owner = new User();
        owner.setUserId(10L);

        Farm farm = new Farm();
        farm.setFarmId(20L);
        farm.setOwnerUser(owner);
        farm.setApprovalStatus("APPROVED");

        Product product = new Product();
        product.setProductId(30L);
        product.setProductName("Rice");

        com.bicap.modules.season.entity.FarmingSeason season = new com.bicap.modules.season.entity.FarmingSeason();
        season.setSeasonId(40L);
        season.setFarm(farm);
        season.setProduct(product);

        batch = new ProductBatch();
        batch.setBatchId(50L);
        batch.setSeason(season);
        batch.setProduct(product);
        batch.setAvailableQuantity(BigDecimal.TEN);
        batch.setQualityGrade("A");
        batch.setHarvestDate(java.time.LocalDate.now());
        batch.setExpiryDate(java.time.LocalDate.now().plusDays(10));
    }

    @Test
    void createListing_shouldRejectNonOwner() {
        CreateListingRequest request = new CreateListingRequest();
        request.setBatchId(50L);
        request.setTitle("Listing");
        request.setPrice(BigDecimal.valueOf(100000));
        request.setQuantityAvailable(BigDecimal.ONE);
        request.setUnit("kg");

        when(batchRepository.findById(50L)).thenReturn(Optional.of(batch));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(99L);
            assertThatThrownBy(() -> service.createListing(request)).isInstanceOf(BusinessException.class);
        }
    }

    @Test
    void getListingById_shouldAllowOwnerButRejectPublicAccessForDraft() {
        ProductListing listing = new ProductListing();
        listing.setListingId(60L);
        listing.setBatch(batch);
        listing.setTitle("Draft");
        listing.setPrice(BigDecimal.ONE);
        listing.setQuantityAvailable(BigDecimal.ONE);
        listing.setUnit("kg");
        listing.setStatus(com.bicap.core.enums.ListingStatus.DRAFT);
        listing.setApprovalStatus(com.bicap.core.enums.ApprovalStatus.DRAFT);

        when(listingRepository.findById(60L)).thenReturn(Optional.of(listing));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserIdOrNull).thenReturn(null);
            assertThatThrownBy(() -> service.getListingById(60L)).isInstanceOf(BusinessException.class);
        }
    }

    @Test
    void createListing_shouldReturnBusinessErrorWhenBatchHasNoFarm() {
        batch.setSeason(null);

        CreateListingRequest request = new CreateListingRequest();
        request.setBatchId(50L);
        request.setTitle("Listing");
        request.setPrice(BigDecimal.valueOf(100000));
        request.setQuantityAvailable(BigDecimal.ONE);
        request.setUnit("kg");

        when(batchRepository.findById(50L)).thenReturn(Optional.of(batch));

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(10L);
            assertThatThrownBy(() -> service.createListing(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Batch");
        }
    }

    @Test
    void createListing_shouldAllowGracePeriodSubscription() {
        batch.getSeason().setSeasonStatus("HARVESTED");

        FarmSubscription subscription = new FarmSubscription();
        subscription.setStartDate(java.time.LocalDate.now().minusDays(1));
        subscription.setEndDate(java.time.LocalDate.now().plusDays(1));
        subscription.setSubscriptionStatus("GRACE_PERIOD");

        CreateListingRequest request = new CreateListingRequest();
        request.setBatchId(50L);
        request.setTitle("Listing");
        request.setPrice(BigDecimal.valueOf(100000));
        request.setQuantityAvailable(BigDecimal.ONE);
        request.setUnit("kg");

        when(batchRepository.findById(50L)).thenReturn(Optional.of(batch));
        when(qrCodeRepository.existsByBatchBatchIdAndStatus(50L, "ACTIVE")).thenReturn(true);
        when(qrCodeRepository.findByBatch_BatchId(50L)).thenReturn(Optional.empty());
        when(farmSubscriptionRepository.findByFarmOwnerUserUserIdAndSubscriptionStatusIgnoreCase(10L, "ACTIVE")).thenReturn(java.util.List.of());
        when(farmSubscriptionRepository.findByFarmOwnerUserUserIdAndSubscriptionStatusIgnoreCase(10L, "EXPIRING_SOON")).thenReturn(java.util.List.of());
        when(farmSubscriptionRepository.findByFarmOwnerUserUserIdAndSubscriptionStatusIgnoreCase(10L, "GRACE_PERIOD")).thenReturn(java.util.List.of(subscription));
        when(listingRepository.sumListedQuantityByBatchId(50L, null)).thenReturn(BigDecimal.ZERO);
        when(listingRepository.save(any(ProductListing.class))).thenAnswer(invocation -> {
            ProductListing saved = invocation.getArgument(0);
            saved.setListingId(70L);
            return saved;
        });

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(10L);
            service.createListing(request);
        }
    }
}
