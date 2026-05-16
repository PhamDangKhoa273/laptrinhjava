# AGENTS.md - BICAP Project Agent Guide

This file is the project-local operating guide for agents working inside the BICAP repository.

## Project Identity

BICAP is a modular agricultural supply-chain platform with role-based workspaces for:

- Admin
- Farm
- Retailer
- Shipping Manager
- Driver
- Guest

The accepted architecture is **Modular Monolith + Layered Modules + RBAC Frontend**.

## Mandatory Context Before Changes

Before changing code, read:

1. `docs/03-architecture/context.md`
2. `docs/04-modules/README.md`
3. `docs/02-domain/business-rules.md`
4. The relevant file under `docs/04-modules/`
5. Existing tests for the touched module

## Backend Architecture Rules

Backend code lives under `backend/src/main/java/com/bicap`.

- `core/` contains cross-cutting infrastructure.
- `modules/` contains bounded-context modules.
- Each module should keep concerns separated by layer:
  - `controller/` for HTTP/API boundary
  - `dto/` for request/response contracts
  - `service/` for application/business rules
  - `entity/` for persistence models
  - `repository/` for database access
  - `enums/` for lifecycle/status values

Do not place business rules in controllers when they belong in services.

## Frontend Architecture Rules

Frontend code lives under `frontend/src`.

- `routes/` owns route protection and workspace access.
- `layouts/` owns shell/navigation behavior.
- `pages/` owns role/page-level screens.
- `services/` owns API calls.
- `utils/constants.js` and `utils/helpers.js` own role constants and role normalization.

Every protected workspace must be backed by route-level RBAC tests.

## Security Rules

- Never introduce production default credentials.
- Never document real secrets.
- Keep demo credentials clearly local/demo only.
- Preserve JWT/RBAC boundaries.
- Keep rate limiting and security filters active.
- Prefer deny-by-default for role checks.

## Documentation Rules

When changing a module, update the matching file in `docs/04-modules/`.

When changing cross-module architecture, update:

- `docs/03-architecture/context.md`
- `docs/04-modules/README.md`
- `docs/02-domain/business-rules.md`

## Doc-Code Sync Protocol

`docs/` là Single Source of Truth (SSOT). Mọi thay đổi code phải đồng bộ với docs.

1. Mọi PR phải tham chiếu ít nhất một ID (`R-*`, `BR-*`, `STM-*`, `API-*`) trong `docs/` ở phần "Doc IDs touched" của PR description.
2. Code thực hiện hành vi chưa có ID trong docs ⇒ tạo ID mới ở `docs/01-requirements/` (functional/non-functional), `docs/02-domain/business-rules.md` (cho rule), hoặc `docs/02-domain/state-machines/` (cho transition) trong cùng commit.
3. Mâu thuẫn giữa code và docs ⇒ docs đổi trước HOẶC tạo `GAP-*` entry trong `docs/09-governance/gap-register.md` ghi nhận deviation.
4. Endpoint thay đổi (path, request, response) ⇒ cập nhật `docs/05-api/openapi.yaml` trong cùng PR.
5. State machine code thay đổi ⇒ cập nhật bảng STM-* trong `docs/02-domain/state-machines/<entity>.md` trong cùng PR.
6. RBAC thay đổi ⇒ cập nhật cell trong `docs/06-security/rbac-matrix.md`.
7. Reviewer chạy local trước approve:
   - `scripts/docs/docs-check.{sh,ps1}` — link check (exit 1 nếu broken)
   - `scripts/docs/docs-lint.{sh,ps1}` — front-matter + ID format + uniqueness (exit 1 nếu violation)
   - `scripts/docs/docs-trace.{sh,ps1}` — Brief bullet ↔ R-* coverage (exit 1 nếu bullet không có quote trong R-*; R-* không reference module/openapi chỉ warn)
   (3 lệnh đã implement local; CI workflow `.github/workflows/docs-checks.yml` thuộc spec follow-up `docs-quality-gates-impl`.)
8. PR template (`.github/PULL_REQUEST_TEMPLATE.md`) bắt buộc các fields: `Doc IDs touched`, `Gap entries`, `OpenAPI delta`, `Tests`, `RBAC impact`.

Khi không tuân thủ: PR review từ chối cho đến khi đạt yêu cầu trên hoặc tạo `GAP-*` ghi nhận deviation.

Reading order khi onboard agent mới:

1. `docs/00-overview/structure.md` — folder map + ID types
2. `docs/00-overview/stakeholders.md` — 6 vai trò
3. `docs/01-requirements/functional/_brief-source.md` — Brief gốc
4. `docs/04-modules/README.md` — module index
5. `docs/06-security/rbac-matrix.md` — authorization matrix
6. `docs/09-governance/doc-change-policy.md` — quy tắc sửa docs

## Verification Commands

Frontend:

```powershell
npm run test
npm run build
npm audit --audit-level=moderate
```

Backend, from `backend/` when applicable:

```powershell
.\mvnw test
```

Use targeted tests first when a full test run is slow.

## Known DB Schema Issues

All tables with `@Version` (optimistic locking) have the `version` column as **nullable** with no default. Existing pre-migration rows have `version = NULL`, causing `NullPointerException` when Hibernate tries to increment a null version during UPDATE. After any DB migration that creates rows without setting version, run:

```sql
UPDATE <table_name> SET version = 0 WHERE version IS NULL;
```

Tables affected: `shipments`, `orders`, `product_listings`, `subscription_payments`, `iot_alerts`.

## Known Authorization Pattern

- `DriverService` / `VehicleService`: Any `SHIPPING_MANAGER` can update/delete any driver/vehicle (not restricted to creator).
- `ShipmentService.assertCanManageShipment`: Any `SHIPPING_MANAGER` can update any shipment (changed from "only creator + ADMIN").
- `ShipmentService.assertCanViewShipment`: Restricted by user type + ownership.
