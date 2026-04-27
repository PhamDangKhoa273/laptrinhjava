package com.bicap.modules.media.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.media.config.MediaStorageProperties;
import com.bicap.modules.media.dto.MediaFileResponse;
import com.bicap.modules.media.entity.MediaFile;
import com.bicap.modules.media.repository.MediaFileRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final MediaFileRepository mediaFileRepository;
    private final UserRepository userRepository;
    private final MediaStorageProperties mediaStorageProperties;

    public MediaStorageService(MediaFileRepository mediaFileRepository,
                               UserRepository userRepository,
                               MediaStorageProperties mediaStorageProperties) {
        this.mediaFileRepository = mediaFileRepository;
        this.userRepository = userRepository;
        this.mediaStorageProperties = mediaStorageProperties;
    }

    @Transactional
    public MediaFileResponse storeProof(MultipartFile file, String entityType, Long entityId) {
        validateFile(file);

        User owner = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy người upload file"));

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "proof-file" : file.getOriginalFilename());
        String extension = extractExtension(originalFilename);
        String datedFolder = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String visibility = isPublicTrace(entityType) ? "PUBLIC" : "PRIVATE";
        String storedName = UUID.randomUUID() + (extension.isBlank() ? "" : "." + extension);

        Path uploadRoot = Paths.get(mediaStorageProperties.getUploadDir()).toAbsolutePath().normalize();
        Path entityFolder = uploadRoot.resolve(visibility.toLowerCase()).resolve(entityType.toLowerCase()).resolve(datedFolder);
        Path targetFile = entityFolder.resolve(storedName);

        try {
            Files.createDirectories(entityFolder);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("Không thể lưu file upload");
        }

        MediaFile mediaFile = new MediaFile();
        mediaFile.setOwnerUser(owner);
        mediaFile.setEntityType(entityType.toUpperCase());
        mediaFile.setEntityId(entityId);
        mediaFile.setStoragePath(targetFile.toString());
        mediaFile.setOriginalFilename(originalFilename);
        mediaFile.setContentType(file.getContentType().toLowerCase());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setVisibility(visibility);

        MediaFile saved = mediaFileRepository.save(mediaFile);
        return toResponse(saved, uploadRoot, targetFile);
    }

    @Transactional(readOnly = true)
    public StoredMedia getMedia(Long mediaFileId) {
        MediaFile mediaFile = mediaFileRepository.findById(mediaFileId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy file"));
        return new StoredMedia(mediaFile, Path.of(mediaFile.getStoragePath()));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File upload là bắt buộc");
        }
        if (file.getSize() > mediaStorageProperties.getMaxFileSizeBytes()) {
            throw new BusinessException("File vượt quá dung lượng tối đa cho phép");
        }
        if (file.getContentType() == null || !ALLOWED_CONTENT_TYPES.contains(file.getContentType().toLowerCase())) {
            throw new BusinessException("Chỉ chấp nhận file ảnh JPG, PNG hoặc WEBP");
        }
        validateMagicBytes(file);
    }

    private void validateMagicBytes(MultipartFile file) {
        try (InputStream input = file.getInputStream()) {
            byte[] header = input.readNBytes(12);
            if (header.length < 4) {
                throw new BusinessException("File không hợp lệ");
            }
            boolean jpeg = header[0] == (byte) 0xFF && header[1] == (byte) 0xD8;
            boolean png = header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
            boolean webp = header.length >= 12 && header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                    && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50;
            if (!(jpeg || png || webp)) {
                throw new BusinessException("Chữ ký file không khớp loại file cho phép");
            }
            String sample = new String(header, java.nio.charset.StandardCharsets.ISO_8859_1);
            if (sample.contains("<script") || sample.contains("<?php") || sample.contains("eval(") || sample.contains("onerror=")) {
                throw new BusinessException("File upload có nội dung không an toàn");
            }
        } catch (IOException e) {
            throw new BusinessException("Không thể đọc file upload");
        }
    }

    private boolean isPublicTrace(String entityType) {
        if (entityType == null) {
            return false;
        }
        String normalized = entityType.trim().toUpperCase();
        return normalized.contains("TRACE") || normalized.contains("QR");
    }

    private String extractExtension(String filename) {
        int index = filename.lastIndexOf('.');
        return index >= 0 ? filename.substring(index + 1).toLowerCase() : "";
    }

    private MediaFileResponse toResponse(MediaFile mediaFile, Path uploadRoot, Path targetFile) {
        MediaFileResponse response = new MediaFileResponse();
        response.setMediaFileId(mediaFile.getMediaFileId());
        response.setOriginalFilename(mediaFile.getOriginalFilename());
        response.setContentType(mediaFile.getContentType());
        response.setFileSize(mediaFile.getFileSize());
        response.setEntityType(mediaFile.getEntityType());
        response.setEntityId(mediaFile.getEntityId());
        response.setCreatedAt(mediaFile.getCreatedAt());
        response.setFileUrl(mediaFile.getVisibility().equals("PUBLIC")
                ? "/uploads/public/" + mediaFile.getMediaFileId()
                : "/api/v1/media/" + mediaFile.getMediaFileId() + "/download");
        return response;
    }

    public record StoredMedia(MediaFile mediaFile, Path path) {}
}
