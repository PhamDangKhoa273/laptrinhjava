package com.bicap.modules.subscription.repository;

import com.bicap.modules.subscription.entity.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {
    boolean existsByTransactionRef(String transactionRef);
    List<SubscriptionPayment> findByFarmSubscriptionFarmOwnerUserUserIdOrderByPaidAtDesc(Long userId);
}
