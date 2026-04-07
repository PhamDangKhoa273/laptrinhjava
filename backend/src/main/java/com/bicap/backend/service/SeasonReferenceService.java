package com.bicap.backend.service;

import com.bicap.backend.dto.trace.SeasonReferenceDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSetMetaData;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class SeasonReferenceService {

    private final JdbcTemplate jdbcTemplate;

    public SeasonReferenceService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<SeasonReferenceDto> findSeasonReference(Long seasonId, Long productId) {
        for (String sql : candidateQueries()) {
            try {
                List<SeasonReferenceDto> rows = jdbcTemplate.query(sql, ps -> {
                    ps.setLong(1, seasonId);
                    ps.setLong(2, productId);
                }, (rs, rowNum) -> mapRow(rs.getMetaData(), rs, seasonId, productId));

                if (!rows.isEmpty()) {
                    return Optional.of(rows.get(0));
                }
            } catch (Exception ignored) {
                // Schema cá»§a module khÃ¡c cÃ³ thá»ƒ chÆ°a merge; thá»­ query tiáº¿p theo.
            }
        }

        return Optional.empty();
    }

    public boolean isSeasonProductPairValid(Long seasonId, Long productId) {
        return findSeasonReference(seasonId, productId).isPresent();
    }

    private List<String> candidateQueries() {
        return List.of(
                // Contract Æ°u tiÃªn cho team: season gáº¯n product tháº­t báº±ng FK.
                """
                SELECT
                    s.season_id AS season_id,
                    p.product_id AS product_id,
                    COALESCE(s.season_code, CONCAT('SEASON-', s.season_id)) AS season_code,
                    COALESCE(s.season_name, s.name) AS season_name,
                    p.product_code AS product_code,
                    COALESCE(p.product_name, p.name) AS product_name,
                    COALESCE(s.crop_name, s.plant_name, p.product_name, p.name) AS crop_name,
                    f.farm_code AS farm_code,
                    f.farm_name AS farm_name,
                    s.status AS season_status,
                    s.start_date AS start_date,
                    s.expected_end_date AS expected_end_date,
                    FALSE AS derived_product
                FROM farming_seasons s
                JOIN products p ON p.product_id = s.product_id
                LEFT JOIN farms f ON f.farm_id = s.farm_id
                WHERE s.season_id = ? AND p.product_id = ?
                """,
                """
                SELECT
                    s.season_id AS season_id,
                    p.product_id AS product_id,
                    COALESCE(s.season_code, CONCAT('SEASON-', s.season_id)) AS season_code,
                    COALESCE(s.season_name, s.name) AS season_name,
                    p.product_code AS product_code,
                    COALESCE(p.product_name, p.name) AS product_name,
                    COALESCE(s.crop_name, s.plant_name, p.product_name, p.name) AS crop_name,
                    f.farm_code AS farm_code,
                    f.farm_name AS farm_name,
                    s.status AS season_status,
                    s.start_date AS start_date,
                    s.expected_end_date AS expected_end_date,
                    FALSE AS derived_product
                FROM seasons s
                JOIN products p ON p.product_id = s.product_id
                LEFT JOIN farms f ON f.farm_id = s.farm_id
                WHERE s.season_id = ? AND p.product_id = ?
                """,
                // Fallback thá»±c dá»¥ng cho DB hiá»‡n táº¡i: náº¿u TV1 chÆ°a cÃ³ product FK thÃ¬ map product tá»« báº£ng products do TV3/TV5 dÃ¹ng chung.
                """
                SELECT
                    s.season_id AS season_id,
                    p.product_id AS product_id,
                    CONCAT('SEASON-', s.season_id) AS season_code,
                    s.name AS season_name,
                    p.product_code AS product_code,
                    p.name AS product_name,
                    s.plant_name AS crop_name,
                    f.farm_code AS farm_code,
                    f.farm_name AS farm_name,
                    s.status AS season_status,
                    s.start_date AS start_date,
                    s.expected_end_date AS expected_end_date,
                    TRUE AS derived_product
                FROM farming_seasons s
                JOIN products p ON p.product_id = ?
                LEFT JOIN farms f ON f.farm_id = s.farm_id
                WHERE s.season_id = ?
                """
        );
    }

    private SeasonReferenceDto mapRow(ResultSetMetaData meta, java.sql.ResultSet rs, Long seasonId, Long productId) throws java.sql.SQLException {
        return SeasonReferenceDto.builder()
                .seasonId(getLong(rs, meta, "season_id", seasonId))
                .productId(getLong(rs, meta, "product_id", productId))
                .seasonCode(getString(rs, meta, "season_code"))
                .seasonName(getString(rs, meta, "season_name"))
                .productCode(getString(rs, meta, "product_code"))
                .productName(getString(rs, meta, "product_name"))
                .cropName(getString(rs, meta, "crop_name"))
                .farmCode(getString(rs, meta, "farm_code"))
                .farmName(getString(rs, meta, "farm_name"))
                .status(getString(rs, meta, "season_status"))
                .startDate(getLocalDate(rs, meta, "start_date"))
                .expectedEndDate(getLocalDate(rs, meta, "expected_end_date"))
                .derivedProduct(Boolean.TRUE.equals(getBoolean(rs, meta, "derived_product")))
                .build();
    }

    private boolean hasColumn(ResultSetMetaData meta, String name) throws java.sql.SQLException {
        for (int i = 1; i <= meta.getColumnCount(); i++) {
            if (name.equalsIgnoreCase(meta.getColumnLabel(i)) || name.equalsIgnoreCase(meta.getColumnName(i))) {
                return true;
            }
        }
        return false;
    }

    private String getString(java.sql.ResultSet rs, ResultSetMetaData meta, String name) throws java.sql.SQLException {
        return hasColumn(meta, name) ? rs.getString(name) : null;
    }

    private Long getLong(java.sql.ResultSet rs, ResultSetMetaData meta, String name, Long fallback) throws java.sql.SQLException {
        if (!hasColumn(meta, name)) {
            return fallback;
        }
        long value = rs.getLong(name);
        return rs.wasNull() ? fallback : value;
    }

    private Boolean getBoolean(java.sql.ResultSet rs, ResultSetMetaData meta, String name) throws java.sql.SQLException {
        if (!hasColumn(meta, name)) {
            return null;
        }
        boolean value = rs.getBoolean(name);
        return rs.wasNull() ? null : value;
    }

    private LocalDate getLocalDate(java.sql.ResultSet rs, ResultSetMetaData meta, String name) throws java.sql.SQLException {
        if (!hasColumn(meta, name)) {
            return null;
        }
        java.sql.Date date = rs.getDate(name);
        return date != null ? date.toLocalDate() : null;
    }
}

