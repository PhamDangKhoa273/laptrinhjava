package com.bicap.modules.content.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.content.dto.CreateEducationalContentRequest;
import com.bicap.modules.content.dto.EducationalContentResponse;
import com.bicap.modules.content.dto.UpdateEducationalContentRequest;
import com.bicap.modules.content.service.EducationalContentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
@CrossOrigin(origins = "http://localhost:3000")
public class EducationalContentController {

    private final EducationalContentService educationalContentService;

    public EducationalContentController(EducationalContentService educationalContentService) {
        this.educationalContentService = educationalContentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EducationalContentResponse> create(@Valid @RequestBody CreateEducationalContentRequest request) {
        return ApiResponse.success("Tao noi dung thanh cong", educationalContentService.create(request));
    }

    @GetMapping
    public ApiResponse<List<EducationalContentResponse>> getPublishedContents() {
        return ApiResponse.success(educationalContentService.getPublishedContents());
    }

    @GetMapping("/{slug}")
    public ApiResponse<EducationalContentResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.success(educationalContentService.getBySlug(slug));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<EducationalContentResponse>> adminList() {
        return ApiResponse.success(educationalContentService.getAllForAdmin());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<EducationalContentResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateEducationalContentRequest request) {
        return ApiResponse.success("Cap nhat noi dung thanh cong", educationalContentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        educationalContentService.delete(id);
        return ApiResponse.success("Xoa noi dung thanh cong", null);
    }
}
