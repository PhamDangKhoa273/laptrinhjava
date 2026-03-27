package com.bicap.backend.service;

import com.bicap.backend.dto.CreateSubscriptionPaymentRequest;
import com.bicap.backend.dto.SubscriptionPaymentResponse;
import com.bicap.backend.entity.FarmSubscription;
import com.bicap.backend.entity.SubscriptionPayment;
import com.bicap.backend.entity.User;
import com.bicap.backend.exception.ResourceNotFoundException;
import com.bicap.backend.repository.FarmSubscriptionRepository;
import com.bicap.backend.repository.SubscriptionPaymentRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionPaymentService {

    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final FarmSubscriptionRepository farmSubscriptionRepository;
    private final UserRepository userRepository;

    public SubscriptionPaymentResponse createPayment(CreateSubscriptionPaymentRequest request) {
        FarmSubscription subscription = farmSubscriptionRepository.findById(request.getSubscriptionId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy subscription với id = " + request.getSubscriptionId()));

        User payerUser = userRepository.findById(request.getPayerUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id = " + request.getPayerUserId()));

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setSubscription(subscription);
        payment.setPayerUser(payerUser);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        payment.setPaymentStatus(
                request.getPaymentStatus() == null || request.getPaymentStatus().isBlank()
                        ? "PENDING"
                        : request.getPaymentStatus()
        );
        payment.setTransactionRef(request.getTransactionRef());
        payment.setPaidAt(request.getPaidAt());

        return mapToResponse(subscriptionPaymentRepository.save(payment));
    }

    public SubscriptionPaymentResponse getPaymentById(Long id) {
        SubscriptionPayment payment = subscriptionPaymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy payment với id = " + id));

        return mapToResponse(payment);
    }

    private SubscriptionPaymentResponse mapToResponse(SubscriptionPayment payment) {
        return SubscriptionPaymentResponse.builder()
                .subscriptionPaymentId(payment.getSubscriptionPaymentId())
                .subscriptionId(payment.getSubscription().getSubscriptionId())
                .payerUserId(payment.getPayerUser().getUserId())
                .payerFullName(payment.getPayerUser().getFullName())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .paymentStatus(payment.getPaymentStatus())
                .transactionRef(payment.getTransactionRef())
                .paidAt(payment.getPaidAt())
                .build();
    }
}