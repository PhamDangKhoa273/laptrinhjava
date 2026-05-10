package com.bicap.modules.common.announcement.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.common.announcement.dto.CreateAnnouncementRequest;
import com.bicap.modules.common.announcement.dto.SystemAnnouncementResponse;
import com.bicap.modules.common.announcement.dto.PublicAnnouncementFeedItemResponse;
import com.bicap.modules.common.announcement.dto.UpsertSystemAnnouncementRequest;
import com.bicap.modules.common.announcement.entity.SystemAnnouncement;
import com.bicap.modules.common.announcement.repository.SystemAnnouncementRepository;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemAnnouncementService {

    private final SystemAnnouncementRepository repository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public SystemAnnouncementService(SystemAnnouncementRepository repository, UserRepository userRepository, NotificationService notificationService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<PublicAnnouncementFeedItemResponse> getPublicFeed() {
        return repository.findAll().stream()
                .filter(SystemAnnouncement::isActive)
                .map(this::toFeedItem)
                .sorted((a, b) -> {
                    int pinned = Boolean.compare(b.isPinned(), a.isPinned());
                    if (pinned != 0) return pinned;
                    return b.getPublishAt() != null && a.getPublishAt() != null ? b.getPublishAt().compareTo(a.getPublishAt()) : 0;
                })
                .toList();
    }

    public SystemAnnouncementResponse getActive() {
        return repository.findFirstByActiveTrueOrderByUpdatedAtDesc().map(this::toResponse).orElseGet(() -> {
            SystemAnnouncement fallback = new SystemAnnouncement();
            fallback.setContentHtml(AnnouncementHtmlSanitizer.sanitize("<p>BICAP</p><p>CHUC BAN</p><p>MOT NGAY VUI VE</p>"));
            fallback.setActive(true);
            return toResponse(fallback);
        });
    }

    public List<SystemAnnouncementResponse> getAllForAdmin() {
        return repository.findAll().stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SystemAnnouncementResponse create(CreateAnnouncementRequest request) {
        User currentUser = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung hien tai"));

        SystemAnnouncement announcement = new SystemAnnouncement();
        announcement.setTitle(request.getTitle().trim());
        announcement.setSummary(request.getSummary() != null ? request.getSummary().trim() : null);
        announcement.setContentHtml(AnnouncementHtmlSanitizer.sanitize(request.getContentHtml()));
        announcement.setCategory(request.getCategory() != null ? request.getCategory() : "ANNOUNCEMENT");
        announcement.setPinned(request.getPinned() != null ? request.getPinned() : false);
        announcement.setPublishAt(LocalDateTime.now());
        announcement.setExpireAt(null);
        announcement.setActive(true);
        announcement.setCreatedByUser(currentUser);

        sendNotification(announcement);
        return toResponse(repository.save(announcement));
    }

    @Transactional
    public SystemAnnouncementResponse update(Long id, CreateAnnouncementRequest request) {
        SystemAnnouncement announcement = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay thong bao"));

        announcement.setTitle(request.getTitle().trim());
        if (request.getSummary() != null) announcement.setSummary(request.getSummary().trim());
        announcement.setContentHtml(AnnouncementHtmlSanitizer.sanitize(request.getContentHtml()));
        if (request.getCategory() != null) announcement.setCategory(request.getCategory());
        if (request.getPinned() != null) announcement.setPinned(request.getPinned());

        return toResponse(repository.save(announcement));
    }

    @Transactional
    public void delete(Long id) {
        SystemAnnouncement announcement = repository.findById(id)
                .orElseThrow(() -> new BusinessException("Khong tim thay thong bao"));
        announcement.setActive(false);
        repository.save(announcement);
    }

    @Transactional
    public SystemAnnouncementResponse upsert(UpsertSystemAnnouncementRequest request) {
        User currentUser = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Khong tim thay nguoi dung hien tai"));

        String sanitizedHtml = AnnouncementHtmlSanitizer.sanitize(request.getContentHtml());
        SystemAnnouncement announcement = repository.findFirstByActiveTrueOrderByUpdatedAtDesc().orElseGet(SystemAnnouncement::new);
        announcement.setTitle(sanitizedHtml.length() > 80 ? sanitizedHtml.substring(0, 80) : sanitizedHtml.trim());
        announcement.setSummary(sanitizedHtml.length() > 160 ? sanitizedHtml.substring(0, 160) : sanitizedHtml.trim());
        announcement.setContentHtml(sanitizedHtml);
        announcement.setCategory("ANNOUNCEMENT");
        announcement.setPinned(true);
        announcement.setPublishAt(LocalDateTime.now());
        announcement.setExpireAt(null);
        announcement.setActive(true);
        announcement.setCreatedByUser(currentUser);
        sendNotification(announcement);
        return toResponse(repository.save(announcement));
    }

    private void sendNotification(SystemAnnouncement announcement) {
        CreateNotificationRequest notification = new CreateNotificationRequest();
        notification.setRecipientRole("ADMIN");
        notification.setTitle("Bai announcement moi");
        notification.setMessage(announcement.getTitle());
        notification.setNotificationType("ANNOUNCEMENT_PUBLISHED");
        notification.setTargetType("ANNOUNCEMENT");
        notificationService.create(notification);
    }

    private PublicAnnouncementFeedItemResponse toFeedItem(SystemAnnouncement announcement) {
        PublicAnnouncementFeedItemResponse response = new PublicAnnouncementFeedItemResponse();
        response.setAnnouncementId(announcement.getAnnouncementId());
        response.setTitle(announcement.getTitle());
        response.setSummary(announcement.getSummary());
        response.setBody(announcement.getContentHtml());
        response.setCategory(announcement.getCategory());
        response.setPinned(announcement.isPinned());
        response.setPublishAt(announcement.getPublishAt());
        response.setExpireAt(announcement.getExpireAt());
        response.setContentType("SYSTEM_ANNOUNCEMENT");
        response.setCreatedByName(announcement.getCreatedByUser() != null ? announcement.getCreatedByUser().getFullName() : null);
        return response;
    }

    private SystemAnnouncementResponse toResponse(SystemAnnouncement announcement) {
        SystemAnnouncementResponse response = new SystemAnnouncementResponse();
        response.setAnnouncementId(announcement.getAnnouncementId());
        response.setTitle(announcement.getTitle());
        response.setSummary(announcement.getSummary());
        response.setContentHtml(AnnouncementHtmlSanitizer.sanitize(announcement.getContentHtml()));
        response.setCategory(announcement.getCategory());
        response.setPinned(announcement.isPinned());
        response.setPublishAt(announcement.getPublishAt());
        response.setExpireAt(announcement.getExpireAt());
        response.setActive(announcement.isActive());
        response.setCreatedByUserId(announcement.getCreatedByUser() != null ? announcement.getCreatedByUser().getUserId() : null);
        response.setCreatedByName(announcement.getCreatedByUser() != null ? announcement.getCreatedByUser().getFullName() : null);
        response.setCreatedAt(announcement.getCreatedAt());
        response.setUpdatedAt(announcement.getUpdatedAt());
        return response;
    }
}
