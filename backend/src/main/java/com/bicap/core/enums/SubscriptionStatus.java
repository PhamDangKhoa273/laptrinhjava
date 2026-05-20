package com.bicap.core.enums;

import java.util.Arrays;
import java.util.List;

/**
 * Canonical values for {@code FarmSubscription.subscriptionStatus}.
 * <p>
 * Aligns with state machine STM-SUB defined in
 * {@code docs/02-domain/state-machines/subscription.md}.
 * <p>
 * Stored as VARCHAR in DB (column {@code farm_subscriptions.subscription_status}).
 * Use {@link #isValid(String)} to validate.
 */
public enum SubscriptionStatus {
    /** Purchased but payment callback not received yet (synonym of doc PENDING_PAYMENT). */
    PENDING,
    /** Paid, write actions allowed. */
    ACTIVE,
    /** Within 7 days of expiry; warning notifications sent (STM-SUB-T03). */
    EXPIRING_SOON,
    /** Past expiry date but still within renewal grace window (STM-SUB-T04). */
    GRACE_PERIOD,
    /** Past grace; write actions blocked but data preserved (STM-SUB-T05, BR-SUB-060). */
    EXPIRED,
    /** Manually cancelled (STM-SUB-T07). */
    CANCELLED;

    private static final List<String> ALL = Arrays.stream(values()).map(Enum::name).toList();

    public static boolean isValid(String value) {
        if (value == null) return false;
        return ALL.contains(value.trim().toUpperCase());
    }
}
