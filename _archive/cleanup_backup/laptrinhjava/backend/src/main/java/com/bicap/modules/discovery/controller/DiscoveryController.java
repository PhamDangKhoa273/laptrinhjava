package com.bicap.modules.discovery.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.dto.PagedResponse;
import com.bicap.modules.discovery.service.DiscoveryService;
import com.bicap.modules.listing.dto.ListingResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/search")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    public DiscoveryController(DiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String productCategory,
            @RequestParam(required = false) String certification,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new IllegalArgumentException("minPrice không được lớn hơn maxPrice");
        }
        if (page < 0) {
            throw new IllegalArgumentException("page không được nhỏ hơn 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size phải nằm trong khoảng 1 đến 100");
        }

        Page<ListingResponse> results = discoveryService.search(keyword, minPrice, maxPrice, province, productCategory, certification, page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm thành công", PagedResponse.of(results.getContent(), results.getNumber(), results.getSize(), results.getTotalElements(), results.getTotalPages(), sort)));
    }
}
