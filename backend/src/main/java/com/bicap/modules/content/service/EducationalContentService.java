package com.bicap.modules.content.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.content.dto.CreateEducationalContentRequest;
import com.bicap.modules.content.dto.EducationalContentResponse;
import com.bicap.modules.content.dto.UpdateEducationalContentRequest;
import com.bicap.modules.content.entity.EducationalContent;
import com.bicap.modules.content.repository.EducationalContentRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class EducationalContentService {

    private final EducationalContentRepository educationalContentRepository;
    private final UserRepository userRepository;

    public EducationalContentService(EducationalContentRepository educationalContentRepository,
                                     UserRepository userRepository) {
        this.educationalContentRepository = educationalContentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public EducationalContentResponse create(CreateEducationalContentRequest request) {
        User author = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Khong tim thay tac gia"));

        EducationalContent content = new EducationalContent();
        content.setTitle(request.getTitle().trim());
        content.setSlug(generateUniqueSlug(request.getTitle()));
        content.setSummary(trimToNull(request.getSummary()));
        content.setBody(request.getBody().trim());
        content.setContentType(request.getContentType().trim().toUpperCase());
        content.setMediaUrl(trimToNull(request.getMediaUrl()));
        content.setStatus(trimToDefaultUpper(request.getStatus(), "PUBLISHED"));
        content.setCreatedByUser(author);

        return toResponse(educationalContentRepository.save(content));
    }

    @Transactional
    public EducationalContentResponse update(Long id, UpdateEducationalContentRequest request) {
        EducationalContent content = educationalContentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay noi dung"));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            content.setTitle(request.getTitle().trim());
        }
        if (request.getSummary() != null) {
            content.setSummary(trimToNull(request.getSummary()));
        }
        if (request.getBody() != null && !request.getBody().isBlank()) {
            content.setBody(request.getBody().trim());
        }
        if (request.getContentType() != null && !request.getContentType().isBlank()) {
            content.setContentType(request.getContentType().trim().toUpperCase());
        }
        content.setMediaUrl(trimToNull(request.getMediaUrl()));
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            content.setStatus(request.getStatus().trim().toUpperCase());
        }

        return toResponse(educationalContentRepository.save(content));
    }

    @Transactional
    public void delete(Long id) {
        EducationalContent content = educationalContentRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay noi dung"));
        educationalContentRepository.delete(content);
    }

    public List<EducationalContentResponse> getPublishedContents() {
        return educationalContentRepository.findByStatusOrderByCreatedAtDesc("PUBLISHED")
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EducationalContentResponse> getAllForAdmin() {
        return educationalContentRepository.findAll()
                .stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .map(this::toResponse)
                .toList();
    }

    public EducationalContentResponse getBySlug(String slug) {
        return educationalContentRepository.findBySlug(slug)
                .map(this::toResponse)
                .orElseThrow(() -> new BusinessException("Khong tim thay noi dung"));
    }

    private EducationalContentResponse toResponse(EducationalContent content) {
        EducationalContentResponse response = new EducationalContentResponse();
        response.setContentId(content.getContentId());
        response.setTitle(content.getTitle());
        response.setSlug(content.getSlug());
        response.setSummary(content.getSummary());
        response.setBody(content.getBody());
        response.setContentType(content.getContentType());
        response.setMediaUrl(content.getMediaUrl());
        response.setStatus(content.getStatus());
        response.setCreatedByUserId(content.getCreatedByUser() != null ? content.getCreatedByUser().getUserId() : null);
        response.setCreatedByName(content.getCreatedByUser() != null ? content.getCreatedByUser().getFullName() : null);
        response.setCreatedAt(content.getCreatedAt());
        response.setUpdatedAt(content.getUpdatedAt());
        return response;
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String trimToDefaultUpper(String value, String fallback) {
        String normalized = trimToNull(value);
        return normalized != null ? normalized.toUpperCase() : fallback;
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = Normalizer.normalize(title, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (baseSlug.isBlank()) {
            baseSlug = "content";
        }
        String candidate = baseSlug;
        int index = 2;
        while (educationalContentRepository.existsBySlug(candidate)) {
            candidate = baseSlug + "-" + index;
            index++;
        }
        return candidate;
    }
}
