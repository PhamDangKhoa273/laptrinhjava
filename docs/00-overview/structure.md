---
title: BICAP Docs Structure Overview
ids: []
status: active
last-reviewed: 2026-05-16
language: vi
---

# BICAP Docs Structure Overview

Tài liệu này là điểm khởi đầu để hiểu thư mục `docs/`. Cấu trúc được đánh số 00..09 + `_archive` để đọc tuần tự như một bản thiết kế hệ thống. Mỗi thư mục có mục đích duy nhất; nội dung không khớp mục đích sẽ bị `docs:lint` đánh dấu non-conformant.

## Folder Map

| Folder | Mục đích | Loại nội dung chính |
|---|---|---|
| `00-overview/` | Điểm khởi đầu, dẫn dắt người đọc | vision, glossary, stakeholders, structure, migration-scope, non-goals, brief-code-drift-report |
| `01-requirements/` | Yêu cầu chức năng (theo vai trò) + phi chức năng + traceability matrix | `functional/<role>.md` (R-*), `non-functional/<category>.md` (NFR-*), `traceability-matrix.md` |
| `02-domain/` | Mô hình miền: ngôn ngữ chung, entities, quan hệ, business rules, state machines | `ubiquitous-language.md`, `entities.md`, `relationships.md`, `business-rules.md` (BR-*), `state-machines/<entity>.md` (STM-*) |
| `03-architecture/` | Kiến trúc hệ thống + Architecture Decision Records | C4 diagrams, deployment, tech-stack, `adrs/ADR-NNN-*.md` (ADR-*) |
| `04-modules/` | Tài liệu cho từng module backend; ownership map của R-*/BR-*/STM-* | `<module>.md` (1 file / module), `_TEMPLATE.md`, `README.md` (module index) |
| `05-api/` | Hợp đồng API: conventions, authentication, OpenAPI canonical | `conventions.md`, `authentication.md`, `openapi.yaml` (API-*), `collections/` |
| `06-security/` | Mô hình bảo mật, ma trận RBAC, key management | `rbac-matrix.md`, `threat-model.md`, `key-management.md` |
| `07-operations/` | Runbooks vận hành, observability, disaster recovery | `runbook-deploy.md`, `runbook-backup.md`, `observability.md` |
| `08-testing/` | Chiến lược test + coverage matrix theo requirement | `strategy.md`, `coverage-by-requirement.md` |
| `09-governance/` | Quy tắc quản trị tài liệu, đăng ký gap, PR template, CI spec | `id-naming.md`, `doc-change-policy.md`, `pr-checklist.md`, `gap-register.md` (GAP-*), `agents-md-amendment.md`, `pull-request-template.md`, `ci-check-spec.md` |
| `_archive/` | Tài liệu lịch sử, phase reports, audit cũ; giữ tối thiểu 1 release cycle | `phase-reports/`, `audits/`, `handoffs/` |

## ID Types

Bảy loại ID stable được dùng xuyên suốt tài liệu. Quy ước đầy đủ ở [`09-governance/id-naming.md`](../09-governance/id-naming.md).

| ID Type | Phạm vi | Allocation | Ví dụ |
|---|---|---|---|
| `R-<ROLE>-<NNN>` | Functional requirement theo vai trò | stride-10 | `R-ADM-010`, `R-FRM-070` |
| `NFR-<CAT>-<NNN>` | Non-functional theo phạm trù | stride-10 | `NFR-SCL-010`, `NFR-BC-010` |
| `BR-<DOMAIN>-<NNN>` | Business rule nguyên tử | stride-10 | `BR-ORD-010`, `BR-FRM-020` |
| `STM-<DOMAIN>-T<NN>` | Transition trong state machine | dense | `STM-SHP-T01` |
| `API-<MOD>-<NNN>` | Endpoint, ánh xạ `operationId` OpenAPI | dense | `API-ORD-001` |
| `ADR-<NNN>` | Architecture Decision Record | dense | `ADR-001` |
| `GAP-<NNN>` | Gap register entry | dense | `GAP-001` |

Roles cho `R-*`: `ADM` (Admin), `FRM` (Farm Manager), `RTL` (Retailer), `DRV` (Driver), `SHM` (Shipping Manager), `GST` (Guest).

## Language Strategy

Vietnamese cho prose hướng người dùng. English cho IDs, EARS keywords (`WHEN`, `IF`, `THEN`, `SHALL`, `WHERE`, `WHILE`), file paths, code blocks, regex, YAML/JSON keys.

Áp dụng cụ thể (chốt ở design D7):

| Artefact | Ngôn ngữ |
|---|---|
| ADR titles | English |
| ADR body (context, decision, consequences) | Vietnamese |
| OpenAPI `tags`, `summary` | English |
| OpenAPI `description` | Bilingual (English ≤2 sentences, Vietnamese đầy đủ phía sau, ngăn cách `---`) |
| `BR-*.statement` | Vietnamese |
| Error codes (machine) | English |
| Error messages (user-facing) | Vietnamese |
| Glossary entries | Bilingual |
| `R-*.title` | Vietnamese |
| `R-*` acceptance criteria | English EARS keywords + Vietnamese predicate |
| `STM-*` columns/values | English (UPPER_SNAKE_CASE state values) |
| Module doc section headings | English (`Purpose`, `Owns`, `Implements`, `Depends-on`, `API surface`, `Tests`, `Open gaps`) |
| File names | kebab-case English |

## Đọc Theo Thứ Tự

Cách đọc khuyến nghị cho người mới:

1. `00-overview/vision.md` — biết hệ thống làm gì
2. `00-overview/stakeholders.md` — biết ai dùng
3. `01-requirements/functional/_brief-source.md` — đọc Brief gốc
4. `01-requirements/functional/<role>.md` — đọc R-* tương ứng vai trò bạn quan tâm
5. `02-domain/ubiquitous-language.md` — khoá thuật ngữ
6. `04-modules/README.md` — module index
7. `04-modules/<module>.md` — module bạn cần
8. `06-security/rbac-matrix.md` — biết quyền nào cho ai

## Folder Mapping

Tài liệu di sản từ `docs/architecture/`, `docs/business/`, `docs/modules/` được giữ tại path gốc dưới dạng redirect stub (`status: superseded`); nội dung canonical chuyển sang cấu trúc đánh số. Chi tiết ở `ADR-006`.
