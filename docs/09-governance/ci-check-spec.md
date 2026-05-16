---
title: CI Check Specification
ids: []
status: active
last-reviewed: 2026-05-16
language: bilingual
---

# CI Check Specification

Specification cho future CI hard-enforcement. Implementation defer sang follow-up spec `docs-quality-gates-impl`.

## Purpose

Bảo đảm doc-code sync protocol (xem `agents-md-amendment.md`) được enforce tự động trong CI, không chỉ qua PR review.

## Hooks

### On Pull Request opened/updated

- Run `scripts/docs/docs-check` — exit 1 nếu broken links
- Run `scripts/docs/docs-lint` — exit 1 nếu front-matter/ID violations
- Run `scripts/docs/docs-trace` — exit 1 nếu Brief bullet không có R-*, hoặc R-* không có test
- Diff scan: nếu code dưới `backend/src/main/java/com/bicap/modules/<module>/` thay đổi nhưng `docs/04-modules/<module>.md` không thay đổi ⇒ **non-blocking warning**
- PR description regex: phải match `R-[A-Z]{3}-\d{3}|BR-[A-Z]+-\d{3}|STM-[A-Z]+-T\d{2}|API-[A-Z]+-\d{3}` ít nhất một lần ⇒ **non-blocking warning** (initial soft mode)

### On Push to main

- Run all 3 docs scripts
- Build openapi.yaml validate (Swagger Editor or `swagger-cli validate`)
- Block merge nếu fail

## Initial Soft Mode

Phase đầu (≈3 tháng đầu sau spec implementation):

- Tất cả checks là **warning only** — không block merge
- Reviewer phải acknowledge warning trong PR review

## Hard Mode (sau soft phase)

- All 3 docs scripts blocking
- Diff scan blocking (code thay đổi yêu cầu module doc thay đổi)
- PR description ID requirement blocking

## Workflow Files (planned)

```
.github/workflows/docs-checks.yml      # docs:check, docs:lint, docs:trace
.github/workflows/openapi-validate.yml # openapi.yaml schema validate
```

Implementation defer.

## Follow-up Spec

`docs-quality-gates-impl`:

- Implement 3 docs scripts với real logic
- Setup `.github/workflows/docs-checks.yml`
- Setup OpenAPI validator
- Migration soft → hard mode timeline

Reference từ [`../00-overview/migration-scope.md`](../00-overview/migration-scope.md) out-of-scope list.

## Local Reviewer Workflow (current)

Trước khi approve PR:

1. Run `scripts/docs/docs-check.{sh,ps1}` — link checker, exit 1 nếu broken.
2. Run `scripts/docs/docs-lint.{sh,ps1}` — front-matter + ID format, exit 1 nếu violation.
3. Run `scripts/docs/docs-trace.{sh,ps1}` — Brief bullet ↔ R-* coverage, exit 1 nếu bullet không có quote trong `docs/01-requirements/`. R-* không reference trong `docs/04-modules` hoặc `openapi.yaml` chỉ warn.
4. Manual review: xem PR description có Doc IDs touched.
5. Manual review: nếu code module thay đổi, kiểm tra `docs/04-modules/<module>.md` có cập nhật.

Khi follow-up spec mở `.github/workflows/docs-checks.yml`, các bước 1–3 chuyển từ manual sang automated; bước 4–5 vẫn manual cho tới khi diff scan và PR description regex được implement.
