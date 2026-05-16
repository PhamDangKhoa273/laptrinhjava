package com.bicap.modules.subscription.service;

import com.bicap.core.enums.SubscriptionStatus;
import com.bicap.modules.common.notification.service.NotificationDispatcher;
import com.bicap.modules.subscription.entity.FarmSubscription;
import com.bicap.modules.subscription.repository.FarmSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Scheduled lifecycle transitions for {@link FarmSubscription} per state machine STM-SUB
 * defined in {@code docs/02-domain/state-machines/subscription.md}.
 *
 * <p>Three transitions are automated by this job:
 * <ul>
 *   <li>STM-SUB-T03: ACTIVE → EXPIRING_SOON when endDate is within
 *       {@code app.subscription.expiring-soon-days} (default 7) days.</li>
 *   <li>STM-SUB-T04: EXPIRING_SOON → GRACE_PERIOD when endDate is in the past
 *       but within grace window.</li>
 *   <li>STM-SUB-T05: GRACE_PERIOD → EXPIRED when endDate is older than
 *       {@code app.subscription.grace-period-days} (default 7).</li>
 * </ul>
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionLifecycleJob {

    private static final int EXPIRING_SOON_DAYS = 7;
    private static final int GRACE_PERIOD_DAYS = 7;

    private final FarmSubscriptionRepository repository;
    private final NotificationDispatcher notificationDispatcher;

    /** Runs every hour. */
    @Scheduled(cron = "${app.subscription.lifecycle-cron:0 0 * * * *}")
    @Transactional
    public void advanceLifecycle() {
        LocalDate today = LocalDate.now();
        promoteActiveToExpiringSoon(today);
        promoteExpiringSoonToGracePeriod(today);
        promoteGracePeriodToExpired(today);
    }

    /** STM-SUB-T03 */
    void promoteActiveToExpiringSoon(LocalDate today) {
        LocalDate windowEnd = today.plusDays(EXPIRING_SOON_DAYS);
        List<FarmSubscription> candidates = repository
                .findBySubscriptionStatusIgnoreCaseAndEndDateBetween(SubscriptionStatus.ACTIVE.name(), today, windowEnd);
        for (FarmSubscription sub : candidates) {
            sub.setSubscriptionStatus(SubscriptionStatus.EXPIRING_SOON.name());
            repository.save(sub);
            notifyOwner(sub, "Gói dịch vụ sắp hết hạn",
                    "Subscription #" + sub.getSubscriptionId() + " sẽ hết hạn vào " + sub.getEndDate());
            log.info("STM-SUB-T03: subscription {} → EXPIRING_SOON", sub.getSubscriptionId());
        }
    }

    /** STM-SUB-T04 */
    void promoteExpiringSoonToGracePeriod(LocalDate today) {
        List<FarmSubscription> candidates = repository
                .findBySubscriptionStatusIgnoreCaseAndEndDateBefore(SubscriptionStatus.EXPIRING_SOON.name(), today.plusDays(1));
        for (FarmSubscription sub : candidates) {
            if (sub.getEndDate() == null || !sub.getEndDate().isBefore(today)) continue;
            sub.setSubscriptionStatus(SubscriptionStatus.GRACE_PERIOD.name());
            repository.save(sub);
            notifyOwner(sub, "Gói dịch vụ đã hết hạn — đang trong grace period",
                    "Subscription #" + sub.getSubscriptionId() + " đã hết hạn. Bạn có "
                            + GRACE_PERIOD_DAYS + " ngày để gia hạn trước khi bị khóa write actions.");
            log.info("STM-SUB-T04: subscription {} → GRACE_PERIOD", sub.getSubscriptionId());
        }
    }

    /** STM-SUB-T05 */
    void promoteGracePeriodToExpired(LocalDate today) {
        LocalDate threshold = today.minusDays(GRACE_PERIOD_DAYS);
        List<FarmSubscription> candidates = repository
                .findBySubscriptionStatusIgnoreCaseAndEndDateBefore(SubscriptionStatus.GRACE_PERIOD.name(), threshold);
        for (FarmSubscription sub : candidates) {
            sub.setSubscriptionStatus(SubscriptionStatus.EXPIRED.name());
            repository.save(sub);
            notifyOwner(sub, "Gói dịch vụ đã hết hạn",
                    "Subscription #" + sub.getSubscriptionId() + " đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.");
            log.info("STM-SUB-T05: subscription {} → EXPIRED", sub.getSubscriptionId());
        }
    }

    private void notifyOwner(FarmSubscription sub, String title, String message) {
        try {
            if (sub.getFarm() == null || sub.getFarm().getOwnerUser() == null) return;
            notificationDispatcher.send(
                    sub.getFarm().getOwnerUser().getUserId(),
                    null,
                    title,
                    message,
                    "SUBSCRIPTION_LIFECYCLE",
                    "FARM_SUBSCRIPTION",
                    sub.getSubscriptionId());
        } catch (Exception ex) {
            log.warn("Không thể gửi notification subscription {}: {}", sub.getSubscriptionId(), ex.getMessage());
        }
    }
}
