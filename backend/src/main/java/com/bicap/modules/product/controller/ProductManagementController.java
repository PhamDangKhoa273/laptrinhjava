package com.bicap.modules.product.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.product.dto.*;
import com.bicap.modules.product.service.ProductManagementService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api/v1")
public class ProductManagementController {

    private final ProductManagementService service;

    public ProductManagementController(ProductManagementService service) {
        this.service = service;
    }

    // ─── CATEGORIES ───────────────────────────────────────────────────────────

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllCategories()));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Tạo chuyên mục thành công", service.createCategory(req)));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(@PathVariable Long id, @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chuyên mục thành công", service.updateCategory(id, req)));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        service.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa chuyên mục", null));
    }

    // ─── PRODUCTS ─────────────────────────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getProducts() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllProducts()));
    }

    @PostMapping("/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Tạo sản phẩm thành công", service.createProduct(req)));
    }

    /**
     * R-FRM-080 — Farm tự đề xuất sản phẩm canh tác mới khi tạo mùa vụ
     * (admin enumerate không xuể catalogue thực tế).
     * Sản phẩm tạo qua endpoint này có status=ACTIVE, admin có thể edit/sort sau.
     */
    @PostMapping("/products/suggest")
    @PreAuthorize("hasAnyRole('FARM','ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> suggestProduct(@Valid @RequestBody ProductRequest req) {
        if (req.getStatus() == null || req.getStatus().isBlank()) {
            req.setStatus("ACTIVE");
        }
        return ResponseEntity.ok(ApiResponse.success("Đã thêm sản phẩm vào catalogue", service.createProduct(req)));
    }

    @PutMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(@PathVariable Long id, @RequestBody ProductRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", service.updateProduct(id, req)));
    }

    @DeleteMapping("/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa sản phẩm", null));
    }
}
