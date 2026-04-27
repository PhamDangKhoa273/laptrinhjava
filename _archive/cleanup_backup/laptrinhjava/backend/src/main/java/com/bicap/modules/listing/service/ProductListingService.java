package com.bicap.modules.listing.service;

import com.bicap.core.enums.ApprovalStatus;
import com.bicap.core.enums.ListingStatus;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.entity.QrCode;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.batch.repository.QrCodeRepository;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.listing.dto.CreateListingRequest;
import com.bicap.modules.listing.dto.ListingRegistrationRequestDto;
import com.bicap.modules.listing.dto.ListingRegistrationResponse;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.dto.ReviewListingRegistrationRequest;
import com.bicap.modules.listing.dto.UpdateListingRequest;
import com.bicap.modules.listing.entity.ListingRegistrationRequest;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ListingRegistrationRequestRepository;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.product.entity.Product;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ProductListingService {

    private final ProductListingRepository listingRepository;
    private final ProductBatchRepository batchRepository;
    private final ListingRegistrationRequestRepository listingRegistrationRequestRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final QrCodeRepository qrCodeRepository;
    private final FarmSubscriptionRepository farmSubscriptionRepository;

    public ProductListingService(ProductListingRepository listingRepository,
                                 ProductBatchRepository batchRepository,
                                 ListingRegistrationRequestRepository listingRegistrationRequestRepository,
                                 UserRepository userRepository,
                                 NotificationService notificationService,
                                 QrCodeRepository qrCodeRepository,
                                 FarmSubscriptionRepository farmSubscriptionRepository) {
        this.listingRepository = listingRepository;
        this.batchRepository = batchRepository;
        this.listingRegistrationRequestRepository = listingRegistrationRequestRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.qrCodeRepository = qrCodeRepository;
        this.farmSubscriptionRepository = farmSubscriptionRepository;
    }

    @Transactional
    public ListingResponse createListing(CreateListingRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        ProductBatch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy batch với ID: " + request.getBatchId()));

        Long batchOwnerId = batch.getSeason().getFarm().getOwnerUser().getUserId();
        if (!batchOwnerId.equals(currentUserId)) {
            throw new BusinessException("Bạn chỉ được tạo listing từ batch thuộc farm của mình");
        }
        validateBatchEligibility(batch);
        ensureActivePackageEntitlement(batch.getSeason().getFarm().getOwnerUser().getUserId());

        if (request.getQuantityAvailable().compareTo(batch.getAvailableQuantity()) > 0) {
            throw new BusinessException(
                    "Số lượng listing (" + request.getQuantityAvailable() +
                            ") không được vượt quá số lượng còn lại trong batch (" + batch.getAvailableQuantity() + ")"
            );
        }

        ProductListing listing = new ProductListing();
        listing.setBatch(batch);
        listing.setTitle(request.getTitle().trim());
        listing.setDescription(trimToNull(request.getDescription()));
        listing.setPrice(request.getPrice());
        listing.setQuantityAvailable(request.getQuantityAvailable());
        listing.setUnit(trimToDefault(request.getUnit(), "kg"));
        listing.setImageUrl(trimToNull(request.getImageUrl()));
        listing.setStatus(ListingStatus.DRAFT);
        listing.setApprovalStatus(ApprovalStatus.DRAFT);

        ProductListing saved = listingRepository.save(listing);
        return toResponse(saved);
    }

    public List<ListingResponse> getPublicListings() {
        return getPublicListings(0, 20, "createdAt,desc").getContent();
    }

    public Page<ListingResponse> getPublicListings(int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, resolvePublicSort(sort));
        return listingRepository.findByStatusAndApprovalStatus(ListingStatus.ACTIVE.name(), ApprovalStatus.APPROVED.name(), pageable)
                .map(this::toResponse);
    }

    public List<ListingResponse> getAllListings() {
        return listingRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ListingResponse> getMyListings() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return listingRepository.findByFarmOwnerId(currentUserId).stream()
                .map(this::toResponse)
                .toList();
    }

    public ListingResponse getListingById(Long id) {
        ProductListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy listing với ID: " + id));

        if (ListingStatus.ACTIVE != listing.getStatusEnum() || ApprovalStatus.APPROVED != listing.getApprovalStatusEnum()) {
            Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
            Long ownerId = listing.getBatch().getSeason().getFarm().getOwnerUser().getUserId();
            if (currentUserId == null || !ownerId.equals(currentUserId)) {
                throw new BusinessException("Listing chưa sẵn sàng hiển thị công khai.");
            }
        }
        return toResponse(listing);
    }

    @Transactional
    public ListingResponse updateListing(Long id, UpdateListingRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        ProductListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy listing với ID: " + id));

        Long ownerId = listing.getBatch().getSeason().getFarm().getOwnerUser().getUserId();
        if (!ownerId.equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền cập nhật listing này");
        }

        validateBatchEligibility(listing.getBatch());

        if (request.getTitle() != null) {
            listing.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            listing.setDescription(trimToNull(request.getDescription()));
        }
        if (request.getPrice() != null) {
            listing.setPrice(request.getPrice());
        }
        if (request.getQuantityAvailable() != null) {
            BigDecimal batchAvailable = listing.getBatch().getAvailableQuantity();
            if (request.getQuantityAvailable().compareTo(batchAvailable) > 0) {
                throw new BusinessException(
                        "Số lượng listing (" + request.getQuantityAvailable() +
                                ") không được vượt quá số lượng còn lại trong batch (" + batchAvailable + ")"
                );
            }
            listing.setQuantityAvailable(request.getQuantityAvailable());
        }
        if (request.getUnit() != null) {
            listing.setUnit(trimToDefault(request.getUnit(), "kg"));
        }
        if (request.getImageUrl() != null) {
            listing.setImageUrl(trimToNull(request.getImageUrl()));
        }
        if (request.getStatus() != null) {
            String normalizedStatus = request.getStatus().trim().toUpperCase();
            try {
                listing.setStatus(ListingStatus.valueOf(normalizedStatus));
            } catch (IllegalArgumentException ex) {
                throw new BusinessException("Trạng thái listing không hợp lệ.");
            }
        }

        ProductListing saved = listingRepository.save(listing);
        return toResponse(saved);
    }


    public Page<ListingResponse> searchPublicListings(String keyword, String province, String certification, Boolean availableOnly, Boolean verifiedOnly, LocalDate harvestFrom, LocalDate harvestTo, int page, int size, String sort) {
        Pageable pageable = PageRequest.of(page, size, resolvePublicSort(sort));
        List<ListingResponse> filtered = listingRepository.findByStatusAndApprovalStatus(ListingStatus.ACTIVE.name(), ApprovalStatus.APPROVED.name(), pageable)
                .stream()
                .map(this::toResponse)
                .filter(listing -> matchesKeyword(listing, keyword))
                .filter(listing -> matchesProvince(listing, province))
                .filter(listing -> matchesCertification(listing, certification))
                .filter(listing -> availableOnly == null || !availableOnly || Boolean.TRUE.equals(listing.getAvailableForRetailer()))
                .filter(listing -> verifiedOnly == null || !verifiedOnly || isVerifiedCertification(listing.getCertificationStatus()))
                .filter(listing -> matchesHarvestRange(listing, harvestFrom, harvestTo))
                .toList();
        int total = filtered.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        return new org.springframework.data.domain.PageImpl<>(filtered.subList(from, to), pageable, total);
    }

    private boolean matchesKeyword(ListingResponse listing, String keyword) {
        if (keyword == null || keyword.isBlank()) return true;
        String n = keyword.trim().toLowerCase();
        return contains(listing.getTitle(), n) || contains(listing.getProductName(), n) || contains(listing.getFarmName(), n) || contains(listing.getProvince(), n) || contains(listing.getProductCategory(), n);
    }

    private boolean matchesProvince(ListingResponse listing, String province) {
        if (province == null || province.isBlank()) return true;
        return normalizeRegion(listing.getProvince()).contains(normalizeRegion(province));
    }

    private boolean matchesCertification(ListingResponse listing, String certification) {
        if (certification == null || certification.isBlank()) return true;
        return normalizeRegion(listing.getCertificationStatus()).contains(normalizeRegion(certification));
    }

    private boolean isVerifiedCertification(String certificationStatus) {
        return certificationStatus != null && Set.of("VIETGAP", "GLOBALGAP", "ORGANIC").contains(certificationStatus.trim().toUpperCase());
    }

    private boolean matchesHarvestRange(ListingResponse listing, LocalDate harvestFrom, LocalDate harvestTo) {
        if (harvestFrom == null && harvestTo == null) return true;
        LocalDate harvestDate = listing.getHarvestDate();
        if (harvestDate == null) return false;
        if (harvestFrom != null && harvestDate.isBefore(harvestFrom)) return false;
        if (harvestTo != null && harvestDate.isAfter(harvestTo)) return false;
        return true;
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase().contains(needle);
    }

    private String normalizeRegion(String value) {
        if (value == null) return "";
        return value.trim().toLowerCase()
                .replace("tp.", "")
                .replace("thành phố", "")
                .replace("tỉnh", "")
                .replace("-", " ")
                .replaceAll("\s+", " ");
    }

    private Sort resolvePublicSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",", 2);
        String sortField = parts[0].trim();
        String direction = parts.length > 1 ? parts[1].trim().toLowerCase() : "desc";
        if (!Set.of("createdAt", "price", "title", "quantityAvailable").contains(sortField)) {
            throw new BusinessException("sort chỉ hỗ trợ createdAt, price, title hoặc quantityAvailable");
        }
        Sort.Direction sortDirection = "asc".equals(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(sortDirection, sortField);
    }

    public ListingResponse toResponse(ProductListing listing) {
        ProductBatch batch = listing.getBatch();
        Product product = batch.getProduct();
        Farm farm = batch.getSeason() != null ? batch.getSeason().getFarm() : null;
        Optional<QrCode> qrCode = batch.getBatchId() == null ? Optional.empty() : qrCodeRepository.findByBatch_BatchId(batch.getBatchId());
        String traceCode = qrCode.map(QrCode::getQrValue).filter(this::hasText).orElse(null);
        String qrCodeUrl = qrCode.map(QrCode::getQrUrl).filter(this::hasText).orElse(null);
        boolean farmApproved = farm != null && ApprovalStatus.APPROVED.name().equalsIgnoreCase(farm.getApprovalStatus());
        boolean traceable = traceCode != null || qrCodeUrl != null;
        boolean availableForRetailer = ListingStatus.ACTIVE == listing.getStatusEnum()
                && ApprovalStatus.APPROVED == listing.getApprovalStatusEnum()
                && farmApproved
                && traceable
                && batch.getAvailableQuantity() != null
                && batch.getAvailableQuantity().compareTo(BigDecimal.ZERO) > 0
                && (batch.getExpiryDate() == null || !batch.getExpiryDate().isBefore(LocalDate.now()));

        return ListingResponse.builder()
                .listingId(listing.getListingId())
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .traceCode(traceCode)
                .qrCodeUrl(qrCodeUrl)
                .productName(product != null ? product.getProductName() : null)
                .productCode(product != null ? product.getProductCode() : null)
                .productCategory(product != null && product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .farmName(farm != null ? farm.getFarmName() : null)
                .farmCode(farm != null ? farm.getFarmCode() : null)
                .farmType(farm != null ? farm.getFarmType() : null)
                .province(farm != null ? farm.getProvince() : null)
                .address(farm != null ? farm.getAddress() : null)
                .certificationStatus(farm != null ? farm.getCertificationStatus() : null)
                .seasonCode(batch.getSeason() != null ? batch.getSeason().getSeasonCode() : null)
                .seasonStatus(batch.getSeason() != null ? batch.getSeason().getSeasonStatus() : null)
                .farmingMethod(batch.getSeason() != null ? batch.getSeason().getFarmingMethod() : null)
                .harvestDate(batch.getHarvestDate())
                .expiryDate(batch.getExpiryDate())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .quantityAvailable(listing.getQuantityAvailable())
                .unit(listing.getUnit())
                .imageUrl(hasText(listing.getImageUrl()) ? listing.getImageUrl() : product != null ? product.getImageUrl() : null)
                .status(listing.getStatus())
                .approvalStatus(listing.getApprovalStatus())
                .qualityGrade(batch.getQualityGrade())
                .traceable(traceable)
                .farmApproved(farmApproved)
                .availableForRetailer(availableForRetailer)
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    @Transactional
    public ListingRegistrationResponse submitRegistration(Long listingId, ListingRegistrationRequestDto request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProductListing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy listing với ID: " + listingId));

        Long ownerId = listing.getBatch().getSeason().getFarm().getOwnerUser().getUserId();
        if (!ownerId.equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền gửi đăng ký cho listing này");
        }

        if (listingRegistrationRequestRepository.findByListingListingId(listingId).isPresent()) {
            throw new BusinessException("Listing này đã có yêu cầu đăng ký trước đó");
        }

        User requester = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người gửi yêu cầu"));

        ListingRegistrationRequest registrationRequest = new ListingRegistrationRequest();
        registrationRequest.setListing(listing);
        registrationRequest.setRequestedByUser(requester);
        registrationRequest.setStatus(ApprovalStatus.PENDING.name());
        registrationRequest.setNote(request.getNote().trim());
        listing.setApprovalStatus(ApprovalStatus.PENDING);
        listing.setStatus(ListingStatus.INACTIVE);

        listingRepository.save(listing);
        ListingRegistrationResponse response = toRegistrationResponse(listingRegistrationRequestRepository.save(registrationRequest));

        CreateNotificationRequest notification = new CreateNotificationRequest();
        notification.setRecipientRole("ADMIN");
        notification.setTitle("Yêu cầu duyệt listing mới");
        notification.setMessage("Listing '" + listing.getTitle() + "' đang chờ admin duyệt.");
        notification.setNotificationType("LISTING_REGISTRATION");
        notification.setTargetType("LISTING");
        notification.setTargetId(listing.getListingId());
        notificationService.create(notification);

        return response;
    }

    @Transactional
    public ListingRegistrationResponse reviewRegistration(Long registrationId, ReviewListingRegistrationRequest request) {
        ListingRegistrationRequest registrationRequest = listingRegistrationRequestRepository.findById(registrationId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy yêu cầu duyệt listing với ID: " + registrationId));

        if (!ApprovalStatus.PENDING.name().equals(registrationRequest.getStatus())) {
            throw new BusinessException("Yêu cầu này đã được xử lý trước đó");
        }

        String status = request.getStatus().trim().toUpperCase();
        if (!ApprovalStatus.APPROVED.name().equals(status) && !ApprovalStatus.REJECTED.name().equals(status)) {
            throw new BusinessException("Trạng thái duyệt chỉ có thể là APPROVED hoặc REJECTED");
        }

        Long reviewerId = SecurityUtils.getCurrentUserId();
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy admin duyệt yêu cầu"));

        registrationRequest.setReviewedByUser(reviewer);
        registrationRequest.setReviewedAt(java.time.LocalDateTime.now());
        registrationRequest.setStatus(status);
        registrationRequest.setNote(trimToNull(request.getNote()) != null ? request.getNote().trim() : registrationRequest.getNote());

        ProductListing listing = registrationRequest.getListing();
        listing.setApprovalStatus(ApprovalStatus.valueOf(status));
        listing.setStatus(ApprovalStatus.APPROVED.name().equals(status) ? ListingStatus.ACTIVE : ListingStatus.INACTIVE);
        listingRepository.save(listing);

        CreateNotificationRequest notification = new CreateNotificationRequest();
        notification.setRecipientUserId(registrationRequest.getRequestedByUser().getUserId());
        notification.setTitle("Kết quả duyệt listing");
        notification.setMessage("Listing '" + listing.getTitle() + "' đã được " + (ApprovalStatus.APPROVED.name().equals(status) ? "phê duyệt" : "từ chối"));
        notification.setNotificationType("LISTING_REVIEW");
        notification.setTargetType("LISTING");
        notification.setTargetId(listing.getListingId());
        notificationService.create(notification);

        return toRegistrationResponse(listingRegistrationRequestRepository.save(registrationRequest));
    }

    public List<ListingRegistrationResponse> getMyRegistrationRequests() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        return listingRegistrationRequestRepository.findByRequestedByUserUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::toRegistrationResponse)
                .toList();
    }

    public List<ListingRegistrationResponse> getPendingRegistrationRequests() {
        return listingRegistrationRequestRepository.findByStatusOrderByCreatedAtDesc(ApprovalStatus.PENDING.name())
                .stream()
                .map(this::toRegistrationResponse)
                .toList();
    }

    private ListingRegistrationResponse toRegistrationResponse(ListingRegistrationRequest request) {
        ListingRegistrationResponse response = new ListingRegistrationResponse();
        response.setRegistrationId(request.getRegistrationId());
        response.setListingId(request.getListing().getListingId());
        response.setListingTitle(request.getListing().getTitle());
        response.setListingStatus(request.getListing().getStatus());
        response.setRequestedByUserId(request.getRequestedByUser().getUserId());
        response.setRequestedByName(request.getRequestedByUser().getFullName());
        response.setStatus(request.getStatus());
        response.setNote(request.getNote());
        response.setReviewedByUserId(request.getReviewedByUser() != null ? request.getReviewedByUser().getUserId() : null);
        response.setReviewedByName(request.getReviewedByUser() != null ? request.getReviewedByUser().getFullName() : null);
        response.setReviewedAt(request.getReviewedAt());
        response.setCreatedAt(request.getCreatedAt());
        response.setUpdatedAt(request.getUpdatedAt());
        return response;
    }

    private void validateBatchEligibility(ProductBatch batch) {
        Farm farm = batch.getSeason() != null ? batch.getSeason().getFarm() : null;
        if (farm == null) {
            throw new BusinessException("Batch chưa gắn với farm hợp lệ.");
        }
        if (!ApprovalStatus.APPROVED.name().equalsIgnoreCase(farm.getApprovalStatus())) {
            throw new BusinessException("Farm chưa được phê duyệt, không thể đưa listing lên sàn.");
        }
        if (batch.getSeason() == null || !Set.of("HARVESTED", "COMPLETED").contains(trimToDefault(batch.getSeason().getSeasonStatus(), "").toUpperCase())) {
            throw new BusinessException("Chỉ có thể đưa batch của mùa vụ đã HARVESTED hoặc COMPLETED lên sàn.");
        }
        if (batch.getAvailableQuantity() == null || batch.getAvailableQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Batch đã hết hàng, không thể tạo hoặc cập nhật listing.");
        }
        if (batch.getExpiryDate() != null && batch.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Batch đã hết hạn, không thể đưa lên sàn.");
        }
        if (batch.getBatchStatus() != null && "SOLD_OUT".equalsIgnoreCase(batch.getBatchStatus())) {
            throw new BusinessException("Batch đã bán hết, không thể đưa lên sàn.");
        }
        if (!qrCodeRepository.existsByBatchBatchIdAndStatus(batch.getBatchId(), "ACTIVE")) {
            throw new BusinessException("Batch chưa có QR active, chưa đủ điều kiện đưa lên sàn.");
        }
    }

    private void ensureActivePackageEntitlement(Long ownerUserId) {
        if (farmSubscriptionRepository == null) {
            return;
        }
        boolean hasActive = farmSubscriptionRepository.findByFarmOwnerUserUserIdAndSubscriptionStatusIgnoreCase(ownerUserId, "ACTIVE").stream()
                .anyMatch(subscription -> subscription.getStartDate() != null
                        && subscription.getEndDate() != null
                        && !subscription.getStartDate().isAfter(LocalDate.now())
                        && !subscription.getEndDate().isBefore(LocalDate.now()));
        if (!hasActive) {
            throw new BusinessException("Farm chưa có gói ACTIVE để tạo listing");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String trimToDefault(String value, String fallback) {
        String trimmed = trimToNull(value);
        return trimmed != null ? trimmed : fallback;
    }
}
