package com.bicap.modules.notification.dto;

import com.bicap.core.enums.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO tìm kiếm thông báo nâng cao
 * Author: Dinh Khang199
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSearchRequest {

    private Long userId;
    private NotificationType type;
    private Boolean isRead;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;

    @Builder.Default
    private int page = 0;

    @Builder.Default
    private int size = 20;
}
