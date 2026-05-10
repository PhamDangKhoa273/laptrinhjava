package com.bicap.modules.common.announcement.controller;

import com.bicap.core.dto.ApiResponse;
import com.bicap.modules.common.announcement.dto.CreateAnnouncementRequest;
import com.bicap.modules.common.announcement.dto.SystemAnnouncementResponse;
import com.bicap.modules.common.announcement.dto.PublicAnnouncementFeedItemResponse;
import com.bicap.modules.common.announcement.dto.UpsertSystemAnnouncementRequest;
import com.bicap.modules.common.announcement.service.SystemAnnouncementService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/announcements")
@CrossOrigin(origins = "http://localhost:3000")
public class SystemAnnouncementController {

    private final SystemAnnouncementService service;

    public SystemAnnouncementController(SystemAnnouncementService service) {
        this.service = service;
    }

    @GetMapping("/feed")
    public ApiResponse<List<PublicAnnouncementFeedItemResponse>> feed() {
        return ApiResponse.success(service.getPublicFeed());
    }

    @GetMapping("/active")
    public ApiResponse<SystemAnnouncementResponse> getActive() {
        return ApiResponse.success(service.getActive());
    }

    @PutMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SystemAnnouncementResponse> upsert(@Valid @RequestBody UpsertSystemAnnouncementRequest request) {
        return ApiResponse.success("Cap nhat thong bao he thong thanh cong", service.upsert(request));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<SystemAnnouncementResponse>> adminList() {
        return ApiResponse.success(service.getAllForAdmin());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SystemAnnouncementResponse> create(@Valid @RequestBody CreateAnnouncementRequest request) {
        return ApiResponse.success("Tao thong bao thanh cong", service.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<SystemAnnouncementResponse> update(@PathVariable Long id, @Valid @RequestBody CreateAnnouncementRequest request) {
        return ApiResponse.success("Cap nhat thong bao thanh cong", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Xoa thong bao thanh cong", null);
    }
}
