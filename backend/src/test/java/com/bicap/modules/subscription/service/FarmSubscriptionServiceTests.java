package com.bicap.modules.subscription.service;

import com.bicap.core.enums.RoleName;
import com.bicap.modules.farm.entity.Farm;
import com.bicap.modules.farm.repository.FarmRepository;
import com.bicap.modules.subscription.dto.CreateFarmSubscriptionRequest;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.entity.ServicePackage;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import com.bicap.modules.subscription.repository.ServicePackageRepository;
import com.bicap.modules.user.entity.User;
import com.bicap.modules.user.repository.UserRepository;
import com.bicap.modules.user.service.UserService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FarmSubscriptionServiceTests {

    @Mock private FarmSubscriptionRepository farmSubscriptionRepository;
    @Mock private FarmRepository farmRepository;
    @Mock private ServicePackageRepository servicePackageRepository;
    @Mock private UserRepository userRepository;
    @Mock private UserService userService;

    @InjectMocks private FarmSubscriptionService service;

    @Test
    void create_shouldStartTodayWhenNoEffectiveSubscriptionExists() {
        TestContext context = arrangeBaseContext();
        when(farmSubscriptionRepository.findByFarmOwnerUserUserId(context.user.getUserId())).thenReturn(List.of());
        when(farmSubscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(request(context.pkg.getPackageId(), null), context.user.getUserId());

        ArgumentCaptor<FarmSubscription> captor = ArgumentCaptor.forClass(FarmSubscription.class);
        verify(farmSubscriptionRepository).save(captor.capture());
        FarmSubscription saved = captor.getValue();
        assertEquals(LocalDate.now(), saved.getStartDate());
        assertEquals(LocalDate.now().plusDays(context.pkg.getDurationDays()), saved.getEndDate());
        assertEquals("PENDING", saved.getSubscriptionStatus());
    }

    @Test
    void create_shouldQueueAfterExistingEffectiveSubscriptionEndDate() {
        TestContext context = arrangeBaseContext();
        FarmSubscription active = existingSubscription("ACTIVE", LocalDate.now().minusDays(2), LocalDate.now().plusDays(5));
        when(farmSubscriptionRepository.findByFarmOwnerUserUserId(context.user.getUserId())).thenReturn(List.of(active));
        when(farmSubscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(request(context.pkg.getPackageId(), LocalDate.now().minusDays(30)), context.user.getUserId());

        ArgumentCaptor<FarmSubscription> captor = ArgumentCaptor.forClass(FarmSubscription.class);
        verify(farmSubscriptionRepository).save(captor.capture());
        FarmSubscription saved = captor.getValue();
        LocalDate expectedStart = active.getEndDate().plusDays(1);
        assertEquals(expectedStart, saved.getStartDate());
        assertEquals(expectedStart.plusDays(context.pkg.getDurationDays()), saved.getEndDate());
    }

    @Test
    void create_shouldQueueAfterLatestEndDateAcrossEffectiveSubscriptions() {
        TestContext context = arrangeBaseContext();
        FarmSubscription active = existingSubscription("ACTIVE", LocalDate.now().minusDays(3), LocalDate.now().plusDays(4));
        FarmSubscription grace = existingSubscription("GRACE_PERIOD", LocalDate.now().minusDays(10), LocalDate.now().plusDays(9));
        FarmSubscription expired = existingSubscription("EXPIRED", LocalDate.now().minusDays(20), LocalDate.now().minusDays(1));
        when(farmSubscriptionRepository.findByFarmOwnerUserUserId(context.user.getUserId())).thenReturn(List.of(active, grace, expired));
        when(farmSubscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.create(request(context.pkg.getPackageId(), null), context.user.getUserId());

        ArgumentCaptor<FarmSubscription> captor = ArgumentCaptor.forClass(FarmSubscription.class);
        verify(farmSubscriptionRepository).save(captor.capture());
        FarmSubscription saved = captor.getValue();
        LocalDate expectedStart = grace.getEndDate().plusDays(1);
        assertEquals(expectedStart, saved.getStartDate());
        assertEquals(expectedStart.plusDays(context.pkg.getDurationDays()), saved.getEndDate());
    }

    private TestContext arrangeBaseContext() {
        User user = new User();
        user.setUserId(11L);
        user.setFullName("Farm Owner");

        Farm farm = new Farm();
        farm.setFarmId(22L);
        farm.setOwnerUser(user);
        farm.setFarmName("Green Farm");

        ServicePackage pkg = new ServicePackage();
        pkg.setPackageId(33L);
        pkg.setPackageCode("PRO");
        pkg.setPackageName("Pro Package");
        pkg.setDurationDays(30);
        pkg.setPrice(BigDecimal.valueOf(500_000));

        when(userRepository.findById(user.getUserId())).thenReturn(Optional.of(user));
        when(farmRepository.findByOwnerUserUserId(user.getUserId())).thenReturn(Optional.of(farm));
        when(userService.hasRole(user, RoleName.FARM)).thenReturn(true);
        when(servicePackageRepository.findById(pkg.getPackageId())).thenReturn(Optional.of(pkg));

        return new TestContext(user, farm, pkg);
    }

    private CreateFarmSubscriptionRequest request(Long packageId, LocalDate startDate) {
        CreateFarmSubscriptionRequest request = new CreateFarmSubscriptionRequest();
        request.setPackageId(packageId);
        request.setStartDate(startDate);
        return request;
    }

    private FarmSubscription existingSubscription(String status, LocalDate startDate, LocalDate endDate) {
        FarmSubscription subscription = new FarmSubscription();
        subscription.setSubscriptionStatus(status);
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        return subscription;
    }

    private record TestContext(User user, Farm farm, ServicePackage pkg) {}
}
