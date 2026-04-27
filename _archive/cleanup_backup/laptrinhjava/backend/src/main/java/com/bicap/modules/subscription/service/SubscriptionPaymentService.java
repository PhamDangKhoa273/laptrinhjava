package com.bicap.modules.subscription.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.subscription.dto.PaymentGatewayCallbackRequest;
import com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest;
import com.bicap.modules.subscription.dto.SubscriptionPaymentResponse;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.entity.SubscriptionPayment;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.subscription.repository.SubscriptionPaymentRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Objects;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubscriptionPaymentService {
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final FarmSubscriptionRepository farmSubscriptionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final AuditLogService auditLogService;
    @org.springframework.beans.factory.annotation.Value("${app.subscription.gateway-secret:change-me}")
    private String gatewaySecret;

    @Transactional
    public SubscriptionPaymentResponse create(CreateSubscriptionPaymentRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));
        FarmSubscription subscription = farmSubscriptionRepository.findById(request.getSubscriptionId()).orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y subscription"));
        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isFarmOwner = subscription.getFarm() != null && subscription.getFarm().getOwnerUser() != null && subscription.getFarm().getOwnerUser().getUserId().equals(currentUserId);
        if (!isAdmin && !isFarmOwner) throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n thanh toÃ¡n subscription nÃ y");
        String idempotencyKey = normalizeKey(request.getTransactionRef());
        if (idempotencyKey != null && subscriptionPaymentRepository.existsByIdempotencyKey(idempotencyKey)) return toResponse(subscriptionPaymentRepository.findByTransactionRef(idempotencyKey).orElseThrow());
        if (request.getTransactionRef() != null && !request.getTransactionRef().isBlank() && subscriptionPaymentRepository.existsByTransactionRef(request.getTransactionRef().trim())) throw new BusinessException("Duplicate transactionRef");
        SubscriptionPayment payment = new SubscriptionPayment(); payment.setFarmSubscription(subscription); payment.setPayerUser(currentUser); payment.setAmount(request.getAmount()); payment.setMethod(request.getMethod().trim().toUpperCase()); payment.setPaymentStatus("PENDING"); payment.setTransactionRef(request.getTransactionRef() != null ? request.getTransactionRef().trim() : null); payment.setCurrency("VND"); payment.setPaidAt(LocalDateTime.now()); payment.setIdempotencyKey(idempotencyKey); SubscriptionPayment saved = subscriptionPaymentRepository.save(payment); auditLogService.log(currentUserId, "CREATE_SUBSCRIPTION_PAYMENT", "SUBSCRIPTION_PAYMENT", saved.getSubscriptionPaymentId()); return toResponse(saved);
    }

    @Transactional
    public SubscriptionPaymentResponse verifyGatewayCallback(PaymentGatewayCallbackRequest request) {
        String callbackKey = normalizeKey(request.getGatewayTransactionId());
        if (callbackKey != null && subscriptionPaymentRepository.existsByIdempotencyKey(callbackKey)) {
            return subscriptionPaymentRepository.findByGatewayTransactionId(request.getGatewayTransactionId()).map(this::toResponse).orElseThrow(() -> new BusinessException("Duplicate gateway callback"));
        }
        SubscriptionPayment payment = subscriptionPaymentRepository.findByGatewayTransactionId(request.getGatewayTransactionId())
                .orElseGet(() -> subscriptionPaymentRepository.findAll().stream()
                        .filter(p -> p.getTransactionRef() != null && p.getTransactionRef().trim().equalsIgnoreCase(request.getTransactionRef().trim()))
                        .findFirst()
                        .orElseThrow(() -> new BusinessException("Không tìm thấy payment cần verify")));
        if (payment.getGatewayTransactionId() != null && payment.getGatewayTransactionId().equalsIgnoreCase(request.getGatewayTransactionId()) && "PAID".equalsIgnoreCase(payment.getPaymentStatus())) return toResponse(payment);
        if (!Objects.equals(payment.getFarmSubscription().getSubscriptionId(), request.getSubscriptionId())) throw new BusinessException("Subscription mismatch");
        if (payment.getAmount() == null || payment.getAmount().compareTo(request.getAmount()) != 0) throw new BusinessException("Amount mismatch");
        if (payment.getCurrency() != null && !payment.getCurrency().equalsIgnoreCase(request.getCurrency())) throw new BusinessException("Currency mismatch");
        if (!verifySignature(request)) throw new BusinessException("Invalid gateway signature");
        payment.setGatewayTransactionId(request.getGatewayTransactionId().trim());
        payment.setGatewaySignature(request.getSignature().trim());
        payment.setCurrency(request.getCurrency().trim().toUpperCase());
        payment.setPaymentStatus(isSuccess(request.getStatus()) ? "PAID" : "FAILED");
        payment.setPaidAt(LocalDateTime.now());
        payment.setIdempotencyKey(callbackKey);
        SubscriptionPayment saved = saveRetrySafe(payment);
        if ("PAID".equals(saved.getPaymentStatus())) { FarmSubscription subscription = saved.getFarmSubscription(); subscription.setSubscriptionStatus("ACTIVE"); farmSubscriptionRepository.save(subscription); }
        auditLogService.log(null, "PAYMENT_STATE_CHANGE", "SUBSCRIPTION_PAYMENT", saved.getSubscriptionPaymentId(), "status=" + saved.getPaymentStatus());
        return toResponse(saved);
    }

    @Transactional
    public SubscriptionPaymentResponse adminOverrideActivate(Long paymentId, Long adminUserId, String note) {
        SubscriptionPayment payment = getEntityById(paymentId); payment.setPaymentStatus("PAID"); SubscriptionPayment saved = saveRetrySafe(payment); FarmSubscription subscription = saved.getFarmSubscription(); subscription.setSubscriptionStatus("ACTIVE"); farmSubscriptionRepository.save(subscription); auditLogService.log(adminUserId, "ADMIN_OVERRIDE_SUBSCRIPTION_PAYMENT", "SUBSCRIPTION_PAYMENT", saved.getSubscriptionPaymentId()); auditLogService.log(adminUserId, "PAYMENT_STATE_CHANGE", "SUBSCRIPTION_PAYMENT", saved.getSubscriptionPaymentId(), "status=PAID,source=ADMIN_OVERRIDE"); return toResponse(saved);
    }

    public SubscriptionPaymentResponse getById(Long paymentId, Long currentUserId) { SubscriptionPayment payment = getEntityById(paymentId); User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i")); boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN); boolean isOwner = payment.getFarmSubscription() != null && payment.getFarmSubscription().getFarm() != null && payment.getFarmSubscription().getFarm().getOwnerUser() != null && payment.getFarmSubscription().getFarm().getOwnerUser().getUserId().equals(currentUserId); if (!isAdmin && !isOwner) throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n xem payment nÃ y"); return toResponse(payment); }
    public List<SubscriptionPaymentResponse> getMyPayments(Long currentUserId) { return subscriptionPaymentRepository.findByFarmSubscriptionFarmOwnerUserUserIdOrderByPaidAtDesc(currentUserId).stream().map(this::toResponse).toList(); }
    public SubscriptionPayment getEntityById(Long paymentId) { return subscriptionPaymentRepository.findById(paymentId).orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y subscription payment")); }
    private SubscriptionPayment saveRetrySafe(SubscriptionPayment payment) { try { return subscriptionPaymentRepository.save(payment); } catch (OptimisticLockingFailureException ex) { return subscriptionPaymentRepository.findById(payment.getSubscriptionPaymentId()).orElseThrow(); } }
    private String normalizeKey(String key) { return key == null ? null : key.trim().isBlank() ? null : key.trim(); }
    private SubscriptionPaymentResponse toResponse(SubscriptionPayment payment) { return SubscriptionPaymentResponse.builder().subscriptionPaymentId(payment.getSubscriptionPaymentId()).subscriptionId(payment.getFarmSubscription() != null ? payment.getFarmSubscription().getSubscriptionId() : null).farmName(payment.getFarmSubscription() != null && payment.getFarmSubscription().getFarm() != null ? payment.getFarmSubscription().getFarm().getFarmName() : null).payerUserId(payment.getPayerUser() != null ? payment.getPayerUser().getUserId() : null).payerFullName(payment.getPayerUser() != null ? payment.getPayerUser().getFullName() : null).amount(payment.getAmount()).method(payment.getMethod()).paymentStatus(payment.getPaymentStatus()).transactionRef(payment.getTransactionRef()).paidAt(payment.getPaidAt()).build(); }
    private boolean isSuccess(String status) { if (status == null) return false; String s = status.trim().toUpperCase(); return "PAID".equals(s) || "SUCCESS".equals(s) || "VERIFIED".equals(s); }
    private boolean verifySignature(PaymentGatewayCallbackRequest request) { try { String payload = request.getSubscriptionId() + "|" + request.getTransactionRef().trim() + "|" + request.getGatewayTransactionId().trim() + "|" + request.getAmount().toPlainString() + "|" + request.getCurrency().trim().toUpperCase() + "|" + request.getStatus().trim().toUpperCase(); Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(gatewaySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256")); String expected = Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8))); return expected.equals(request.getSignature().trim()); } catch (Exception e) { throw new BusinessException("Không thể verify chữ ký gateway"); } }
}
