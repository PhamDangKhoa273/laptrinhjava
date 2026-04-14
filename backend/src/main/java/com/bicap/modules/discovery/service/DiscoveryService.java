package com.bicap.modules.discovery.service;

import com.bicap.modules.batch.entity.ProductBatch;
import com.bicap.modules.discovery.specification.ProductListingSpecification;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
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
        // Sắp xếp ngày đăng mới nhất
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        
        List<ProductListing> results = listingRepository.findAll(
                ProductListingSpecification.searchListings(keyword, minPrice, maxPrice, province),
                sort
        );

        return results.stream()
                .map(this::toResponse)
                .toList();
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
