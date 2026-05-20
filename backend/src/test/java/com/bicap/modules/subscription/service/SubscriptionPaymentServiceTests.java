package com.bicap.modules.subscription.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.subscription.dto.PaymentGatewayCallbackRequest;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.entity.SubscriptionPayment;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.subscription.repository.SubscriptionPaymentRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionPaymentServiceTests {

    @Mock private SubscriptionPaymentRepository subscriptionPaymentRepository;
    @Mock private FarmSubscriptionRepository farmSubscriptionRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserService userService;
    @Mock private AuditLogService auditLogService;

    @InjectMocks private SubscriptionPaymentService service;

    @Test
    void verifyGatewayCallback_shouldActivateOnlyWithValidHmac() {
        ReflectionTestUtils.setField(service, "gatewaySecret", "secret-123");

        User user = new User();
        user.setUserId(1L);
        user.setFullName("Farmer");
        Farm farm = new Farm();
        farm.setFarmId(2L);
        farm.setOwnerUser(user);
        FarmSubscription sub = new FarmSubscription();
        sub.setSubscriptionId(9L);
        sub.setFarm(farm);
        sub.setStartDate(LocalDate.now());

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setFarmSubscription(sub);
        payment.setAmount(BigDecimal.valueOf(100));
        payment.setCurrency("VND");
        payment.setTransactionRef("TX-1");
        payment.setPaymentStatus("PENDING");
        payment.setPaidAt(LocalDateTime.now());

        when(subscriptionPaymentRepository.findAll()).thenReturn(java.util.List.of(payment));
        when(subscriptionPaymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(farmSubscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentGatewayCallbackRequest req = new PaymentGatewayCallbackRequest();
        req.setSubscriptionId(9L);
        req.setTransactionRef("TX-1");
        req.setGatewayTransactionId("GW-1");
        req.setCurrency("VND");
        req.setAmount(BigDecimal.valueOf(100));
        req.setStatus("SUCCESS");
        req.setSignature(sign("secret-123", "9|TX-1|GW-1|100|VND|SUCCESS"));

        assertEquals("PAID", service.verifyGatewayCallback(req).getPaymentStatus());
        assertEquals("ACTIVE", sub.getSubscriptionStatus());
    }

    @Test
    void verifyGatewayCallback_shouldKeepFutureQueuedSubscriptionPendingAfterPayment() {
        ReflectionTestUtils.setField(service, "gatewaySecret", "secret-123");

        User user = new User();
        user.setUserId(1L);
        user.setFullName("Farmer");
        Farm farm = new Farm();
        farm.setFarmId(2L);
        farm.setOwnerUser(user);
        FarmSubscription sub = new FarmSubscription();
        sub.setSubscriptionId(10L);
        sub.setFarm(farm);
        sub.setStartDate(LocalDate.now().plusDays(5));
        sub.setSubscriptionStatus("PENDING");

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setFarmSubscription(sub);
        payment.setAmount(BigDecimal.valueOf(200));
        payment.setCurrency("VND");
        payment.setTransactionRef("TX-2");
        payment.setPaymentStatus("PENDING");
        payment.setPaidAt(LocalDateTime.now());

        when(subscriptionPaymentRepository.findAll()).thenReturn(java.util.List.of(payment));
        when(subscriptionPaymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(farmSubscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PaymentGatewayCallbackRequest req = new PaymentGatewayCallbackRequest();
        req.setSubscriptionId(10L);
        req.setTransactionRef("TX-2");
        req.setGatewayTransactionId("GW-2");
        req.setCurrency("VND");
        req.setAmount(BigDecimal.valueOf(200));
        req.setStatus("SUCCESS");
        req.setSignature(sign("secret-123", "10|TX-2|GW-2|200|VND|SUCCESS"));

        assertEquals("PAID", service.verifyGatewayCallback(req).getPaymentStatus());
        assertEquals("PENDING", sub.getSubscriptionStatus());
    }

    @Test
    void verifyGatewayCallback_shouldRejectBadSignature() {
        ReflectionTestUtils.setField(service, "gatewaySecret", "secret-123");
        when(subscriptionPaymentRepository.findAll()).thenReturn(java.util.List.of());

        PaymentGatewayCallbackRequest req = new PaymentGatewayCallbackRequest();
        req.setSubscriptionId(9L);
        req.setTransactionRef("TX-1");
        req.setGatewayTransactionId("GW-1");
        req.setCurrency("VND");
        req.setAmount(BigDecimal.valueOf(100));
        req.setStatus("SUCCESS");
        req.setSignature("bad-signature");

        assertThrows(BusinessException.class, () -> service.verifyGatewayCallback(req));
    }

    @Test
    void verifyGatewayCallback_shouldRejectWhenGatewaySecretMissing() {
        ReflectionTestUtils.setField(service, "gatewaySecret", "");

        SubscriptionPayment payment = new SubscriptionPayment();
        FarmSubscription sub = new FarmSubscription();
        sub.setSubscriptionId(9L);
        payment.setFarmSubscription(sub);
        payment.setAmount(BigDecimal.valueOf(100));
        payment.setCurrency("VND");
        payment.setTransactionRef("TX-1");
        payment.setPaymentStatus("PENDING");

        when(subscriptionPaymentRepository.findAll()).thenReturn(java.util.List.of(payment));

        PaymentGatewayCallbackRequest req = new PaymentGatewayCallbackRequest();
        req.setSubscriptionId(9L);
        req.setTransactionRef("TX-1");
        req.setGatewayTransactionId("GW-1");
        req.setCurrency("VND");
        req.setAmount(BigDecimal.valueOf(100));
        req.setStatus("SUCCESS");
        req.setSignature("anything");

        assertThrows(BusinessException.class, () -> service.verifyGatewayCallback(req));
    }

    @Test
    void verifyGatewayCallback_shouldRejectDuplicateGatewayIdWithTamperedPayload() {
        ReflectionTestUtils.setField(service, "gatewaySecret", "secret-123");

        User user = new User();
        user.setUserId(1L);
        Farm farm = new Farm();
        farm.setFarmId(2L);
        farm.setOwnerUser(user);
        FarmSubscription sub = new FarmSubscription();
        sub.setSubscriptionId(9L);
        sub.setFarm(farm);

        SubscriptionPayment existing = new SubscriptionPayment();
        existing.setPaymentId(44L);
        existing.setFarmSubscription(sub);
        existing.setAmount(BigDecimal.valueOf(100));
        existing.setCurrency("VND");
        existing.setTransactionRef("TX-1");
        existing.setGatewayTransactionId("GW-1");
        existing.setPaymentStatus("PAID");
        existing.setIdempotencyKey("GW-1");

        when(subscriptionPaymentRepository.existsByIdempotencyKey("GW-1")).thenReturn(true);
        when(subscriptionPaymentRepository.findByGatewayTransactionId("GW-1")).thenReturn(java.util.Optional.of(existing));

        PaymentGatewayCallbackRequest req = new PaymentGatewayCallbackRequest();
        req.setSubscriptionId(9L);
        req.setTransactionRef("TX-1");
        req.setGatewayTransactionId("GW-1");
        req.setCurrency("VND");
        req.setAmount(BigDecimal.valueOf(500));
        req.setStatus("SUCCESS");
        req.setSignature(sign("secret-123", "9|TX-1|GW-1|500|VND|SUCCESS"));

        assertThrows(BusinessException.class, () -> service.verifyGatewayCallback(req));
    }
    @Test
    void create_shouldReturnExistingPendingPaymentForSameSubscription() {
        User user = new User();
        user.setUserId(1L);
        user.setFullName("Farmer");
        Farm farm = new Farm();
        farm.setFarmId(2L);
        farm.setOwnerUser(user);
        FarmSubscription subscription = new FarmSubscription();
        subscription.setSubscriptionId(20L);
        subscription.setFarm(farm);

        SubscriptionPayment existing = new SubscriptionPayment();
        existing.setPaymentId(88L);
        existing.setFarmSubscription(subscription);
        existing.setPayerUser(user);
        existing.setAmount(BigDecimal.valueOf(199000));
        existing.setMethod("BANK_TRANSFER");
        existing.setPaymentStatus("PENDING");
        existing.setTransactionRef("BICAP-SUB20");
        existing.setPaidAt(LocalDateTime.now());

        com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest request = new com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest();
        request.setSubscriptionId(20L);
        request.setAmount(BigDecimal.valueOf(199000));
        request.setMethod("BANK_TRANSFER");
        request.setTransactionRef("BICAP-SUB20-RETRY");

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(user));
        when(farmSubscriptionRepository.findById(20L)).thenReturn(java.util.Optional.of(subscription));
        when(userService.hasRole(user, com.bicap.core.enums.RoleName.ADMIN)).thenReturn(false);
        when(subscriptionPaymentRepository.existsByFarmSubscriptionSubscriptionIdAndPaymentStatusIgnoreCase(20L, "PAID")).thenReturn(false);
        when(subscriptionPaymentRepository.existsByFarmSubscriptionSubscriptionIdAndPaymentStatusIgnoreCase(20L, "PENDING")).thenReturn(true);
        when(subscriptionPaymentRepository.findFirstByFarmSubscriptionSubscriptionIdAndPaymentStatusIgnoreCaseOrderByPaymentIdDesc(20L, "PENDING"))
                .thenReturn(java.util.Optional.of(existing));

        assertEquals(88L, service.create(request, 1L).getPaymentId());
        verify(subscriptionPaymentRepository, never()).save(any());
    }

    @Test
    void create_shouldRejectWhenSubscriptionAlreadyPaid() {
        User user = new User();
        user.setUserId(1L);
        Farm farm = new Farm();
        farm.setFarmId(2L);
        farm.setOwnerUser(user);
        FarmSubscription subscription = new FarmSubscription();
        subscription.setSubscriptionId(21L);
        subscription.setFarm(farm);

        com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest request = new com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest();
        request.setSubscriptionId(21L);
        request.setAmount(BigDecimal.valueOf(199000));
        request.setMethod("BANK_TRANSFER");

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(user));
        when(farmSubscriptionRepository.findById(21L)).thenReturn(java.util.Optional.of(subscription));
        when(userService.hasRole(user, com.bicap.core.enums.RoleName.ADMIN)).thenReturn(false);
        when(subscriptionPaymentRepository.existsByFarmSubscriptionSubscriptionIdAndPaymentStatusIgnoreCase(21L, "PAID")).thenReturn(true);

        assertThrows(BusinessException.class, () -> service.create(request, 1L));
        verify(subscriptionPaymentRepository, never()).save(any());
    }

    @Test
    void adminOverrideActivate_shouldBeIdempotentForPaidPayment() {
        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setPaymentId(77L);
        payment.setPaymentStatus("PAID");

        when(subscriptionPaymentRepository.findById(77L)).thenReturn(java.util.Optional.of(payment));

        assertEquals(77L, service.adminOverrideActivate(77L, 99L, "retry").getPaymentId());
        verify(subscriptionPaymentRepository, never()).save(any());
        verify(farmSubscriptionRepository, never()).save(any());
    }

    private static String sign(String secret, String payload) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
            return java.util.Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
