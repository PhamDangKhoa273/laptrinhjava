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

1. `docs/architecture/PROJECT_CONTEXT.md`
2. `docs/architecture/MODULES.md`
3. `docs/business/BUSINESS_RULES.md`
4. The relevant file under `docs/modules/`
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

When changing a module, update the matching file in `docs/modules/`.

When changing cross-module architecture, update:

- `docs/architecture/PROJECT_CONTEXT.md`
- `docs/architecture/MODULES.md`
- `docs/business/BUSINESS_RULES.md`

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
