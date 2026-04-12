package com.bicap.modules.listing.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.batch.repository.ProductBatchRepository;
import com.bicap.modules.listing.dto.CreateListingRequest;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.dto.UpdateListingRequest;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@SuppressWarnings("null")
public class ProductListingService {

    private final ProductListingRepository listingRepository;
    private final ProductBatchRepository batchRepository;

    public ProductListingService(ProductListingRepository listingRepository,
                                  ProductBatchRepository batchRepository) {
        this.listingRepository = listingRepository;
        this.batchRepository = batchRepository;
    }

    @Transactional
    public ListingResponse createListing(CreateListingRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        ProductBatch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy batch với ID: " + request.getBatchId()));

        // Verify batch belongs to the current user's farm
        Long batchOwnerId = batch.getSeason().getFarm().getOwnerUser().getUserId();
        if (!batchOwnerId.equals(currentUserId)) {
            throw new BusinessException("Bạn chỉ được tạo listing từ batch thuộc farm của mình");
        }

        // Verify quantity does not exceed batch available quantity
        if (request.getQuantityAvailable().compareTo(batch.getAvailableQuantity()) > 0) {
            throw new BusinessException(
                    "Số lượng listing (" + request.getQuantityAvailable() +
                    ") không được vượt quá số lượng còn lại trong batch (" + batch.getAvailableQuantity() + ")"
            );
        }

        ProductListing listing = new ProductListing();
        listing.setBatch(batch);
        listing.setTitle(request.getTitle().trim());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setQuantityAvailable(request.getQuantityAvailable());
        listing.setUnit(request.getUnit() != null ? request.getUnit() : "kg");
        listing.setImageUrl(request.getImageUrl());
        listing.setStatus("ACTIVE");

        ProductListing saved = listingRepository.save(listing);
        return toResponse(saved);
    }

    public List<ListingResponse> getPublicListings() {
        return listingRepository.findByStatus("ACTIVE").stream()
                .map(this::toResponse)
                .toList();
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
        return toResponse(listing);
    }

    @Transactional
    public ListingResponse updateListing(Long id, UpdateListingRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        ProductListing listing = listingRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Không tìm thấy listing với ID: " + id));

        // Verify ownership
        Long ownerId = listing.getBatch().getSeason().getFarm().getOwnerUser().getUserId();
        if (!ownerId.equals(currentUserId)) {
            throw new BusinessException("Bạn không có quyền cập nhật listing này");
        }

        if (request.getTitle() != null) {
            listing.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            listing.setDescription(request.getDescription());
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
            listing.setUnit(request.getUnit());
        }
        if (request.getImageUrl() != null) {
            listing.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            listing.setStatus(request.getStatus());
        }

        ProductListing saved = listingRepository.save(listing);
        return toResponse(saved);
    }

    private ListingResponse toResponse(ProductListing listing) {
        ProductBatch batch = listing.getBatch();
        return ListingResponse.builder()
                .listingId(listing.getListingId())
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .productName(batch.getProduct() != null ? batch.getProduct().getProductName() : null)
                .farmName(batch.getSeason() != null && batch.getSeason().getFarm() != null
                        ? batch.getSeason().getFarm().getFarmName() : null)
                .title(listing.getTitle())
                .description(listing.getDescription())
                .price(listing.getPrice())
                .quantityAvailable(listing.getQuantityAvailable())
                .unit(listing.getUnit())
                .imageUrl(listing.getImageUrl())
                .status(listing.getStatus())
                .qualityGrade(batch.getQualityGrade())
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }
}
