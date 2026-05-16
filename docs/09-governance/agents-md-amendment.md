---
title: AGENTS.md Amendment Specification
ids: []
status: active
last-reviewed: 2026-05-16
language: bilingual
---

# AGENTS.md Amendment Specification

Diff cụ thể được apply vào `AGENTS.md` ở root repo trong tasks Stage 6 (S6.T6). Atomic với redirect stubs (S6.T5) — cùng commit duy nhất.

## Anchor Path Updates

`AGENTS.md` "Mandatory Context Before Changes" section hiện tại neo 4 paths:

```text
Before changing code, read:

1. `docs/architecture/PROJECT_CONTEXT.md`
2. `docs/architecture/MODULES.md`
3. `docs/business/BUSINESS_RULES.md`
4. The relevant file under `docs/modules/`
5. Existing tests for the touched module
```

**Replace với:**

```text
Before changing code, read:

1. `docs/03-architecture/context.md`
2. `docs/04-modules/README.md`
3. `docs/02-domain/business-rules.md`
4. The relevant file under `docs/04-modules/`
5. Existing tests for the touched module
```

Lưu ý: 4 legacy paths vẫn resolvable qua redirect stubs (S6.T5) trong vòng 1 release cycle, do đó không bao giờ trỏ vào 404 ngay cả với external bookmarks.

## New Section: Doc-Code Sync Protocol

Thêm section mới ở cuối `AGENTS.md`, ngay trước (hoặc sau) "Verification Commands":

```markdown
## Doc-Code Sync Protocol

`docs/` là Single Source of Truth (SSOT). Mọi thay đổi code phải đồng bộ với docs.

1. Mọi PR phải tham chiếu ít nhất một ID (`R-*`, `BR-*`, `STM-*`, `API-*`) trong `docs/` ở phần "Doc IDs touched" của PR description.
2. Code thực hiện hành vi chưa có ID trong docs ⇒ tạo ID mới ở `docs/01-requirements/` (hoặc `02-domain/business-rules.md` cho rule, hoặc `02-domain/state-machines/` cho transition) trong cùng commit.
3. Mâu thuẫn giữa code và docs ⇒ docs đổi trước HOẶC tạo `GAP-*` entry trong `docs/09-governance/gap-register.md` ghi nhận deviation.
4. Endpoint thay đổi (path, request, response) ⇒ cập nhật `docs/05-api/openapi.yaml` trong cùng PR.
5. State machine code thay đổi ⇒ cập nhật bảng STM-* trong `docs/02-domain/state-machines/<entity>.md` trong cùng PR.
6. Reviewer chạy local trước approve:
   - `scripts/docs/docs-check.{sh,ps1}` — link check
   - `scripts/docs/docs-lint.{sh,ps1}` — front-matter + ID format
   - `scripts/docs/docs-trace.{sh,ps1}` — Brief bullet → R-* → test coverage
   (3 lệnh hiện là stub; implementation thuộc spec follow-up `docs-quality-gates-impl`.)
7. PR template (`.github/PULL_REQUEST_TEMPLATE.md`) bắt buộc các fields: `Doc IDs touched`, `Gap entries`, `OpenAPI delta`, `Tests`, `RBAC impact`.

Khi không tuân thủ: PR review từ chối cho đến khi đạt yêu cầu trên hoặc tạo `GAP-*` ghi nhận deviation.
```

## Apply Procedure (S6.T6)

1. Apply 4 anchor path replacements bằng `str_replace` chính xác.
2. Append new H2 section `## Doc-Code Sync Protocol` (text trên).
3. Verify atomicity: redirect stubs (S6.T5) đã tồn tại trước khi commit S6.T6.
4. Commit message gợi ý: `docs(blueprint): apply Strategy B atomic — move canonical paths, add redirect stubs, amend AGENTS.md`

Đây là task cuối cùng của spec `docs-as-blueprint`. Mọi task ngoài S6.T6 phải thuộc follow-up spec.
