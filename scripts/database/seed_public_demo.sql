-- Demo seed for BICAP public pages: marketplace, listing detail, public trace, announcements.
-- Idempotent for the local Docker MySQL database.

INSERT INTO farming_seasons (
    season_id, farm_id, product_id, season_code, start_date, expected_harvest_date,
    actual_harvest_date, farming_method, season_status, created_at, updated_at
) VALUES
    (1, 1, 2, 'SEASON-DEMO-VEG-2026', DATE_SUB(CURDATE(), INTERVAL 120 DAY), DATE_SUB(CURDATE(), INTERVAL 10 DAY), DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Organic greenhouse rotation with drip irrigation', 'HARVESTED', NOW(), NOW()),
    (2, 1, 3, 'SEASON-DEMO-FRUIT-2026', DATE_SUB(CURDATE(), INTERVAL 150 DAY), DATE_ADD(CURDATE(), INTERVAL 18 DAY), NULL, 'Low-spray orchard care with field scouting', 'COMPLETED', NOW(), NOW()),
    (3, 1, 4, 'SEASON-DEMO-ROOT-2026', DATE_SUB(CURDATE(), INTERVAL 95 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Raised-bed cultivation with soil moisture monitoring', 'HARVESTED', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    expected_harvest_date = VALUES(expected_harvest_date),
    actual_harvest_date = VALUES(actual_harvest_date),
    farming_method = VALUES(farming_method),
    season_status = VALUES(season_status),
    updated_at = NOW();

INSERT INTO product_batches (
    batch_id, season_id, product_id, batch_code, harvest_date, quantity,
    available_quantity, quality_grade, expiry_date, batch_status, created_at, updated_at
) VALUES
    (1, 1, 2, 'BATCH-DEMO-001', DATE_SUB(CURDATE(), INTERVAL 12 DAY), 1250.00, 860.00, 'A+', DATE_ADD(CURDATE(), INTERVAL 24 DAY), 'READY', NOW(), NOW()),
    (2, 2, 3, 'BATCH-DEMO-002', DATE_SUB(CURDATE(), INTERVAL 5 DAY), 980.00, 640.00, 'A', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 'READY', NOW(), NOW()),
    (3, 3, 4, 'BATCH-DEMO-003', DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1500.00, 1190.00, 'A', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'READY', NOW(), NOW())
ON DUPLICATE KEY UPDATE
    harvest_date = VALUES(harvest_date),
    quantity = VALUES(quantity),
    available_quantity = VALUES(available_quantity),
    quality_grade = VALUES(quality_grade),
    expiry_date = VALUES(expiry_date),
    batch_status = VALUES(batch_status),
    updated_at = NOW();

INSERT INTO qr_codes (qr_code_id, batch_id, qr_value, qr_url, generated_at, status) VALUES
    (1, 1, 'DEMO', 'https://bicap.local/trace/DEMO', NOW(), 'ACTIVE'),
    (2, 2, 'DEMO-FRUIT-2026', 'https://bicap.local/trace/DEMO-FRUIT-2026', NOW(), 'ACTIVE'),
    (3, 3, 'DEMO-ROOT-2026', 'https://bicap.local/trace/DEMO-ROOT-2026', NOW(), 'ACTIVE')
ON DUPLICATE KEY UPDATE
    qr_value = VALUES(qr_value),
    qr_url = VALUES(qr_url),
    status = 'ACTIVE';

INSERT INTO product_listings (
    listing_id, batch_id, title, description, price, quantity_available,
    unit, image_url, status, approval_status, created_at, updated_at, quantity_reserved, version
) VALUES
    (1, 1, 'Premium Traceable Organic Greens', 'Fresh greenhouse vegetables from Nông trại xanh with complete QR traceability, harvest evidence, and verified batch dossier for public buyers.', 42000.00, 860.00, 'kg', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80', 'ACTIVE', 'APPROVED', NOW(), NOW(), 0.00, 0),
    (2, 2, 'Verified Seasonal Lychee Lot', 'Aromatic fruit lot prepared for retailer sourcing with transparent farm records and quality checks.', 68000.00, 640.00, 'kg', 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=1200&q=80', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), 0.00, 0),
    (3, 3, 'Clean Root Vegetable Batch', 'Carrot batch with soil-health notes, harvest timing, and live marketplace availability for demo flows.', 36000.00, 1190.00, 'kg', 'https://images.unsplash.com/photo-1445282768818-728615cc910a?auto=format&fit=crop&w=1200&q=80', 'ACTIVE', 'APPROVED', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), 0.00, 0)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    price = VALUES(price),
    quantity_available = VALUES(quantity_available),
    image_url = VALUES(image_url),
    status = 'ACTIVE',
    approval_status = 'APPROVED',
    updated_at = NOW();

INSERT INTO farming_processes (
    process_id, season_id, step_no, step_name, performed_at, description,
    image_url, recorded_by_user_id, created_at, updated_at
) VALUES
    (1, 1, 1, 'Seedling selection', DATE_SUB(NOW(), INTERVAL 115 DAY), 'Selected resilient seeds and recorded supplier certificate before planting.', NULL, 2, NOW(), NOW()),
    (2, 1, 2, 'Organic soil preparation', DATE_SUB(NOW(), INTERVAL 95 DAY), 'Prepared compost-rich soil beds and verified pH/moisture before transplanting.', NULL, 2, NOW(), NOW()),
    (3, 1, 3, 'Harvest and batch sealing', DATE_SUB(NOW(), INTERVAL 12 DAY), 'Harvested, graded A+ produce, sealed batch BATCH-DEMO-001 and generated public QR trace code DEMO.', NULL, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    step_name = VALUES(step_name),
    performed_at = VALUES(performed_at),
    description = VALUES(description),
    updated_at = NOW();

INSERT INTO blockchain_transactions (
    tx_id, related_entity_type, related_entity_id, action_type, tx_hash, tx_status,
    created_at, governance_status, governance_note, retry_count, last_retry_at,
    data_payload, tx_origin, tx_seed
) VALUES
    (1, 'BATCH', 1, 'TRACE_ANCHOR', '0xdemo000000000000000000000000000000000000000000000000000000000001', 'SUCCESS', NOW(), 'APPROVED', 'Demo trace anchor for public verification.', 0, NULL, '{"batchCode":"BATCH-DEMO-001","traceCode":"DEMO"}', 'DEMO_SEED', 'BATCH-DEMO-001')
ON DUPLICATE KEY UPDATE
    tx_status = 'SUCCESS',
    governance_status = 'APPROVED',
    governance_note = VALUES(governance_note),
    data_payload = VALUES(data_payload);

INSERT INTO system_announcements (
    announcement_id, title, summary, content_html, category, is_pinned,
    publish_at, expire_at, is_active, created_by_user_id, created_at, updated_at
) VALUES
    (1, 'BICAP marketplace demo data is live', 'Public buyers can now browse verified listings, view trace evidence and follow seasonal logistics updates.', '<p>The public marketplace has been refreshed with traceable batches, verified farm records and buyer-ready listing dossiers.</p>', 'system', b'1', DATE_SUB(NOW(6), INTERVAL 2 HOUR), DATE_ADD(NOW(6), INTERVAL 30 DAY), b'1', 1, NOW(6), NOW(6)),
    (2, 'Seasonal shipping window opens this week', 'Shipping managers are coordinating cooler routes for high-value produce across the BICAP network.', '<p>Retailers should reserve capacity early for upcoming seasonal lots. Trace and batch verification remain available for all public buyers.</p>', 'shipping', b'0', DATE_SUB(NOW(6), INTERVAL 1 DAY), DATE_ADD(NOW(6), INTERVAL 20 DAY), b'1', 1, NOW(6), NOW(6)),
    (3, 'Market signal: verified produce demand rising', 'Verified produce lots with QR-backed traceability are receiving stronger retailer interest.', '<p>Farms with approved listings and active QR records are highlighted in the public marketplace experience.</p>', 'market', b'0', DATE_SUB(NOW(6), INTERVAL 2 DAY), DATE_ADD(NOW(6), INTERVAL 20 DAY), b'1', 1, NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    summary = VALUES(summary),
    content_html = VALUES(content_html),
    category = VALUES(category),
    is_pinned = VALUES(is_pinned),
    publish_at = VALUES(publish_at),
    expire_at = VALUES(expire_at),
    is_active = b'1',
    updated_at = NOW(6);

INSERT INTO educational_contents (
    content_id, title, slug, summary, body, content_type, media_url,
    status, created_by_user_id, created_at, updated_at
) VALUES
    (1, 'How to read a BICAP trace dossier', 'how-to-read-bicap-trace-dossier', 'A quick guide for public buyers reviewing QR codes, batch timelines and verification signals.', '<p>Start with the trace code, confirm the batch code, then review farm, process and verification evidence before contacting the seller.</p>', 'GUIDE', NULL, 'PUBLISHED', 1, NOW(), NOW()),
    (2, 'What makes a listing marketplace-ready?', 'what-makes-a-listing-marketplace-ready', 'Approved farms, active QR records and available batch quantities are the core readiness signals.', '<p>Marketplace-ready lots combine approved farm profiles, traceable batches, valid expiry dates and transparent quality notes.</p>', 'EDUCATION', NULL, 'PUBLISHED', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW())
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    summary = VALUES(summary),
    body = VALUES(body),
    content_type = VALUES(content_type),
    status = 'PUBLISHED',
    updated_at = NOW();
