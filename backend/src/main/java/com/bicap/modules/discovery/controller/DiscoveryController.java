package com.bicap.modules.discovery.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.discovery.service.DiscoveryService;
import com.bicap.modules.listing.dto.ListingResponse;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/search")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    public DiscoveryController(DiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String province,
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

        Page<ListingResponse> results = discoveryService.search(keyword, minPrice, maxPrice, province, page, size, sort);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", results.getContent());
        payload.put("page", results.getNumber());
        payload.put("size", results.getSize());
        payload.put("totalItems", results.getTotalElements());
        payload.put("totalPages", results.getTotalPages());
        payload.put("sort", sort);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm thành công", payload));
    }
}
