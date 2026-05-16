---
title: Brief vs Code Drift Report
ids: []
status: draft
last-reviewed: 2026-05-16
language: bilingual
---

# Brief vs Code Drift Report

Báo cáo phát hiện sai lệch giữa Brief gốc và codebase hiện tại. Sinh ra theo procedure D6 trong design.

**Procedure status.** Skeleton — sẽ được điền trong tasks Stage 3 (S3.T9). Mỗi entry mới sẽ tạo một `GAP-*` mới (range GAP-008..050) trong [`../09-governance/gap-register.md`](../09-governance/gap-register.md).

## BRIEF-SILENT

Code có capability nhưng Brief không nhắc tới. Hành động thường: tạo `R-*` mới với `source quote: [BRIEF-SILENT]` và `status: planned`, hoặc mở `GAP-*` defer.

| code-path | role-context | proposed-action |
|---|---|---|
| _(pending S3.T9)_ | | |

## CODE-MISSING

Brief nhắc tới capability nhưng code chưa có. Hành động thường: tạo `R-*` với `status: planned` + `GAP-*`.

| brief-bullet | role | proposed-action |
|---|---|---|
| _(pending S3.T9)_ | | |

## CONTRADICTION

Cả Brief và code đều có nhưng mâu thuẫn. Hành động bắt buộc: mở `GAP-*` ghi quyết định pending.

| code-path | brief-bullet | resolution-target |
|---|---|---|
| `BLOCKCHAIN_ARCHITECTURE.md: validation/manage only` | Admin "triển khai, cập nhật và quản lý các hợp đồng thông minh" | [`GAP-001`](../09-governance/gap-register.md) |

## Procedure (D6)

Tasks-phase Stage 3 thực hiện:

1. **Walk code paths.** Liệt kê:
   - `@(Get|Post|Put|Patch|Delete)Mapping|@RequestMapping` trong `backend/src/main/java/com/bicap/modules/*/controller/`
   - Routes trong `frontend/src/routes/`, pages trong `frontend/src/pages/`
   - `@Scheduled` cho cron jobs
2. **Cross-reference** mỗi path với Brief bullet (đọc từ `_brief-source.md`).
3. **Classify** vào 3 nhóm trên.
4. **Append entries** vào 3 bảng và mở `GAP-008..N` trong `gap-register.md`.

## Status

Sections trống được ghi note `_(pending S3.T9)_` thay vì bỏ trống hoàn toàn.
