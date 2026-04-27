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
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
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
