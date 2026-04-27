package com.bicap.modules.content.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.content.dto.CreateEducationalContentRequest;
import com.bicap.modules.content.dto.EducationalContentResponse;
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
        return ApiResponse.success("Tạo nội dung thành công", educationalContentService.create(request));
    }

    @GetMapping
    public ApiResponse<List<EducationalContentResponse>> getPublishedContents() {
        return ApiResponse.success(educationalContentService.getPublishedContents());
    }

    @GetMapping("/{slug}")
    public ApiResponse<EducationalContentResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.success(educationalContentService.getBySlug(slug));
    }
}
