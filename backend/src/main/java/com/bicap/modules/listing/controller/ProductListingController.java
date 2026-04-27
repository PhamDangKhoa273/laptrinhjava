package com.bicap.modules.listing.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.core.dto.PagedResponse;
import com.bicap.modules.listing.dto.CreateListingRequest;
import com.bicap.modules.listing.dto.ListingRegistrationRequestDto;
import com.bicap.modules.listing.dto.ListingRegistrationResponse;
import com.bicap.modules.listing.dto.ListingResponse;
import com.bicap.modules.listing.dto.ReviewListingRegistrationRequest;
import com.bicap.modules.listing.dto.UpdateListingRequest;
import com.bicap.modules.listing.service.ProductListingService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/listings")
public class ProductListingController {

    private final ProductListingService listingService;

    public ProductListingController(ProductListingService listingService) {
        this.listingService = listingService;
    }

    @PostMapping
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(@Valid @RequestBody CreateListingRequest request) {
        ListingResponse response = listingService.createListing(request);
        return ResponseEntity.ok(ApiResponse.success("Tao listing thanh cong", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> getPublicListings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        if (page < 0) {
            throw new IllegalArgumentException("page khong duoc nho hon 0");
        }
        if (size < 1 || size > 100) {
            throw new IllegalArgumentException("size phai nam trong khoang 1 den 100");
        }

        Page<ListingResponse> listings = listingService.getPublicListings(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach listing thanh cong", PagedResponse.of(listings.getContent(), listings.getNumber(), listings.getSize(), listings.getTotalElements(), listings.getTotalPages(), sort)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ListingResponse>>> searchPublicListings(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String province,
            @RequestParam(required = false) String certification,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate harvestFrom,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate harvestTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        Page<ListingResponse> listings = listingService.searchPublicListings(keyword, province, certification, availableOnly, verifiedOnly, harvestFrom, harvestTo, page, size, sort);
        return ResponseEntity.ok(ApiResponse.success("Tim listing cong khai thanh cong", PagedResponse.of(listings.getContent(), listings.getNumber(), listings.getSize(), listings.getTotalElements(), listings.getTotalPages(), sort)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> getListingById(@PathVariable Long id) {
        ListingResponse response = listingService.getListingById(id);
        return ResponseEntity.ok(ApiResponse.success("Lay chi tiet listing thanh cong", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getMyListings() {
        List<ListingResponse> listings = listingService.getMyListings();
        return ResponseEntity.ok(ApiResponse.success("Lay danh sach listing cua toi thanh cong", listings));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<ListingRegistrationResponse>> submitListingRegistration(@PathVariable Long id, @Valid @RequestBody ListingRegistrationRequestDto request) {
        return ResponseEntity.ok(ApiResponse.success("Gui yeu cau duyet listing thanh cong", listingService.submitRegistration(id, request)));
    }

    @GetMapping("/registrations/my")
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<List<ListingRegistrationResponse>>> getMyRegistrationRequests() {
        return ResponseEntity.ok(ApiResponse.success(listingService.getMyRegistrationRequests()));
    }

    @GetMapping("/registrations/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ListingRegistrationResponse>>> getPendingRegistrationRequests() {
        return ResponseEntity.ok(ApiResponse.success(listingService.getPendingRegistrationRequests()));
    }

    @PatchMapping("/registrations/{registrationId}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListingRegistrationResponse>> reviewRegistration(@PathVariable Long registrationId, @Valid @RequestBody ReviewListingRegistrationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Duyet listing thanh cong", listingService.reviewRegistration(registrationId, request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FARM')")
    public ResponseEntity<ApiResponse<ListingResponse>> updateListing(@PathVariable Long id, @Valid @RequestBody UpdateListingRequest request) {
        ListingResponse response = listingService.updateListing(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cap nhat listing thanh cong", response));
    }
}
