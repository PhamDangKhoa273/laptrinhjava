package com.bicap.modules.subscription.repository;

import com.bicap.modules.subscription.entity.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {
    boolean existsByTransactionRef(String transactionRef);
}
