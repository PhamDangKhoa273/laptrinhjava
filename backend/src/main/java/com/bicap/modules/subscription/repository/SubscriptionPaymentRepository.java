package com.bicap.modules.subscription.repository;

import com.bicap.modules.subscription.entity.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {
    boolean existsByTransactionRef(String transactionRef);
    boolean existsByGatewayTransactionId(String gatewayTransactionId);
    boolean existsByIdempotencyKey(String idempotencyKey);
    boolean existsByFarmSubscriptionSubscriptionIdAndPaymentStatusIgnoreCase(Long subscriptionId, String paymentStatus);
    Optional<SubscriptionPayment> findFirstByFarmSubscriptionSubscriptionIdAndPaymentStatusIgnoreCaseOrderByPaymentIdDesc(Long subscriptionId, String paymentStatus);
    Optional<SubscriptionPayment> findByGatewayTransactionId(String gatewayTransactionId);
    Optional<SubscriptionPayment> findByTransactionRef(String transactionRef);
    Optional<SubscriptionPayment> findFirstByGatewayTransactionIdIgnoreCase(String gatewayTransactionId);
    Optional<SubscriptionPayment> findFirstByTransactionRefIgnoreCaseOrderByPaymentIdDesc(String transactionRef);
    List<SubscriptionPayment> findByFarmSubscriptionFarmOwnerUserUserIdOrderByPaidAtDesc(Long userId);
}
