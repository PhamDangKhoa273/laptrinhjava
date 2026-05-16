---
id: ADR-006
title: AGENTS.md Anchor Strategy — Move with Redirect Stubs (Strategy B)
status: accepted
date: 2026-05-16
decision: Di chuyển canonical content sang cấu trúc đánh số mới (`docs/00-..09-`); để lại redirect stubs ở 4 legacy paths AGENTS.md đang neo; cập nhật AGENTS.md atomic với file moves.
context: Tái cấu trúc docs sang blueprint mới; AGENTS.md đang neo cứng vào 4 đường dẫn cũ; phải bảo đảm anchors vẫn resolvable sau migration.
consequences: New structure là canonical; legacy paths giữ stubs với status superseded; PR migration phải atomic (file moves + stubs + AGENTS.md update trong cùng commit).
---

# ADR-006 — AGENTS.md Anchor Strategy

## Status

accepted

## Context

`AGENTS.md` ở root repo neo cứng 4 đường dẫn:

1. `docs/architecture/PROJECT_CONTEXT.md`
2. `docs/architecture/MODULES.md`
3. `docs/business/BUSINESS_RULES.md`
4. `docs/modules/`

Spec `docs-as-blueprint` chuyển docs sang cấu trúc đánh số `00-..09-` (xem [`structure.md`](../../00-overview/structure.md)). Canonical content phải nằm ở đúng numbered structure để spec đạt mục tiêu SSOT.

Hai chiến lược:

- **Strategy A:** Giữ canonical ở 4 legacy paths, mirror/link từ structure mới
- **Strategy B:** Move canonical sang structure mới, leave redirect stubs ở 4 legacy paths, atomic update AGENTS.md

## Decision

**Strategy B — Move + Redirect Stubs + Atomic AGENTS.md Update.**

Mapping:

| Legacy path (becomes redirect stub) | New canonical path |
|---|---|
| `docs/architecture/PROJECT_CONTEXT.md` | `docs/03-architecture/context.md` |
| `docs/architecture/MODULES.md` | `docs/04-modules/README.md` |
| `docs/business/BUSINESS_RULES.md` | `docs/02-domain/business-rules.md` |
| `docs/modules/<file>.md` (16 files) | `docs/04-modules/<module>.md` |

**Atomic update yêu cầu:**

- 1 commit (hoặc 1 PR) chứa:
  1. Các file di chuyển sang new path
  2. Redirect stubs ở 4 legacy paths với `status: superseded` + `superseded-by`
  3. AGENTS.md cập nhật 4 anchor paths sang new canonical paths
- Không split thành 2 commits.

Redirect stub schema (per design D9):

```yaml
---
title: <legacy filename — Superseded>
status: superseded
superseded-by: docs/<new-canonical-path>
last-reviewed: 2026-05-16
language: en
---
This document moved to [docs/<new-canonical-path>](../<new-canonical-path>).
```

## Consequences

- **Positive:**
  - New numbered structure là canonical → mọi navigation đến new structure
  - Legacy bookmarks vẫn resolve qua stub (1 click extra)
  - AGENTS.md không trỏ vào 404 (atomic update)
- **Negative:**
  - PR migration lớn, khó review (mitigation: tasks Stage 6 chia rõ DoD)
  - Phải duy trì redirect stubs ít nhất 1 release cycle
- **Follow-up:**
  - Sau 1 release cycle, có thể remove redirect stubs nếu không còn external references
  - [`GAP-002`](../../09-governance/gap-register.md) resolved bởi ADR này

## Alternatives Considered

- **Strategy A (keep at legacy paths):** Reject. New numbered structure trở thành façade; canonical content thực sự ở legacy paths → vi phạm tinh thần SSOT của spec.
- **Move without stubs (break links):** Reject. AGENTS.md sẽ trỏ vào 404 cho đến khi update; không atomic, violate R14.4-5.
