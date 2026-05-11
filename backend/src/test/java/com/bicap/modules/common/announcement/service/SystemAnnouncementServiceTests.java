package com.bicap.modules.common.announcement.service;

import com.bicap.modules.common.announcement.dto.SystemAnnouncementResponse;
import com.bicap.modules.common.announcement.dto.UpsertSystemAnnouncementRequest;
import com.bicap.modules.common.announcement.entity.SystemAnnouncement;
import com.bicap.modules.common.announcement.repository.SystemAnnouncementRepository;
import com.bicap.modules.common.notification.service.NotificationService;
import com.bicap.core.security.CustomUserPrincipal;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SystemAnnouncementServiceTests {

    @Mock private SystemAnnouncementRepository repository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private SystemAnnouncementService service;

    @Test
    void upsert_shouldSanitizeMaliciousHtmlBeforePersistingAndReturning() {
        User user = new User();
        ReflectionTestUtils.setField(user, "userId", 7L);
        user.setFullName("Admin");

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(new CustomUserPrincipal(7L, "admin@example.com", "x", "ACTIVE", java.util.List.of()), null));
        when(repository.findFirstByActiveTrueOrderByUpdatedAtDesc()).thenReturn(Optional.empty());
        when(repository.save(org.mockito.ArgumentMatchers.any(SystemAnnouncement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpsertSystemAnnouncementRequest request = new UpsertSystemAnnouncementRequest();
        request.setContentHtml("<p onclick=\"alert(1)\">Hi<script>alert(2)</script><a href=\"javascript:alert(3)\" target=\"_blank\">click</a><img src=x onerror=alert(4)></p>");

        SystemAnnouncementResponse response = service.upsert(request);

        ArgumentCaptor<SystemAnnouncement> captor = ArgumentCaptor.forClass(SystemAnnouncement.class);
        verify(repository).save(captor.capture());
        String savedHtml = captor.getValue().getContentHtml();

        assertThat(savedHtml).doesNotContain("script", "onclick", "onerror", "javascript:");
        assertThat(response.getContentHtml()).isEqualTo(savedHtml);
    }
}
