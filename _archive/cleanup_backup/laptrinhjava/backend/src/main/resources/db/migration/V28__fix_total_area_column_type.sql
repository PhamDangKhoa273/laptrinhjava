-- Migration V28: Fix total_area column type from DECIMAL to DOUBLE
-- Hibernate 6 maps Java Double -> float(53)/DOUBLE, not DECIMAL
ALTER TABLE farms MODIFY COLUMN total_area DOUBLE NULL;
