package com.bicap.core.enums;

import java.util.Arrays;
import java.util.List;

/**
 * Canonical values for {@code Farm.approvalStatus}.
 * <p>
 * Stored as VARCHAR in DB (column {@code farms.approval_status}); kept as String in entity for
 * backward compatibility with existing migrations. Use {@link #isValid(String)} to validate.
 * <p>
 * Aligns with state machine STM-FRMAPP defined in
 * {@code docs/02-domain/state-machines/farm-approval.md}.
 * <p>
 * Note: {@code DEACTIVATED} is a legacy value still produced by {@code FarmService.deactivateFarm}
 * and is treated as semantically equivalent to {@link #REVOKED} pending Batch 3 rename.
 */
public enum FarmApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED,
    SUSPENDED,
    REVOKED,
    /** Legacy alias of REVOKED; kept until Batch 3 migration. */
    DEACTIVATED;

    private static final List<String> ALL = Arrays.stream(values()).map(Enum::name).toList();

    public static boolean isValid(String value) {
        if (value == null) return false;
        return ALL.contains(value.trim().toUpperCase());
    }

    public static FarmApprovalStatus fromValue(String value) {
        if (value == null) throw new IllegalArgumentException("approvalStatus must not be null");
        return FarmApprovalStatus.valueOf(value.trim().toUpperCase());
    }
}
