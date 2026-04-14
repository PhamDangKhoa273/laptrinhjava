package com.bicap.modules.discovery.service;

import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.discovery.specification.ProductListingSpecification;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DiscoveryService {

    private final ProductListingRepository listingRepository;

    public DiscoveryService(ProductListingRepository listingRepository) {
        this.listingRepository = listingRepository;
    }

    public List<ListingResponse> search(String keyword, BigDecimal minPrice, BigDecimal maxPrice, String province) {
        return search(keyword, minPrice, maxPrice, province, 0, 20, "createdAt,desc").getContent();
    }

    public Page<ListingResponse> search(String keyword, BigDecimal minPrice, BigDecimal maxPrice, String province,
                                        int page, int size, String sort) {
        String normalizedKeyword = keyword != null ? keyword.trim() : null;
        String normalizedProvince = province != null ? province.trim() : null;
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));

        Page<ProductListing> results = listingRepository.findAll(
                ProductListingSpecification.searchListings(normalizedKeyword, minPrice, maxPrice, normalizedProvince),
                pageable
        );

        return results.map(this::toResponse);
    }

    private ListingResponse toResponse(ProductListing listing) {
        ProductBatch batch = listing.getBatch();
        return ListingResponse.builder()
                .listingId(listing.getListingId())
                .batchId(batch.getBatchId())
                .batchCode(batch.getBatchCode())
                .productName(batch.getProduct() != null ? batch.getProduct().getProductName() : null)
                .productCode(batch.getProduct() != null ? batch.getProduct().getProductCode() : null)
                .farmName(batch.getSeason() != null && batch.getSeason().getFarm() != null
                        ? batch.getSeason().getFarm().getFarmName() : null)
                .farmCode(batch.getSeason() != null && batch.getSeason().getFarm() != null
                        ? batch.getSeason().getFarm().getFarmCode() : null)
                .province(batch.getSeason() != null && batch.getSeason().getFarm() != null
                        ? batch.getSeason().getFarm().getProvince() : null)
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

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",", 2);
        String sortField = parts[0].trim();
        String direction = parts.length > 1 ? parts[1].trim().toLowerCase() : "desc";

        List<String> allowedFields = List.of("createdAt", "price", "title");
        if (!allowedFields.contains(sortField)) {
            throw new IllegalArgumentException("sort chỉ hỗ trợ createdAt, price hoặc title");
        }

        Sort.Direction sortDirection = "asc".equals(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(sortDirection, sortField);
    }
}
