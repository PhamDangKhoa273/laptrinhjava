package com.bicap.modules.common.report.repository;

import com.bicap.modules.common.report.entity.PlatformReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PlatformReportRepository extends JpaRepository<PlatformReport, Long> {
    List<PlatformReport> findByReporterUserUserIdOrderByCreatedAtDesc(Long userId);
    List<PlatformReport> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);
}
