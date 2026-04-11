package com.bicap.modules.listing.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.listing.dto.CreateListingRequest;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.dto.UpdateListingRequest;
import com.bicap.modules.listing.service.ProductListingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
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
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getPublicListings() {
        List<ListingResponse> listings = listingService.getPublicListings();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách listing thành công", listings));
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
            @RequestBody UpdateListingRequest request) {
        ListingResponse response = listingService.updateListing(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật listing thành công", response));
    }
}
