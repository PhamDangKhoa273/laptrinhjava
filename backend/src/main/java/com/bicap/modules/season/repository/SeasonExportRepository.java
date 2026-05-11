package com.bicap.modules.season.repository;

import com.bicap.modules.season.entity.SeasonExport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SeasonExportRepository extends JpaRepository<SeasonExport, Long> {
    Optional<SeasonExport> findByTraceCode(String traceCode);
    Optional<SeasonExport> findTopBySeason_SeasonIdOrderByExportedAtDesc(Long seasonId);
    Optional<SeasonExport> findTopBySeason_SeasonIdAndDataHashOrderByExportedAtDesc(Long seasonId, String dataHash);
}
