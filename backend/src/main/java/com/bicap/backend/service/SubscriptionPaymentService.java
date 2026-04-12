package com.bicap.backend.service;

<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/service/SubscriptionPaymentService.java
import com.bicap.backend.dto.CreateSubscriptionPaymentRequest;
import com.bicap.backend.dto.SubscriptionPaymentResponse;
import com.bicap.backend.entity.FarmSubscription;
import com.bicap.backend.entity.SubscriptionPayment;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.FarmSubscriptionRepository;
import com.bicap.backend.repository.SubscriptionPaymentRepository;
import com.bicap.backend.repository.UserRepository;
=======
import com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest;
import com.bicap.modules.subscription.dto.SubscriptionPaymentResponse;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.entity.SubscriptionPayment;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.subscription.repository.SubscriptionPaymentRepository;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/subscription/service/SubscriptionPaymentService.java
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SubscriptionPaymentService {

    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final FarmSubscriptionRepository farmSubscriptionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;

    @Transactional
    public SubscriptionPaymentResponse create(CreateSubscriptionPaymentRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        FarmSubscription subscription = farmSubscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y subscription"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isFarmOwner = subscription.getFarm() != null
                && subscription.getFarm().getOwnerUser() != null
                && subscription.getFarm().getOwnerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isFarmOwner) {
            throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n thanh toÃ¡n subscription nÃ y");
        }

        if (request.getTransactionRef() != null
                && !request.getTransactionRef().isBlank()
                && subscriptionPaymentRepository.existsByTransactionRef(request.getTransactionRef().trim())) {
            throw new BusinessException("Duplicate transactionRef");
        }

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setFarmSubscription(subscription);
        payment.setPayerUser(currentUser);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod().trim().toUpperCase());
        payment.setPaymentStatus(normalizeStatus(request.getPaymentStatus()));
        payment.setTransactionRef(
                request.getTransactionRef() != null ? request.getTransactionRef().trim() : null
        );
        payment.setPaidAt(LocalDateTime.now());

        SubscriptionPayment saved = subscriptionPaymentRepository.save(payment);

        auditLogService.log(currentUserId, "CREATE_SUBSCRIPTION_PAYMENT", "SUBSCRIPTION_PAYMENT", saved.getSubscriptionPaymentId());

        return toResponse(saved);
    }

    public SubscriptionPaymentResponse getById(Long paymentId, Long currentUserId) {
        SubscriptionPayment payment = getEntityById(paymentId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isOwner = payment.getFarmSubscription() != null
                && payment.getFarmSubscription().getFarm() != null
                && payment.getFarmSubscription().getFarm().getOwnerUser() != null
                && payment.getFarmSubscription().getFarm().getOwnerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isOwner) {
            throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n xem payment nÃ y");
        }

        return toResponse(payment);
    }

    public SubscriptionPayment getEntityById(Long paymentId) {
        return subscriptionPaymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y subscription payment"));
    }

    private SubscriptionPaymentResponse toResponse(SubscriptionPayment payment) {
        return SubscriptionPaymentResponse.builder()
                .subscriptionPaymentId(payment.getSubscriptionPaymentId())
                .subscriptionId(payment.getFarmSubscription() != null ? payment.getFarmSubscription().getSubscriptionId() : null)
                .payerUserId(payment.getPayerUser() != null ? payment.getPayerUser().getUserId() : null)
                .payerFullName(payment.getPayerUser() != null ? payment.getPayerUser().getFullName() : null)
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .paymentStatus(payment.getPaymentStatus())
                .transactionRef(payment.getTransactionRef())
                .paidAt(payment.getPaidAt())
                .build();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "PENDING";
        }
        return status.trim().toUpperCase();
    }
}
