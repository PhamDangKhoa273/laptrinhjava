package com.bicap.modules.discovery.service;

import com.bicap.modules.discovery.specification.ProductListingSpecification;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.entity.ProductListing;
import com.bicap.modules.listing.repository.ProductListingRepository;
import com.bicap.modules.listing.service.ProductListingService;
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
    private final ProductListingService productListingService;

    public DiscoveryService(ProductListingRepository listingRepository,
                            ProductListingService productListingService) {
        this.listingRepository = listingRepository;
        this.productListingService = productListingService;
    }

    public List<ListingResponse> search(String keyword, BigDecimal minPrice, BigDecimal maxPrice, String province) {
        return search(keyword, minPrice, maxPrice, province, null, null, 0, 20, "createdAt,desc").getContent();
    }

    public Page<ListingResponse> search(String keyword,
                                        BigDecimal minPrice,
                                        BigDecimal maxPrice,
                                        String province,
                                        String productCategory,
                                        String certificationStatus,
                                        int page,
                                        int size,
                                        String sort) {
        String normalizedKeyword = keyword != null ? keyword.trim() : null;
        String normalizedProvince = province != null ? province.trim() : null;
        String normalizedProductCategory = productCategory != null ? productCategory.trim() : null;
        String normalizedCertificationStatus = certificationStatus != null ? certificationStatus.trim() : null;
        Pageable pageable = PageRequest.of(page, size, resolveSort(sort));

        Page<ProductListing> results = listingRepository.findAll(
                ProductListingSpecification.searchListings(
                        normalizedKeyword,
                        minPrice,
                        maxPrice,
                        normalizedProvince,
                        normalizedProductCategory,
                        normalizedCertificationStatus
                ),
                pageable
        );

        return results.map(productListingService::toResponse);
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",", 2);
        String sortField = parts[0].trim();
        String direction = parts.length > 1 ? parts[1].trim().toLowerCase() : "desc";

        List<String> allowedFields = List.of("createdAt", "price", "title", "quantityAvailable");
        if (!allowedFields.contains(sortField)) {
            throw new IllegalArgumentException("sort chỉ hỗ trợ createdAt, price, title hoặc quantityAvailable");
        }

        Sort.Direction sortDirection = "asc".equals(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(sortDirection, sortField);
    }
}
