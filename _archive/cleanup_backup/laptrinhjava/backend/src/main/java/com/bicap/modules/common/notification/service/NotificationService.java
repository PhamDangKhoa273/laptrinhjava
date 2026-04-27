package com.bicap.modules.common.notification.service;

import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.core.security.SecurityUtils;
import com.bicap.modules.common.notification.dto.CreateNotificationRequest;
import com.bicap.modules.common.notification.dto.NotificationResponse;
import com.bicap.modules.common.notification.entity.Notification;
import com.bicap.modules.common.notification.repository.NotificationRepository;
import com.bicap.modules.contract.repository.FarmRetailerContractRepository;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.order.repository.OrderRepository;
import com.bicap.modules.retailer.repository.RetailerRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bicap.core.security.RedisRateLimitService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class NotificationService {

    private static final int MAX_NOTIFICATIONS_PER_10_MINUTES = 20;

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FarmRepository farmRepository;
    private final RetailerRepository retailerRepository;
    private final OrderRepository orderRepository;
    private final FarmRetailerContractRepository contractRepository;

    private final RedisRateLimitService rateLimitService;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, FarmRepository farmRepository, RetailerRepository retailerRepository, OrderRepository orderRepository, FarmRetailerContractRepository contractRepository, RedisRateLimitService rateLimitService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.farmRepository = farmRepository;
        this.retailerRepository = retailerRepository;
        this.orderRepository = orderRepository;
        this.contractRepository = contractRepository;
        this.rateLimitService = rateLimitService;
    }

    @Transactional
    public NotificationResponse create(CreateNotificationRequest request) {
        User sender = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy người gửi"));
        rateLimitService.checkPerUser("notification:" + sender.getUserId());
        enforceSendRateLimit(sender.getUserId());

        String normalizedRecipientRole = request.getRecipientRole() != null ? request.getRecipientRole().trim() : null;
        if (normalizedRecipientRole != null && normalizedRecipientRole.isBlank()) {
            normalizedRecipientRole = null;
        }
        if ((request.getRecipientUserId() == null && normalizedRecipientRole == null)
                || (request.getRecipientUserId() != null && normalizedRecipientRole != null)) {
            throw new BusinessException("Phải chỉ định đúng một đích nhận: recipientUserId hoặc recipientRole");
        }

        Notification notification = new Notification();
        notification.setSenderUser(sender);

        if (request.getTargetType() != null && request.getTargetId() != null) {
            enforceThreadPermission(sender, normalizedRecipientRole, request.getTargetType(), request.getTargetId(), request.getRecipientUserId());
        } else {
            enforceBroadcastPermission(sender, normalizedRecipientRole, request.getRecipientUserId());
        }

        if (request.getRecipientUserId() != null) {
            User recipient = userRepository.findById(request.getRecipientUserId())
                    .orElseThrow(() -> new BusinessException("Không tìm thấy người nhận"));
            notification.setRecipientUser(recipient);
            notification.setRecipientRole(null);
        } else {
            notification.setRecipientUser(null);
            notification.setRecipientRole(normalizedRecipientRole.toUpperCase());
        }

        notification.setTitle(request.getTitle().trim());
        notification.setMessage(request.getMessage().trim());
        notification.setNotificationType(request.getNotificationType().trim().toUpperCase());
        notification.setTargetType(request.getTargetType() != null ? request.getTargetType().trim().toUpperCase() : null);
        notification.setTargetId(request.getTargetId());
        notification.setRead(false);

        return toResponse(notificationRepository.save(notification));
    }

    private void enforceSendRateLimit(Long senderUserId) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
        long sentRecently = notificationRepository.findAll().stream()
                .filter(n -> n.getSenderUser() != null && senderUserId.equals(n.getSenderUser().getUserId()))
                .filter(n -> n.getCreatedAt() != null && n.getCreatedAt().isAfter(cutoff))
                .count();
        if (sentRecently >= MAX_NOTIFICATIONS_PER_10_MINUTES) {
            throw new BusinessException("Gửi notification quá nhanh, vui lòng thử lại sau");
        }
    }

    private void enforceBroadcastPermission(User sender, String recipientRole, Long recipientUserId) {
        boolean isAdmin = hasRole(sender, RoleName.ADMIN.name());
        boolean isShipping = hasRole(sender, RoleName.SHIPPING_MANAGER.name());

        if (recipientUserId != null) {
            if (!(isAdmin || isShipping)) {
                throw new BusinessException("Chỉ admin hoặc shipping manager được gửi trực tiếp cho user");
            }
            return;
        }

        if (recipientRole == null) {
            throw new BusinessException("Đích nhận không hợp lệ");
        }

        if (isAdmin && ("PUBLIC".equalsIgnoreCase(recipientRole) || "SYSTEM".equalsIgnoreCase(recipientRole) || "ADMIN".equalsIgnoreCase(recipientRole))) {
            return;
        }
        if (isShipping && ("FARM".equalsIgnoreCase(recipientRole) || "RETAILER".equalsIgnoreCase(recipientRole))) {
            return;
        }
        throw new BusinessException("Không có quyền gửi notification đến vai trò này");
    }

    private void enforceThreadPermission(User sender, String recipientRole, String targetType, Long targetId, Long recipientUserId) {
        String normalizedTargetType = targetType.trim().toUpperCase();
        if ("ORDER".equals(normalizedTargetType)) {
            OrderContext ctx = resolveOrderContext(targetId);
            if (hasRole(sender, RoleName.ADMIN.name()) || hasRole(sender, RoleName.SHIPPING_MANAGER.name())) return;
            if (hasRole(sender, RoleName.RETAILER.name()) && ctx.retailerUserId != null && ctx.retailerUserId.equals(sender.getUserId())) {
                if (recipientRole != null && !"FARM".equalsIgnoreCase(recipientRole)) throw new BusinessException("Retailer chỉ được nhắn cho farm trong thread order");
                if (recipientUserId != null && !recipientUserId.equals(ctx.farmUserId)) throw new BusinessException("Người nhận không hợp lệ");
                return;
            }
            if (hasRole(sender, RoleName.FARM.name()) && ctx.farmUserId != null && ctx.farmUserId.equals(sender.getUserId())) {
                if (recipientRole != null && !"RETAILER".equalsIgnoreCase(recipientRole)) throw new BusinessException("Farm chỉ được nhắn cho retailer trong thread order");
                if (recipientUserId != null && !recipientUserId.equals(ctx.retailerUserId)) throw new BusinessException("Người nhận không hợp lệ");
                return;
            }
            throw new BusinessException("Không có quyền gửi trong thread order này");
        }

        if ("CONTRACT".equals(normalizedTargetType)) {
            ContractContext ctx = resolveContractContext(targetId);
            if (hasRole(sender, RoleName.ADMIN.name())) return;
            if (hasRole(sender, RoleName.RETAILER.name()) && ctx.retailerUserId != null && ctx.retailerUserId.equals(sender.getUserId())) {
                if (recipientRole != null && !"FARM".equalsIgnoreCase(recipientRole)) throw new BusinessException("Retailer chỉ được nhắn cho farm trong thread contract");
                if (recipientUserId != null && !recipientUserId.equals(ctx.farmUserId)) throw new BusinessException("Người nhận không hợp lệ");
                return;
            }
            if (hasRole(sender, RoleName.FARM.name()) && ctx.farmUserId != null && ctx.farmUserId.equals(sender.getUserId())) {
                if (recipientRole != null && !"RETAILER".equalsIgnoreCase(recipientRole)) throw new BusinessException("Farm chỉ được nhắn cho retailer trong thread contract");
                if (recipientUserId != null && !recipientUserId.equals(ctx.retailerUserId)) throw new BusinessException("Người nhận không hợp lệ");
                return;
            }
            throw new BusinessException("Không có quyền gửi trong thread contract này");
        }

        throw new BusinessException("targetType không hợp lệ cho thread message");
    }

    private boolean hasRole(User user, String role) {
        return user.getRoles().stream().anyMatch(r -> r.getRoleName().equalsIgnoreCase(role));
    }

    private OrderContext resolveOrderContext(Long orderId) {
        var order = orderRepository.findById(orderId).orElseThrow(() -> new BusinessException("Không tìm thấy order"));
        var retailer = retailerRepository.findById(order.getRetailerId()).orElse(null);
        var farm = farmRepository.findById(order.getFarmId()).orElse(null);
        return new OrderContext(
                retailer != null && retailer.getUser() != null ? retailer.getUser().getUserId() : null,
                farm != null && farm.getOwnerUser() != null ? farm.getOwnerUser().getUserId() : null
        );
    }

    private ContractContext resolveContractContext(Long contractId) {
        var contract = contractRepository.findById(contractId).orElseThrow(() -> new BusinessException("Không tìm thấy contract"));
        var retailer = retailerRepository.findById(contract.getRetailerId()).orElse(null);
        var farm = farmRepository.findById(contract.getFarmId()).orElse(null);
        return new ContractContext(
                retailer != null && retailer.getUser() != null ? retailer.getUser().getUserId() : null,
                farm != null && farm.getOwnerUser() != null ? farm.getOwnerUser().getUserId() : null
        );
    }

    private record OrderContext(Long retailerUserId, Long farmUserId) {}
    private record ContractContext(Long retailerUserId, Long farmUserId) {}

    public List<NotificationResponse> getMyNotifications() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại"));

        List<NotificationResponse> result = new ArrayList<>();
        notificationRepository.findByRecipientUserUserIdOrderByCreatedAtDesc(currentUserId)
                .stream()
                .map(this::toResponse)
                .forEach(result::add);

        currentUser.getRoles().forEach(role -> notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role.getRoleName())
                .stream()
                .map(this::toResponse)
                .forEach(result::add));

        result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return result;
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy người dùng hiện tại"));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("Không tìm thấy notification"));
        boolean ownedByUser = notification.getRecipientUser() != null && notification.getRecipientUser().getUserId().equals(currentUserId);
        boolean roleScoped = notification.getRecipientRole() != null && currentUser.getRoles().stream().anyMatch(r -> r.getRoleName().equalsIgnoreCase(notification.getRecipientRole()));
        if (!ownedByUser && !roleScoped) {
            throw new BusinessException("Bạn không có quyền cập nhật notification này");
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setNotificationId(notification.getNotificationId());
        response.setSenderUserId(notification.getSenderUser() != null ? notification.getSenderUser().getUserId() : null);
        response.setSenderName(notification.getSenderUser() != null ? notification.getSenderUser().getFullName() : null);
        response.setRecipientUserId(notification.getRecipientUser() != null ? notification.getRecipientUser().getUserId() : null);
        response.setRecipientRole(notification.getRecipientRole());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setNotificationType(notification.getNotificationType());
        response.setTargetType(notification.getTargetType());
        response.setTargetId(notification.getTargetId());
        response.setRead(notification.isRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }
}
