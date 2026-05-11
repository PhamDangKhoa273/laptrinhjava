# BICAP Agent Skills

These are local working skills for agents maintaining BICAP.

## 1. Architecture Analysis Skill

Use when asked to understand or change structure.

Steps:

1. Read `docs/architecture/PROJECT_CONTEXT.md` and `docs/architecture/MODULES.md`.
2. Locate affected backend module(s) under `backend/src/main/java/com/bicap/modules`.
3. Locate affected frontend route/page/service files.
4. Identify cross-cutting dependencies in `core/`.
5. Update module docs after the change.

## 2. Business Rule Extraction Skill

Use when documenting or validating nghiệp vụ.

Sources, in priority order:

1. Service methods and transactions.
2. Entity/enums/status fields.
3. Controller authorization/API boundaries.
4. Existing tests.
5. Existing docs.

Never present a desired rule as implemented unless the code or tests support it.

## 3. Module Implementation Skill

Use when implementing a new feature.

Checklist:

- Identify owning module.
- Add DTO/API boundary only where needed.
- Put validations and state changes in service layer.
- Keep repository access inside module/service layer.
- Add or update tests.
- Update module markdown.

## 4. Security/RBAC Verification Skill

Use when touching auth, routes, users, or admin features.

Checklist:

- Confirm allowed roles.
- Confirm denied roles cannot render protected workspaces.
- Confirm frontend route guard matches backend authorization intent.
- Keep production seeding safe.
- Run relevant tests.

## 5. Frontend Role Dashboard Skill

Use when touching workspace pages.

Checklist:

- Route is listed in `AppRoutes.jsx`.
- Role is protected by `RoleProtectedRoute`.
- Sidebar links are role-appropriate.
- Loading/empty/error states do not reference undefined data.
- Tests assert stable UI markers.

## 6. Backend Service/Test Skill

Use when touching Java modules.

Checklist:

- Service owns business rule.
- Controller remains thin.
- Repository queries are intentional.
- Tests cover happy path, forbidden path, and invalid state where practical.

## 7. Documentation Synchronization Skill

Use after any code change.

Checklist:

- Update relevant `docs/modules/*.md`.
- Update `docs/business/BUSINESS_RULES.md` if a global rule changes.
- Update `docs/architecture/MODULES.md` if module ownership/routing changes.
- Keep examples free of real secrets.
