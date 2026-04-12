package com.bicap.modules.discovery.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.discovery.service.DiscoveryService;
import com.bicap.modules.listing.dto.ListingResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/search")
public class DiscoveryController {

    private final DiscoveryService discoveryService;

    public DiscoveryController(DiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ListingResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String province) {
        
        List<ListingResponse> results = discoveryService.search(keyword, minPrice, maxPrice, province);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm sản phẩm thành công", results));
    }
}
