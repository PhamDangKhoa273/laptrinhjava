package com.bicap.modules.common.announcement.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.common.announcement.dto.SystemAnnouncementResponse;
import com.bicap.modules.common.announcement.dto.PublicAnnouncementFeedItemResponse;
import com.bicap.modules.common.announcement.dto.UpsertSystemAnnouncementRequest;
import com.bicap.modules.common.announcement.service.SystemAnnouncementService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/announcements")
@CrossOrigin(origins = "http://localhost:3000")
public class SystemAnnouncementController {

    private final SystemAnnouncementService service;

    public SystemAnnouncementController(SystemAnnouncementService service) {
        this.service = service;
    }

    @GetMapping("/feed")
    public ApiResponse<java.util.List<PublicAnnouncementFeedItemResponse>> feed() {
        return ApiResponse.success(service.getPublicFeed());
    }

    @GetMapping("/active")
    public ApiResponse<SystemAnnouncementResponse> getActive() {
        return ApiResponse.success(service.getActive());
    }

    @PutMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SystemAnnouncementResponse> upsert(@Valid @RequestBody UpsertSystemAnnouncementRequest request) {
        return ApiResponse.success("Cập nhật thông báo hệ thống thành công", service.upsert(request));
    }
}
