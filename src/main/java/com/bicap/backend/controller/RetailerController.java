package com.bicap.backend.controller;

import com.bicap.backend.dto.response.ApiResponse;
import com.bicap.backend.entity.Retailer;
import com.bicap.backend.service.RetailerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/retailers")
@RequiredArgsConstructor
public class RetailerController {

    private final RetailerService retailerService;

    @PostMapping
    public ApiResponse<Retailer> create(@RequestBody Retailer retailer,
                                        @RequestParam Long userId) {
        return ApiResponse.success("Tạo retailer thành công",
                retailerService.create(retailer, userId));
    }

    @GetMapping
    public ApiResponse<?> getAll() {
        return ApiResponse.success(retailerService.getAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Retailer> getById(@PathVariable Long id) {
        return ApiResponse.success(retailerService.getById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Retailer> update(@PathVariable Long id,
                                        @RequestBody Retailer request) {
        return ApiResponse.success("Cập nhật retailer",
                retailerService.update(id, request));
    }
}