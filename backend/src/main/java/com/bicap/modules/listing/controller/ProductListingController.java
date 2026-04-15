package com.bicap.modules.listing.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.listing.dto.CreateListingRequest;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.dto.UpdateListingRequest;
import com.bicap.modules.listing.service.ProductListingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1/listings")
public class ProductListingController {

    private final ProductListingService listingService;

    public ProductListingController(ProductListingService listingService) {
        this.listingService = listingService;
    }

    /**
     * POST /api/v1/listings — Create a new listing (FARM only, from own batches)
     */
    @PostMapping
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(
            @Valid @RequestBody CreateListingRequest request) {
        ListingResponse response = listingService.createListing(request);
        return ResponseEntity.ok(ApiResponse.success("Tạo listing thành công", response));
    }

    /**
     * GET /api/v1/listings — Public marketplace listings (ACTIVE only)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        if (page < 0) {
            throw new IllegalArgumentException("page không được nhỏ hơn 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size phải nằm trong khoảng 1 đến 100");
        }

        Page<ListingResponse> listings = listingService.getPublicListings(page, size, sort);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", listings.getContent());
        payload.put("page", listings.getNumber());
        payload.put("size", listings.getSize());
        payload.put("totalItems", listings.getTotalElements());
        payload.put("totalPages", listings.getTotalPages());
        payload.put("sort", sort);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách listing thành công", payload));
    }

    /**
     * GET /api/v1/listings/{id} — Get listing detail
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> getListingById(@PathVariable Long id) {
        ListingResponse response = listingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết listing thành công", response));
    }

    /**
     * GET /api/v1/listings/my — Get listings owned by current farm user
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getMyListings() {
        List<ListingResponse> listings = listingService.getMyListings();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách listing của tôi thành công", listings));
    }

    /**
     * PUT /api/v1/listings/{id} — Update listing (price, description, status)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<ListingResponse>> updateListing(
            @PathVariable Long id,
            @Valid @RequestBody UpdateListingRequest request) {
        ListingResponse response = listingService.updateListing(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật listing thành công", response));
    }
}
