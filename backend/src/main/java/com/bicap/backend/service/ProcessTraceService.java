package com.bicap.backend.service;

import com.bicap.backend.dto.ProcessTraceItemDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSetMetaData;
import java.util.Collections;
import java.util.List;

@Service
public class ProcessTraceService {

    private final JdbcTemplate jdbcTemplate;

    public ProcessTraceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ProcessTraceItemDto> findProcessesBySeasonId(Long seasonId) {
        for (String sql : candidateQueries()) {
            try {
                List<ProcessTraceItemDto> rows = jdbcTemplate.query(sql, ps -> ps.setLong(1, seasonId), (rs, rowNum) -> {
                    ResultSetMetaData meta = rs.getMetaData();
                    return ProcessTraceItemDto.builder()
                            .processCode(getString(rs, meta, "process_code"))
                            .processName(getString(rs, meta, "process_name"))
                            .stage(getString(rs, meta, "stage"))
                            .status(getString(rs, meta, "process_status", "status"))
                            .processDate(getLocalDate(rs, meta, "process_date", "performed_date", "activity_date"))
                            .operatorName(getString(rs, meta, "operator_name", "performed_by", "worker_name"))
                            .notes(getString(rs, meta, "notes", "description"))
                            .recordedAt(getLocalDateTime(rs, meta, "recorded_at", "created_at", "updated_at"))
                            .build();
                });

                if (!rows.isEmpty()) {
                    return rows;
                }
            } catch (Exception ignored) {
                // TV2 schema có thể chưa merge vào repo này.
            }
        }

        return Collections.emptyList();
    }

    private List<String> candidateQueries() {
        return List.of(
                """
                SELECT
                    fp.process_code AS process_code,
                    fp.process_name AS process_name,
                    fp.stage AS stage,
                    fp.status AS process_status,
                    fp.process_date AS process_date,
                    fp.operator_name AS operator_name,
                    fp.notes AS notes,
                    fp.created_at AS recorded_at
                FROM farming_processes fp
                WHERE fp.season_id = ?
                ORDER BY fp.process_date ASC, fp.created_at ASC
                """,
                """
                SELECT
                    sp.process_code AS process_code,
                    sp.name AS process_name,
                    sp.stage AS stage,
                    sp.status AS process_status,
                    sp.performed_date AS process_date,
                    sp.performed_by AS operator_name,
                    sp.description AS notes,
                    sp.created_at AS recorded_at
                FROM season_processes sp
                WHERE sp.season_id = ?
                ORDER BY sp.performed_date ASC, sp.created_at ASC
                """
        );
    }

    private boolean hasColumn(ResultSetMetaData meta, String name) throws java.sql.SQLException {
        for (int i = 1; i <= meta.getColumnCount(); i++) {
            if (name.equalsIgnoreCase(meta.getColumnLabel(i)) || name.equalsIgnoreCase(meta.getColumnName(i))) {
                return true;
            }
        }
        return false;
    }

    private String getString(java.sql.ResultSet rs, ResultSetMetaData meta, String... names) throws java.sql.SQLException {
        for (String name : names) {
            if (hasColumn(meta, name)) {
                return rs.getString(name);
            }
        }
        return null;
    }

    private java.time.LocalDate getLocalDate(java.sql.ResultSet rs, ResultSetMetaData meta, String... names) throws java.sql.SQLException {
        for (String name : names) {
            if (hasColumn(meta, name)) {
                java.sql.Date date = rs.getDate(name);
                return date != null ? date.toLocalDate() : null;
            }
        }
        return null;
    }

    private java.time.LocalDateTime getLocalDateTime(java.sql.ResultSet rs, ResultSetMetaData meta, String... names) throws java.sql.SQLException {
        for (String name : names) {
            if (hasColumn(meta, name)) {
                java.sql.Timestamp ts = rs.getTimestamp(name);
                return ts != null ? ts.toLocalDateTime() : null;
            }
        }
        return null;
    }
}
