---
title: Migration Scope
ids: []
status: active
last-reviewed: 2026-05-16
language: vi
---

# Migration Scope

Phạm vi của spec `docs-as-blueprint`. Đối lập với phần defer sang follow-up specs.

## In Scope (làm trong spec hiện tại)

1. Cấu trúc 10-folder (00..09) + `_archive/` dưới `docs/`
2. Lược đồ ID 7 loại: `R-*`, `NFR-*`, `BR-*`, `STM-*`, `API-*`, `ADR-*`, `GAP-*`
3. Six functional requirement files filled từ Brief: admin, farm-manager, retailer, driver, shipping-manager, guest
4. Five non-functional requirement files với placeholders `[TBD: target value]`: scalability, performance, reliability, security, blockchain
5. RBAC matrix scaffold cho 6 vai trò × N resources
6. Five state machines: shipment, order, season, farm-approval, subscription
7. 22 module documentation files migrated to new template tại `04-modules/`
8. Traceability matrix scaffold (Brief bullet → R-* → module → API-* → test)
9. OpenAPI scaffold với 18 operations: 5 auth + 4 order + 3 shipment + 6 placeholder
10. Six ADR scaffolds: ADR-001..005 + ADR-006 (AGENTS.md anchor strategy)
11. Gap register seeded với 7 entries (GAP-001..007)
12. AGENTS.md amendment specification
13. Pull-request template specification
14. Stub scripts cho `docs:check`, `docs:lint`, `docs:trace`

## Out of Scope (defer sang follow-up specs)

| Item | Follow-up spec |
|---|---|
| Full OpenAPI specification cho mọi endpoint trong codebase | `docs-openapi-completion` |
| Implementation `docs:check`, `docs:lint`, `docs:trace` (script thực sự thay vì stub) | `docs-quality-gates-impl` |
| CI hard-enforcement của doc-code sync | `docs-quality-gates-impl` |
| Frontend RBAC binding implementation (per design D5) | `frontend-rbac-binding` |
| Translation Vietnamese ↔ English cho prose | Không có spec, nguyên tắc per-artefact ngôn ngữ ở `00-overview/structure.md` |
| Code change trong `backend/`, `frontend/`, `blockchain/contracts/`, `deploy/` | Không thực hiện |

## Code-Adjacent Edits Allowed

Hai ngoại lệ duy nhất cho phép sửa file ngoài `docs/`:

1. **AGENTS.md** ở root — cập nhật 4 anchor paths + thêm Doc-Code Sync Protocol section (Stage 6 của tasks)
2. **`.github/PULL_REQUEST_TEMPLATE.md`** — mirror `09-governance/pull-request-template.md` (Stage 6)

Mọi code change khác KHÔNG thuộc phạm vi spec này. Nếu task đề xuất code change ngoài 2 ngoại lệ trên: chuyển sang follow-up spec.

## Out-of-Scope Repository Areas

- `d:\Code\laptrinhjava\laptrinhjava\` — bản nested copy của workspace, hoàn toàn ngoài phạm vi.
