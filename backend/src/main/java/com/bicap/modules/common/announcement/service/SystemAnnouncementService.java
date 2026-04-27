package com.bicap.modules.common.announcement.service;

import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
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
            fallback.setContentHtml(AnnouncementHtmlSanitizer.sanitize("<p>BICAP</p><p>CHÚC BẠN</p><p>MỘT NGÀY VUI VẺ 😊</p>"));
            fallback.setActive(true);
            return toResponse(fallback);
        });
    }

    @Transactional
    public SystemAnnouncementResponse upsert(UpsertSystemAnnouncementRequest request) {
        User currentUser = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại"));

        String sanitizedHtml = AnnouncementHtmlSanitizer.sanitize(request.getContentHtml());
        SystemAnnouncement announcement = repository.findFirstByActiveTrueOrderByUpdatedAtDesc().orElseGet(SystemAnnouncement::new);
        announcement.setTitle(sanitizedHtml.length() > 80 ? sanitizedHtml.substring(0, 80) : sanitizedHtml.trim());
        announcement.setSummary(sanitizedHtml.length() > 160 ? sanitizedHtml.substring(0, 160) : sanitizedHtml.trim());
        announcement.setContentHtml(sanitizedHtml);
        announcement.setCategory("ANNOUNCEMENT");
        announcement.setPinned(true);
        announcement.setPublishAt(java.time.LocalDateTime.now());
        announcement.setExpireAt(null);
        announcement.setActive(true);
        announcement.setCreatedByUser(currentUser);
        CreateNotificationRequest notification = new CreateNotificationRequest();
        notification.setRecipientRole("ADMIN");
        notification.setTitle("Bài announcement mới");
        notification.setMessage(sanitizedHtml);
        notification.setNotificationType("ANNOUNCEMENT_PUBLISHED");
        notification.setTargetType("ANNOUNCEMENT");
        notificationService.create(notification);
        return toResponse(repository.save(announcement));
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
