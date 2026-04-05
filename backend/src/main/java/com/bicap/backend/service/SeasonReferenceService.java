package com.bicap.backend.service;

import com.bicap.backend.dto.SeasonReferenceDto;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSetMetaData;
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
                // Schema của TV1 có thể chưa merge vào repo này; cứ fallback an toàn.
            }
        }

        return Optional.empty();
    }

    public boolean isSeasonProductPairValid(Long seasonId, Long productId) {
        return findSeasonReference(seasonId, productId).isPresent();
    }

    private List<String> candidateQueries() {
        return List.of(
                """
                SELECT
                    s.season_id AS season_id,
                    p.product_id AS product_id,
                    s.season_code AS season_code,
                    s.season_name AS season_name,
                    p.product_code AS product_code,
                    p.product_name AS product_name,
                    s.crop_name AS crop_name,
                    f.farm_code AS farm_code,
                    f.farm_name AS farm_name,
                    s.status AS season_status
                FROM farming_seasons s
                JOIN products p ON p.product_id = s.product_id
                LEFT JOIN farms f ON f.farm_id = s.farm_id
                WHERE s.season_id = ? AND p.product_id = ?
                """,
                """
                SELECT
                    s.season_id AS season_id,
                    p.product_id AS product_id,
                    s.season_code AS season_code,
                    s.name AS season_name,
                    p.product_code AS product_code,
                    p.name AS product_name,
                    s.crop_name AS crop_name,
                    f.farm_code AS farm_code,
                    f.farm_name AS farm_name,
                    s.status AS season_status
                FROM seasons s
                JOIN products p ON p.product_id = s.product_id
                LEFT JOIN farms f ON f.farm_id = s.farm_id
                WHERE s.season_id = ? AND p.product_id = ?
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
}
