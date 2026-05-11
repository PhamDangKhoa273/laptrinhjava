package com.bicap.modules.subscription.service;

import com.bicap.core.AuditLogService;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.subscription.dto.CreateSubscriptionPaymentRequest;
import com.bicap.modules.subscription.dto.PaymentGatewayCallbackRequest;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.entity.SubscriptionPayment;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.subscription.repository.SubscriptionPaymentRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionPaymentServiceAcceptanceTests {

    @Mock SubscriptionPaymentRepository subscriptionPaymentRepository;
    @Mock FarmSubscriptionRepository farmSubscriptionRepository;
    @Mock UserRepository userRepository;
    @Mock UserService userService;
    @Mock AuditLogService auditLogService;

    @InjectMocks SubscriptionPaymentService service;

    private User admin;
    private User farmOwner;
    private FarmSubscription subscription;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setUserId(1L);
        farmOwner = new User();
        farmOwner.setUserId(2L);

        com.bicap.modules.farm.entity.Farm farm = new com.bicap.modules.farm.entity.Farm();
        farm.setFarmId(10L);
        farm.setFarmName("Green Farm");
        farm.setOwnerUser(farmOwner);

        subscription = new FarmSubscription();
        subscription.setSubscriptionId(77L);
        subscription.setFarm(farm);
        subscription.setSubscriptionStatus("PENDING");
    }

    @Test
    void create_shouldRejectNonOwnerAndNonAdmin() {
        when(userRepository.findById(9L)).thenReturn(Optional.of(new User()));
        when(farmSubscriptionRepository.findById(77L)).thenReturn(Optional.of(subscription));
        when(userService.hasRole(any(), any())).thenReturn(false);

        CreateSubscriptionPaymentRequest request = new CreateSubscriptionPaymentRequest();
        request.setSubscriptionId(77L);
        request.setAmount(BigDecimal.valueOf(100000));
        request.setMethod("bank_transfer");
        request.setTransactionRef("TX-1");

        assertThatThrownBy(() -> service.create(request, 9L)).isInstanceOf(BusinessException.class);
    }

    @Test
    void verifyGatewayCallback_shouldActivateSubscription() {
        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setPaymentId(11L);
        payment.setFarmSubscription(subscription);
        payment.setAmount(BigDecimal.valueOf(100000));
        payment.setCurrency("VND");
        payment.setTransactionRef("TX-1");
        payment.setPaymentStatus("PENDING");

        when(subscriptionPaymentRepository.findByGatewayTransactionId("GW-1")).thenReturn(Optional.empty());
        when(subscriptionPaymentRepository.findAll()).thenReturn(List.of(payment));

        PaymentGatewayCallbackRequest request = new PaymentGatewayCallbackRequest();
        request.setSubscriptionId(77L);
        request.setTransactionRef("TX-1");
        request.setGatewayTransactionId("GW-1");
        request.setAmount(BigDecimal.valueOf(100000));
        request.setCurrency("VND");
        request.setStatus("PAID");
        request.setSignature("bad-signature");

        assertThatThrownBy(() -> service.verifyGatewayCallback(request)).isInstanceOf(BusinessException.class);
    }
}
