---
title: Non-Goals
ids: []
status: active
last-reviewed: 2026-05-16
language: vi
---

# Non-Goals

Spec `docs-as-blueprint` không làm những việc sau:

## Forbidden Path Modifications

Phase requirements và phase design KHÔNG sửa bất kỳ file nào dưới:

- `backend/src/`
- `frontend/src/`
- `blockchain/contracts/`
- `deploy/`
- `.github/workflows/`

## Allowed Exceptions (chỉ trong tasks-phase)

Hai ngoại lệ duy nhất cho phép sửa file ngoài `docs/`:

1. Amendment vào root `AGENTS.md` (per Requirement 12 của requirements.md)
2. Thêm `.github/PULL_REQUEST_TEMPLATE.md` (mirror canonical doc trong `09-governance/`)

## Implementation Boundary

- Implementation của `docs:check`, `docs:lint`, `docs:trace` (script thực sự) → hoãn sang follow-up spec `docs-quality-gates-impl`
- CI hard-enforcement → hoãn sang follow-up spec `docs-quality-gates-impl`
- Frontend RBAC binding → hoãn sang follow-up spec `frontend-rbac-binding`
- Full OpenAPI cho mọi endpoint → hoãn sang follow-up spec `docs-openapi-completion`

## Content Translation

Spec này KHÔNG dịch tài liệu giữa Việt và Anh. Mỗi artefact theo bảng ngôn ngữ ở [`structure.md`](structure.md) và design D7. Nếu cần thêm ngôn ngữ counterpart, không bắt buộc rename retroactively.

## Test Writing

Spec này KHÔNG viết test cho code hiện tại. Cột `test-file` trong `traceability-matrix.md` có thể là `[TBD]`. Việc viết test thuộc về work stream khác.

## Scope Drift Prevention

Nếu một task trong `tasks.md` đề xuất công việc ngoài 14 in-scope items của [`migration-scope.md`](migration-scope.md): task phải được chuyển sang follow-up spec, không thực hiện trong spec này.
