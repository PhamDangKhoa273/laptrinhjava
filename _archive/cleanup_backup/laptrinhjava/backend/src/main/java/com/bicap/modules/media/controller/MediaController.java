package com.bicap.modules.media.controller;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.media.entity.MediaFile;
import com.bicap.modules.media.service.MediaStorageService;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaStorageService mediaStorageService;
    private final UserRepository userRepository;

    public MediaController(MediaStorageService mediaStorageService, UserRepository userRepository) {
        this.mediaStorageService = mediaStorageService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}/download")
    public void download(@PathVariable Long id, HttpServletResponse response) throws IOException {
        MediaStorageService.StoredMedia storedMedia = mediaStorageService.getMedia(id);
        MediaFile mediaFile = storedMedia.mediaFile();
        authorize(mediaFile);

        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + sanitize(mediaFile.getOriginalFilename()) + "\"");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setContentType(mediaFile.getContentType());
        response.setContentLengthLong(mediaFile.getFileSize());
        Files.copy(storedMedia.path(), response.getOutputStream());
        response.flushBuffer();
    }

    private void authorize(MediaFile mediaFile) {
        if ("PUBLIC".equalsIgnoreCase(mediaFile.getVisibility())) {
            return;
        }
        Long currentUserId = SecurityUtils.getCurrentUserIdOrNull();
        if (currentUserId == null) {
            throw new BusinessException("Bạn cần đăng nhập để tải file này");
        }
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại"));
        if (!mediaFile.getOwnerUser().getUserId().equals(currentUser.getUserId()) && !currentUser.getEmail().equalsIgnoreCase(mediaFile.getOwnerUser().getEmail())) {
            throw new BusinessException("Không có quyền truy cập file này");
        }
    }

    private String sanitize(String filename) {
        return filename == null ? "file" : filename.replaceAll("[\\r\\n\"]", "_");
    }
}
