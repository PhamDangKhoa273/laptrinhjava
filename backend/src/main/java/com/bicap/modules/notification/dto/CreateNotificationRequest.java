package com.bicap.modules.notification.dto;

import com.bicap.core.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO tạo thông báo mới
 * Author: Dinh Khang199
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateNotificationRequest {

    @NotNull(message = "userId không được để trống")
    private Long userId;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không quá 255 ký tự")
    private String title;

    @NotBlank(message = "Nội dung không được để trống")
    private String message;

    @NotNull(message = "Loại thông báo không được để trống")
    private NotificationType type;

    private Long referenceId;

    @Size(max = 100)
    private String referenceType;

    @Size(max = 500)
    private String actionUrl;

    @Size(max = 500)
    private String iconUrl;

    private String metadata;

    private LocalDateTime expiresAt;
}
