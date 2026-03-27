package com.bicap.backend.service;

import com.bicap.backend.dto.CreateFarmSubscriptionRequest;
import com.bicap.backend.dto.FarmSubscriptionResponse;
import com.bicap.backend.entity.Farm;
import com.bicap.backend.entity.FarmSubscription;
import com.bicap.backend.entity.ServicePackage;
import com.bicap.backend.entity.User;
import com.bicap.backend.exception.ResourceNotFoundException;
import com.bicap.backend.repository.FarmRepository;
import com.bicap.backend.repository.FarmSubscriptionRepository;
import com.bicap.backend.repository.ServicePackageRepository;
import com.bicap.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FarmSubscriptionService {

    private final FarmSubscriptionRepository farmSubscriptionRepository;
    private final FarmRepository farmRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final UserRepository userRepository;

    public FarmSubscriptionResponse createSubscription(CreateFarmSubscriptionRequest request) {
        Farm farm = farmRepository.findById(request.getFarmId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy farm với id = " + request.getFarmId()));

        ServicePackage servicePackage = servicePackageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy package với id = " + request.getPackageId()));

        User user = userRepository.findById(request.getSubscribedByUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id = " + request.getSubscribedByUserId()));

        FarmSubscription subscription = new FarmSubscription();
        subscription.setFarm(farm);
        subscription.setServicePackage(servicePackage);
        subscription.setSubscribedByUser(user);
        subscription.setStartDate(request.getStartDate());
        subscription.setEndDate(request.getEndDate());
        subscription.setSubscriptionStatus(
                request.getSubscriptionStatus() == null || request.getSubscriptionStatus().isBlank()
                        ? "ACTIVE"
                        : request.getSubscriptionStatus()
        );

        return mapToResponse(farmSubscriptionRepository.save(subscription));
    }

    public FarmSubscriptionResponse getSubscriptionById(Long id) {
        FarmSubscription subscription = farmSubscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy subscription với id = " + id));
        return mapToResponse(subscription);
    }

    private FarmSubscriptionResponse mapToResponse(FarmSubscription subscription) {
        return FarmSubscriptionResponse.builder()
                .subscriptionId(subscription.getSubscriptionId())
                .farmId(subscription.getFarm().getFarmId())
                .farmName(subscription.getFarm().getFarmName())
                .packageId(subscription.getServicePackage().getPackageId())
                .packageName(subscription.getServicePackage().getPackageName())
                .subscribedByUserId(subscription.getSubscribedByUser().getUserId())
                .subscribedByFullName(subscription.getSubscribedByUser().getFullName())
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .subscriptionStatus(subscription.getSubscriptionStatus())
                .build();
    }
}