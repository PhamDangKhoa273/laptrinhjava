package com.bicap.backend.service;

<<<<<<< Updated upstream:backend/src/main/java/com/bicap/backend/service/FarmSubscriptionService.java
import com.bicap.backend.dto.CreateFarmSubscriptionRequest;
import com.bicap.backend.dto.FarmSubscriptionResponse;
import com.bicap.backend.entity.Farm;
import com.bicap.backend.entity.FarmSubscription;
import com.bicap.backend.entity.ServicePackage;
import com.bicap.backend.entity.User;
import com.bicap.backend.enums.RoleName;
import com.bicap.backend.exception.BusinessException;
import com.bicap.backend.repository.FarmRepository;
import com.bicap.backend.repository.FarmSubscriptionRepository;
import com.bicap.backend.repository.ServicePackageRepository;
import com.bicap.backend.repository.UserRepository;
=======
import com.bicap.modules.subscription.dto.CreateFarmSubscriptionRequest;
import com.bicap.modules.subscription.dto.FarmSubscriptionResponse;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.entity.ServicePackage;
import com.bicap.core.enums.RoleName;
import com.bicap.core.exception.BusinessException;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.subscription.repository.ServicePackageRepository;
>>>>>>> Stashed changes:backend/src/main/java/com/bicap/modules/subscription/service/FarmSubscriptionService.java
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmSubscriptionService {

    private final FarmSubscriptionRepository farmSubscriptionRepository;
    private final FarmRepository farmRepository;
    private final ServicePackageRepository servicePackageRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Transactional
    public FarmSubscriptionResponse create(CreateFarmSubscriptionRequest request, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        Farm farm = farmRepository.findByOwnerUserUserId(currentUserId)
                .orElseThrow(() -> new BusinessException("User hiá»‡n táº¡i chÆ°a cÃ³ farm"));

        if (!userService.hasRole(currentUser, RoleName.FARM) && !userService.hasRole(currentUser, RoleName.ADMIN)) {
            throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n Ä‘Äƒng kÃ½ gÃ³i");
        }

        ServicePackage servicePackage = servicePackageRepository.findById(request.getPackageId())
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y gÃ³i dá»‹ch vá»¥"));

        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : LocalDate.now();
        LocalDate endDate = startDate.plusDays(servicePackage.getDurationDays());

        FarmSubscription subscription = new FarmSubscription();
        subscription.setFarm(farm);
        subscription.setServicePackage(servicePackage);
        subscription.setSubscribedByUser(currentUser);
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        subscription.setSubscriptionStatus("PENDING");

        return toResponse(farmSubscriptionRepository.save(subscription));
    }

    public FarmSubscriptionResponse getById(Long subscriptionId, Long currentUserId) {
        FarmSubscription subscription = getEntityById(subscriptionId);
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        boolean isAdmin = userService.hasRole(currentUser, RoleName.ADMIN);
        boolean isFarmOwner = subscription.getFarm() != null
                && subscription.getFarm().getOwnerUser() != null
                && subscription.getFarm().getOwnerUser().getUserId().equals(currentUserId);

        if (!isAdmin && !isFarmOwner) {
            throw new BusinessException("Báº¡n khÃ´ng cÃ³ quyá»n xem subscription nÃ y");
        }

        return toResponse(subscription);
    }

    public List<FarmSubscriptionResponse> getMySubscriptions(Long currentUserId) {
        return farmSubscriptionRepository.findByFarmOwnerUserUserId(currentUserId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FarmSubscriptionResponse updateStatus(Long subscriptionId, String subscriptionStatus, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y user hiá»‡n táº¡i"));

        if (!userService.hasRole(currentUser, RoleName.ADMIN)) {
            throw new BusinessException("Chá»‰ ADMIN má»›i Ä‘Æ°á»£c cáº­p nháº­t tráº¡ng thÃ¡i subscription");
        }

        FarmSubscription subscription = getEntityById(subscriptionId);
        subscription.setSubscriptionStatus(subscriptionStatus.trim().toUpperCase());

        return toResponse(farmSubscriptionRepository.save(subscription));
    }

    public FarmSubscription getEntityById(Long subscriptionId) {
        return farmSubscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new BusinessException("KhÃ´ng tÃ¬m tháº¥y farm subscription"));
    }

    private FarmSubscriptionResponse toResponse(FarmSubscription subscription) {
        return FarmSubscriptionResponse.builder()
                .subscriptionId(subscription.getSubscriptionId())
                .farmId(subscription.getFarm() != null ? subscription.getFarm().getFarmId() : null)
                .farmName(subscription.getFarm() != null ? subscription.getFarm().getFarmName() : null)
                .packageId(subscription.getServicePackage() != null ? subscription.getServicePackage().getPackageId() : null)
                .packageCode(subscription.getServicePackage() != null ? subscription.getServicePackage().getPackageCode() : null)
                .packageName(subscription.getServicePackage() != null ? subscription.getServicePackage().getPackageName() : null)
                .subscribedByUserId(subscription.getSubscribedByUser() != null ? subscription.getSubscribedByUser().getUserId() : null)
                .subscribedByFullName(subscription.getSubscribedByUser() != null ? subscription.getSubscribedByUser().getFullName() : null)
                .startDate(subscription.getStartDate())
                .endDate(subscription.getEndDate())
                .subscriptionStatus(subscription.getSubscriptionStatus())
                .build();
    }
}
