# Tasks Document: docs-as-blueprint

`tasks.md` là kế hoạch thực thi cho `design.md`. Mỗi task có ID dạng `S<stage>.T<n>`. Tasks chạy sequential trong một stage trừ khi đánh dấu `[parallel]`. Mỗi task có acceptance criteria đo được. Mọi task tham chiếu requirement IDs từ `requirements.md` qua field `Resolves` và quyết định thiết kế qua `Touches design`. Sáu stages tương ứng với D16 và phải hoàn thành theo thứ tự: mỗi stage có **Stage DoD** là gate vào stage tiếp theo.

Vietnamese cho prose; English cho task IDs, file paths, EARS keywords, regex, code blocks.

---

## Stage 1 — Foundation

**Goal.** Scaffold 11-folder structure, governance bedrock (id-naming, doc-change-policy, gap-register seeded), templates.

**Unlocks.** Mọi stage tiếp theo có ID stable và folder để write into.

**Stage DoD.**
- [ ] Toàn bộ folder tree D10 tồn tại với placeholder front-matter hợp lệ
- [ ] `09-governance/id-naming.md` chứa đầy đủ regex cho 7 ID types
- [ ] `09-governance/doc-change-policy.md` mô tả allocation rules (D1) + Brief revision protocol (D2)
- [ ] `09-governance/gap-register.md` chứa 7 seed entries (D15)
- [ ] `04-modules/_TEMPLATE.md` và `03-architecture/adrs/_TEMPLATE.md` tạo từ Reference Sections A, B
- [ ] Manual front-matter validation pass: tất cả file đúng schema D9

### S1.T1 — Front-matter schema reference + structure overview

**What.** Tạo `00-overview/structure.md` mô tả 11 folders + ngôn ngữ strategy D7. Đây là tài liệu reference cho mọi task sau.

**Where.** `docs/00-overview/structure.md`

**How.**
- Front-matter schema: `title`, `ids: []`, `status: active`, `last-reviewed: 2026-05-16`, `language: vi`
- Body sections: `## Folder Map` (bảng 11 folders với purpose), `## Language Strategy` (link tới design D7), `## ID Types` (link tới id-naming.md)
- Liệt kê đường dẫn nguồn cho mỗi folder số và mô tả 1 dòng

**Acceptance.**
- [ ] File tồn tại với front-matter hợp lệ
- [ ] Bảng 11 folders đầy đủ (00, 01, 02, 03, 04, 05, 06, 07, 08, 09, _archive)
- [ ] Language Strategy section liệt kê 12 artefact types từ D7

**Depends-on.** none

**Resolves.** R1.1, R1.2, R1.6

**Touches design.** D7, D10

### S1.T2 — Tạo 11 folders với placeholder

**What.** Tạo cấu trúc thư mục `docs/00-overview/`, `01-requirements/`, `02-domain/`, `03-architecture/`, `04-modules/`, `05-api/`, `06-security/`, `07-operations/`, `08-testing/`, `09-governance/`, `_archive/` cùng các sub-folders.

**Where.** `docs/00-overview/`, `docs/01-requirements/functional/`, `docs/01-requirements/non-functional/`, `docs/02-domain/state-machines/`, `docs/03-architecture/adrs/`, `docs/04-modules/`, `docs/05-api/collections/`, `docs/06-security/`, `docs/07-operations/`, `docs/08-testing/`, `docs/09-governance/`, `docs/_archive/`

**How.**
- Tạo từng thư mục
- Mỗi thư mục có 1 file `.gitkeep` hoặc `README.md` placeholder để git tracks
- README.md placeholders chỉ chứa front-matter `status: draft`, body 1 dòng "Placeholder for <folder> content"

**Acceptance.**
- [ ] 11 thư mục cấp 1 tồn tại
- [ ] 5 sub-folders tồn tại (`functional/`, `non-functional/`, `state-machines/`, `adrs/`, `collections/`)
- [ ] Mỗi thư mục có ít nhất 1 file để git không bỏ qua

**Depends-on.** S1.T1

**Resolves.** R1.1, R1.2

**Touches design.** D10

### S1.T3 — id-naming.md với toàn bộ regex

**What.** Định nghĩa regex cho 7 ID types + worked examples + allocation rules (stride-10 vs dense per D1).

**Where.** `docs/09-governance/id-naming.md`

**How.**
- Front-matter: `status: active`, `language: en`
- 7 sections, mỗi section một ID type với:
  - Pattern (English): e.g., `^R-(ADM|FRM|RTL|DRV|SHM|GST)-\d{3}$`
  - Allocation rule: stride-10 (R-*, NFR-*, BR-*) hoặc dense (STM-*, API-*, ADR-*, GAP-*)
  - 2 valid examples + 2 invalid examples
- Section "Insertion Rule": cấp next free number, không renumber
- Section "Cell Grammar" cho RBAC matrix per D3: `^conditional:(BR-[A-Z]+-\d{3})(&BR-[A-Z]+-\d{3})*$`
- Section "File Naming": `^[a-z0-9][a-z0-9-]*\.md$` (kebab-case)

**Acceptance.**
- [ ] 7 regex blocks, mỗi cái có 2 valid + 2 invalid examples
- [ ] Insertion rule mô tả stride-10 với ví dụ R-FRM-031 chèn giữa 030-040
- [ ] RBAC cell grammar có ví dụ `conditional:BR-FRM-010&BR-FRM-020`

**Depends-on.** S1.T2

**Resolves.** R2.1, R2.2, R2.7, R2.10

**Touches design.** D1, D3, D7

### S1.T4 — doc-change-policy.md

**What.** Quy tắc sửa, deprecate, supersede tài liệu + Brief revision protocol.

**Where.** `docs/09-governance/doc-change-policy.md`

**How.**
- Front-matter: `status: active`, `language: vi`
- Sections: `## Adding IDs`, `## Deprecating IDs`, `## Superseding IDs`, `## Brief Revision Protocol` (5 bước per D2), `## Schema Change Procedure`, `## ADR Lifecycle` (proposed → accepted | rejected; accepted → superseded only)
- Quy tắc explicit: "GAP open >1 release cycle without owner = escalation in PR review"

**Acceptance.**
- [ ] 6 sections tồn tại
- [ ] Brief Revision Protocol có 5 numbered steps khớp D2
- [ ] ADR lifecycle có 4 status states với transitions

**Depends-on.** S1.T3

**Resolves.** R2.8, R2.10, R10.5, R12.2, R15.1

**Touches design.** D2, D9

### S1.T5 — Scaffold 00-overview/ files

**What.** Tạo `vision.md`, `glossary.md`, `stakeholders.md`, `migration-scope.md`, `non-goals.md` với front-matter và section skeleton.

**Where.** `docs/00-overview/{vision,glossary,stakeholders,migration-scope,non-goals}.md`

**How.**
- Mỗi file: front-matter D9 + H1 + H2 placeholder sections
- `migration-scope.md` chứa in-scope list (R13.1) + out-of-scope list (R13.2) + tham chiếu follow-up specs `docs-openapi-completion`, `docs-quality-gates-impl`, `frontend-rbac-binding`
- `non-goals.md` ghi explicit "phase requirements/design không chạm `backend/`, `frontend/`, `blockchain/contracts/`, `deploy/`, `.github/workflows/`" + 2 ngoại lệ tasks-phase
- `glossary.md` placeholder, sẽ bổ sung khi `02-domain/ubiquitous-language.md` ra
- `stakeholders.md` liệt kê 6 vai trò + trách nhiệm
- `vision.md` 1 paragraph mission + link sang context.md

**Acceptance.**
- [ ] 5 files tồn tại với front-matter hợp lệ
- [ ] migration-scope.md có 2 lists (in-scope, out-of-scope) khớp R13.1/R13.2
- [ ] non-goals.md liệt kê 5 forbidden paths + 2 allowed exceptions
- [ ] stakeholders.md có 6 roles

**Depends-on.** S1.T2

**Resolves.** R13.1, R13.2, R13.4, R16.1, R16.2

**Touches design.** D10

### S1.T6 — Scaffold 01-requirements/ placeholders

**What.** Tạo placeholder cho `traceability-matrix.md` và 6 functional R-* files + 5 NFR files với front-matter only (nội dung sẽ điền Stage 3).

**Where.** `docs/01-requirements/traceability-matrix.md`, `docs/01-requirements/functional/{_brief-source,admin,farm-manager,retailer,driver,shipping-manager,guest}.md`, `docs/01-requirements/non-functional/{scalability,performance,reliability,security,blockchain}.md`

**How.**
- Mỗi file: front-matter D9 schema cho R-* hoặc NFR-*
- Body chỉ chứa H1 + 1 H2 placeholder "## Pending Stage 3"
- `_brief-source.md` chứa front-matter + H1 + comment "Brief content prepended in S3.T1"
- `traceability-matrix.md` chứa front-matter + H1 + bảng header trống

**Acceptance.**
- [ ] 13 files tồn tại
- [ ] Front-matter mọi file đúng schema D9 cho loại tương ứng
- [ ] R-* files có `ids: []` (sẽ điền Stage 3); NFR files có `status: planned`

**Depends-on.** S1.T2

**Resolves.** R3.1, R4.1, R11.1

**Touches design.** D9, D10

### S1.T7 — Scaffold 02-domain/ + state-machines/

**What.** Placeholder cho 4 domain files + 5 state machine files.

**Where.** `docs/02-domain/{ubiquitous-language,entities,relationships,business-rules}.md`, `docs/02-domain/state-machines/{shipment,order,season,farm-approval,subscription}.md`

**How.**
- 4 domain files: front-matter + H1 + H2 sections placeholder
- 5 state machine files: front-matter D9 STM-* schema (entity, valid-end-states là placeholder `[]`) + H2 sections `## States`, `## Transitions`, `## Diagram`, `## Valid End States`

**Acceptance.**
- [ ] 9 files tồn tại
- [ ] State machine files có 4 H2 sections theo D11

**Depends-on.** S1.T2

**Resolves.** R5.1, R6.1

**Touches design.** D9, D10, D11

### S1.T8 — Scaffold 03-architecture/, 05-api/, 06-security/, 07-operations/, 08-testing/

**What.** Placeholder cho mọi file còn lại trong 5 folders này.

**Where.** Toàn bộ files D10 mapping cho 03-, 05-, 06-, 07-, 08- folders trừ ADRs (S1.T11)

**How.**
- 03-architecture/: `context.md`, `container.md`, `component.md`, `deployment.md`, `tech-stack.md`
- 05-api/: `conventions.md`, `authentication.md`, `openapi.yaml` (placeholder với `openapi: 3.0.3`, `info.title: BICAP API`, `info.version: 0.1.0`, paths trống), `collections/README.md`
- 06-security/: `rbac-matrix.md`, `threat-model.md`, `key-management.md`
- 07-operations/: `runbook-deploy.md`, `runbook-backup.md`, `observability.md`
- 08-testing/: `strategy.md`, `coverage-by-requirement.md`
- Mỗi file: front-matter D9 + H1 + H2 placeholder

**Acceptance.**
- [ ] 16 files tồn tại với front-matter hợp lệ
- [ ] `openapi.yaml` parseable bởi YAML parser

**Depends-on.** S1.T2

**Resolves.** R9.1, R10.1

**Touches design.** D9, D10, D12

### S1.T9 — Seed gap-register.md với 7 entries

**What.** Tạo `09-governance/gap-register.md` với 7 GAP entries từ D15 + range reservation note.

**Where.** `docs/09-governance/gap-register.md`

**How.**
- Front-matter D9: `title: Gap Register`, `status: active`, `language: vi`
- H1 + paragraph giải thích range reservation: GAP-001..050 cho blueprint creation, GAP-051+ cho runtime-discovered
- Bảng 9 columns: `id | title | description | status | owner | target-date | related-r | related-br | related-stm`
- 7 rows từ D15: GAP-001 (smart-contract deploy mismatch, open), GAP-002 (anchor strategy, open), GAP-003..006 (NFR placeholders, open), GAP-007 (IoT cadence, resolved)
- Note dưới bảng: "GAP-008..GAP-050 reserved for entries from `brief-code-drift-report.md`"

**Acceptance.**
- [ ] 7 rows trong bảng
- [ ] GAP-007 status = resolved (vì D4 đã chốt)
- [ ] Range reservation note hiển thị

**Depends-on.** S1.T3

**Resolves.** R12.3, R12.4, R15.3

**Touches design.** D15

### S1.T10 — Module template `04-modules/_TEMPLATE.md`

**What.** Tạo template module file theo design Reference Section A.

**Where.** `docs/04-modules/_TEMPLATE.md`

**How.**
- Copy nguyên format từ design Reference Section A
- Front-matter D9 module schema với placeholder values
- 7 H2 sections: `Purpose`, `Owns`, `Implements`, `Depends-on`, `API surface`, `Tests`, `Open gaps`

**Acceptance.**
- [ ] File tồn tại
- [ ] 7 H2 sections theo R8.2
- [ ] Front-matter có đủ required keys của module schema D9

**Depends-on.** S1.T3

**Resolves.** R8.2

**Touches design.** D9, Reference Section A

### S1.T11 — ADR template `03-architecture/adrs/_TEMPLATE.md`

**What.** Tạo template ADR theo design Reference Section B.

**Where.** `docs/03-architecture/adrs/_TEMPLATE.md`

**How.**
- Copy format từ design Reference Section B
- Front-matter D9 ADR schema (id, title, status, date, decision, context, consequences, supersedes, superseded-by)
- 5 H2 sections: `Status`, `Context`, `Decision`, `Consequences`, `Alternatives Considered`

**Acceptance.**
- [ ] File tồn tại với front-matter ADR schema
- [ ] 5 H2 sections theo R10.6

**Depends-on.** S1.T3

**Resolves.** R10.6

**Touches design.** D9, Reference Section B

### S1.T12 — Manual front-matter validation pass

**What.** Đọc tuần tự mọi file vừa tạo Stage 1 và xác minh front-matter hợp lệ theo D9.

**Where.** Toàn bộ `docs/**/*.md` đã tạo trong S1.T1..T11

**How.**
- Liệt kê mọi file
- Với mỗi file: kiểm tra (1) front-matter mở/đóng `---`, (2) required fields đủ, (3) `last-reviewed` ISO format, (4) `status` trong allowed values cho file type, (5) `language` ∈ `vi|en|bilingual`
- Ghi violations vào `09-governance/gap-register.md` nếu có (range GAP-051+)

**Acceptance.**
- [ ] Mọi file pass 5 checks
- [ ] Không có violation nào uncatched

**Depends-on.** S1.T1, S1.T2, S1.T3, S1.T4, S1.T5, S1.T6, S1.T7, S1.T8, S1.T9, S1.T10, S1.T11

**Resolves.** R2.3, R2.4, R2.5, R2.6, R2.7

**Touches design.** D9

---

## Stage 2 — Module Migration

**Goal.** Port 16 module docs cũ → 22 module files mới theo template + module index.

**Unlocks.** Ownership map cho R-*/BR-*/STM-*; mỗi ID rồi sẽ thuộc đúng 1 module.

**Stage DoD.**
- [ ] 22 module files dưới `04-modules/` populated với content từ source + 7 H2 sections
- [ ] `04-modules/README.md` thay thế `MODULES.md` cũ làm module index
- [ ] Mỗi module có front-matter `ids: []` với placeholders chờ Stage 3-4 điền
- [ ] `Implements` section có FQN class lists derived từ source nếu có
- [ ] Cross-module `Depends-on` hợp lệ (không reference module không tồn tại)

### S2.T1 — Module index `04-modules/README.md`

**What.** Tạo module index thay thế `docs/architecture/MODULES.md`.

**Where.** `docs/04-modules/README.md`

**How.**
- Front-matter D9 module schema (ids: [], depends-on: [])
- Bảng 22 modules: `module | package | role-workspaces | doc-link`
- Note "Migrated from `docs/architecture/MODULES.md`; legacy path becomes redirect stub in Stage 6"

**Acceptance.**
- [ ] 22 rows trong bảng
- [ ] Mỗi row link tới `<module>.md` tồn tại

**Depends-on.** S1.T12

**Resolves.** R8.1, R8.4

**Touches design.** D8, D10

### S2.T2 [parallel] — Migrate admin module

**What.** Port `docs/modules/admin.md` → `docs/04-modules/admin.md` template mới.

**Where.** `docs/04-modules/admin.md`

**How.**
- Front-matter module schema, `language: bilingual`, `depends-on: [user, farm, retailer, logistics, product, content, analytics, vechain]`
- Carve sections từ source: Purpose, Implements (controllers/services/entities/pages), Depends-on
- `Owns: []` placeholder (sẽ điền R-ADM-* Stage 3, BR-ADM-* Stage 4)
- `API surface: []` placeholder (Stage 5)
- `Tests: []` placeholder
- `Open gaps: [GAP-001]` (smart-contract deploy mismatch — declared per R3.7)

**Acceptance.**
- [ ] 7 H2 sections tồn tại
- [ ] FQN class names trong Implements khớp `backend/src/main/java/com/bicap/modules/admin/`
- [ ] GAP-001 được link trong Open gaps

**Depends-on.** S2.T1

**Resolves.** R8.1, R8.2, R8.3, R8.5, R3.7

**Touches design.** D9, D10

### S2.T3 [parallel] — Migrate analytics module

**What.** Carve from `docs/modules/analytics-discovery.md` (analytics half) → `docs/04-modules/analytics.md`.

**Where.** `docs/04-modules/analytics.md`

**How.**
- Module template, `depends-on: [common]`
- Implements: `modules/analytics/` package
- `Owns: []`, `Tests: []`, `Open gaps: []` placeholder

**Acceptance.**
- [ ] 7 H2 sections
- [ ] Package path match `backend/.../modules/analytics/`

**Depends-on.** S2.T1

**Resolves.** R8.1, R8.2

**Touches design.** D10

### S2.T4 [parallel] — Migrate auth module

**What.** Port `docs/modules/auth.md` → `docs/04-modules/auth.md`.

**Where.** `docs/04-modules/auth.md`

**How.**
- Module template, `depends-on: [user, common]`
- Implements: `AuthController`, `AuthService`, `JwtTokenProvider`, `JwtAuthenticationFilter`
- API surface placeholder: `[API-AUT-001..005]` (S5.T4)

**Acceptance.**
- [ ] 7 H2 sections
- [ ] FQN classes của auth module

**Depends-on.** S2.T1

**Resolves.** R8.1, R8.2

**Touches design.** D10

### S2.T5 [parallel] — Migrate batch module

**What.** Carve from `docs/modules/product-batch.md` (batch half).

**Where.** `docs/04-modules/batch.md`

**How.**
- Module template, `depends-on: [product, season, vechain]`
- Implements: `modules/batch/` package

**Acceptance.**
- [ ] 7 H2 sections

**Depends-on.** S2.T1

**Resolves.** R8.1

**Touches design.** D10

### S2.T6 [parallel] — Migrate common module

**What.** Tạo doc cho cross-cutting infrastructure module.

**Where.** `docs/04-modules/common.md`

**How.**
- Module template, `depends-on: []`
- Implements: `modules/common/` (notifications, audit, etc.) + `core/` packages

**Acceptance.**
- [ ] 7 H2 sections

**Depends-on.** S2.T1

**Resolves.** R8.1

**Touches design.** D10

### S2.T7 [parallel] — Migrate content module

**What.** Carve from `docs/modules/content-media.md` (content half).

**Where.** `docs/04-modules/content.md`

**How.**
- Module template, `depends-on: [media, common]`
- Implements: `modules/content/` package

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T8 [parallel] — Migrate contract module

**What.** Carve from `docs/modules/listing-order-contract.md` (contract part).

**Where.** `docs/04-modules/contract.md`

**How.** Module template, `depends-on: [farm, retailer, order]`. Implements: `modules/contract/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T9 [parallel] — Migrate discovery module

**What.** Carve from `docs/modules/analytics-discovery.md` (discovery half).

**Where.** `docs/04-modules/discovery.md`

**How.** Module template, `depends-on: [listing, product, content]`. Implements: `modules/discovery/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T10 [parallel] — Migrate farm module

**What.** Port `docs/modules/farm.md` → `docs/04-modules/farm.md`.

**Where.** `docs/04-modules/farm.md`

**How.**
- Module template, `depends-on: [batch, season, listing, contract, shipment, iot, vechain, subscription]`
- Implements: `modules/farm/`

**Acceptance.** 7 H2 sections + FQN khớp `backend/.../modules/farm/`.

**Depends-on.** S2.T1. **Resolves.** R8.1, R8.2. **Touches design.** D10.

### S2.T11 [parallel] — Migrate iot module

**What.** Carve from `docs/modules/traceability-vechain-iot.md` (iot part). Cadence section per D4.

**Where.** `docs/04-modules/iot.md`

**How.**
- Module template, `depends-on: [farm, batch, season, common]`
- Implements: `modules/iot/`
- Body section "## Cadence": 2 trigger rules — on-threshold breach (immediate), scheduled daily summary (07:00 ICT theo timezone farm)
- Body section "## Sequence Diagram": mermaid sequenceDiagram sensor → backend → notification (per D14)
- `Owns: [BR-IOT-010]` placeholder

**Acceptance.**
- [ ] 7 H2 sections + 2 thêm sections (Cadence, Sequence Diagram)
- [ ] BR-IOT-010 listed in Owns

**Depends-on.** S2.T1

**Resolves.** R8.1, R8.2, R3.4

**Touches design.** D4, D14

### S2.T12 [parallel] — Migrate listing module

**What.** Carve from `docs/modules/listing-order-contract.md` (listing part).

**Where.** `docs/04-modules/listing.md`

**How.** Module template, `depends-on: [product, farm, batch]`. Implements: `modules/listing/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T13 [parallel] — Migrate logistics module

**What.** Carve from `docs/modules/logistics-shipment-driver.md` (logistics manager + driver part).

**Where.** `docs/04-modules/logistics.md`

**How.** Module template, `depends-on: [shipment, common]`. Implements: `modules/logistics/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T14 [parallel] — Migrate media module

**What.** Carve from `docs/modules/content-media.md` (media half).

**Where.** `docs/04-modules/media.md`

**How.** Module template, `depends-on: [common]`. Implements: `modules/media/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T15 [parallel] — Migrate order module

**What.** Carve from `docs/modules/listing-order-contract.md` (order part).

**Where.** `docs/04-modules/order.md`

**How.**
- Module template, `depends-on: [listing, retailer, farm, shipment, contract]`
- Implements: `modules/order/`
- `Owns: [STM-ORD-T01..T07]` placeholder (Stage 4)

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T16 [parallel] — Migrate product module

**What.** Carve from `docs/modules/product-batch.md` (product half).

**Where.** `docs/04-modules/product.md`

**How.** Module template, `depends-on: [common]`. Implements: `modules/product/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T17 [parallel] — Migrate retailer module

**What.** Port `docs/modules/retailer.md` → `docs/04-modules/retailer.md`.

**Where.** `docs/04-modules/retailer.md`

**How.**
- Module template, `depends-on: [listing, order, contract, shipment, product, vechain]`
- Implements: `modules/retailer/`

**Acceptance.** 7 H2 sections + FQN khớp `backend/.../modules/retailer/`.

**Depends-on.** S2.T1. **Resolves.** R8.1, R8.2. **Touches design.** D10.

### S2.T18 [parallel] — Migrate season module

**What.** Carve from `docs/modules/season-cultivation.md`.

**Where.** `docs/04-modules/season.md`

**How.**
- Module template, `depends-on: [farm, batch, vechain, iot]`
- Implements: `modules/season/`
- `Owns: [STM-SEA-T01..]` placeholder

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T19 [parallel] — Migrate shipment module

**What.** Carve from `docs/modules/logistics-shipment-driver.md` (shipment part).

**Where.** `docs/04-modules/shipment.md`

**How.**
- Module template, `depends-on: [order, logistics, farm, retailer, media]`
- Implements: `modules/shipment/`
- `Owns: [STM-SHP-T01..T07]` placeholder

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T20 [parallel] — Migrate subscription module

**What.** Carve from `docs/modules/subscription-payment.md`.

**Where.** `docs/04-modules/subscription.md`

**How.**
- Module template, `depends-on: [farm, common]`
- Implements: `modules/subscription/`
- `Owns: [STM-SUB-T01..]` placeholder

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T21 [parallel] — Migrate traceability module

**What.** Carve from `docs/modules/traceability-vechain-iot.md` (traceability core).

**Where.** `docs/04-modules/traceability.md`

**How.** Module template, `depends-on: [vechain, iot, batch, season, listing, shipment]`. Implements: `modules/traceability/` hoặc cross-cutting facade.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T22 [parallel] — Migrate user module

**What.** Port `docs/modules/user-rbac.md` → `docs/04-modules/user.md`.

**Where.** `docs/04-modules/user.md`

**How.** Module template, `depends-on: [auth, common]`. Implements: `modules/user/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T23 [parallel] — Migrate vechain module

**What.** Carve from `docs/modules/traceability-vechain-iot.md` (vechain part).

**Where.** `docs/04-modules/vechain.md`

**How.** Module template, `depends-on: [common]`. Implements: `modules/vechain/`.

**Acceptance.** 7 H2 sections.

**Depends-on.** S2.T1. **Resolves.** R8.1. **Touches design.** D10.

### S2.T24 — Cross-reference validation

**What.** Quét toàn bộ `04-modules/*.md` `depends-on` field, đảm bảo mỗi module name reference tồn tại.

**Where.** All 22 module files

**How.**
- Đọc front-matter mọi module
- Build set tên modules
- Verify mọi giá trị `depends-on` thuộc set
- Báo cáo orphan references

**Acceptance.**
- [ ] Không có module reference orphan
- [ ] Cross-link giữa modules hợp lệ

**Depends-on.** S2.T2..S2.T23

**Resolves.** R8.4

**Touches design.** D10

---

## Stage 3 — Brief Intake

**Goal.** Ingest Brief verbatim, sinh R-* per role, phát hiện drift Brief vs code.

**Unlocks.** Scope clarity cho Stage 4 cross-references.

**Stage DoD.**
- [ ] `_brief-source.md` chứa Brief verbatim với section `## Brief Revision 2026-05-16`
- [ ] 6 R-* files có ít nhất 1 R-* per Brief bullet
- [ ] 5 NFR files seeded với placeholders + GAP linkages
- [ ] `brief-code-drift-report.md` có 3 sections (BRIEF-SILENT, CODE-MISSING, CONTRADICTION) hoặc empty với note
- [ ] gap-register.md có thêm GAP-008..N cho drift items

### S3.T1 — `_brief-source.md` với Brief verbatim

**What.** Ghi Brief nguyên văn từ user vào `_brief-source.md`. Cấm paraphrase.

**Where.** `docs/01-requirements/functional/_brief-source.md`

**How.**
- Front-matter: `title: BICAP Project Brief — Verbatim Source`, `ids: []`, `status: active`, `last-reviewed: 2026-05-16`, `language: vi`
- H1: `BICAP Project Brief`
- Quote block: "File này là nguồn nguyên thuỷ. Cấm sửa nội dung revision đã ban hành."
- H2: `## Brief Revision 2026-05-16`
- 7 H3 sections theo Brief: `### Quản trị viên (Ứng dụng Web)`, `### Quản lý Trang trại (Ứng dụng Web)`, `### Nhà bán lẻ (Ứng dụng Web)`, `### Tài xế vận chuyển (Ứng dụng Di động)`, `### Quản lý Vận chuyển (Ứng dụng Web)`, `### Khách (Ứng dụng Web/Ứng dụng Di động)`, `### Yêu cầu phi chức năng`
- Mỗi section: copy nguyên văn các bullet từ Brief (Admin 5, Farm 21, Retailer 19, Driver 6, Shipping Manager 9, Guest 3, NFR 3)

**Acceptance.**
- [ ] File tồn tại với Brief Revision 2026-05-16
- [ ] 7 H3 sections đầy đủ
- [ ] Tổng 66 bullets (5+21+19+6+9+3+3)
- [ ] Không bullet nào bị paraphrase

**Depends-on.** S2.T24

**Resolves.** R3.2, R15.1, R15.2

**Touches design.** D2

### S3.T2 — R-ADM-* (Admin functional requirements)

**What.** Sinh R-ADM-010..050 từ 5 Admin bullets per stride-10 (D1).

**Where.** `docs/01-requirements/functional/admin.md`

**How.**
- Front-matter: `ids: [R-ADM-010, R-ADM-020, R-ADM-030, R-ADM-040, R-ADM-050]`, `status: active`, `language: vi`, `brief-revision: 2026-05-16`
- Front-matter declare: `gap: GAP-001` (smart-contract deploy mismatch per R3.7)
- 5 H2 sections, mỗi cái 1 R-ADM-*
- Mỗi R-ADM có 7 fields: id, title (Vietnamese), role, source quote (verbatim từ `_brief-source.md`), acceptance criteria (EARS English keywords + Vietnamese predicate per D7), status, related-br/stm/api (placeholder), tests (placeholder)
- R-ADM-050 (smart contract deploy) có note "[CONTRADICTION: see GAP-001]"

**Acceptance.**
- [ ] 5 R-ADM-* tồn tại với 7 required fields
- [ ] Acceptance criteria mỗi R-* dùng EARS pattern (≥2 ACs per R-*)
- [ ] R-ADM-050 link tới GAP-001

**Depends-on.** S3.T1

**Resolves.** R3.1, R3.3, R3.4, R3.7, R15.2

**Touches design.** D1, D2, D7, D9

### S3.T3 — R-FRM-* (Farm Manager functional requirements)

**What.** Sinh R-FRM-010..210 từ 21 Farm Manager bullets per stride-10.

**Where.** `docs/01-requirements/functional/farm-manager.md`

**How.**
- Front-matter D9 với `ids` 21 entries từ R-FRM-010 tới R-FRM-210
- 21 H2 sections, mỗi cái 1 R-FRM-*
- Bullet "Tạo mùa vụ canh tác (thông tin được lưu vào blockchain)" → R-FRM với `related-br: [BR-SEA-010, BR-FRM-020]` placeholder
- Bullet "Nhận thông báo về nhiệt độ, độ ẩm, độ pH trong ngày" → R-FRM với `related-br: [BR-IOT-010]` placeholder
- Mọi blockchain-write bullet (4 bullets) có round-trip AC per R3.8

**Acceptance.**
- [ ] 21 R-FRM-* với 7 fields
- [ ] 4 R-FRM blockchain-write có round-trip AC
- [ ] IoT alert R-FRM link BR-IOT-010

**Depends-on.** S3.T1

**Resolves.** R3.1, R3.3, R3.4, R3.8

**Touches design.** D1, D4, D7

### S3.T4 — R-RTL-* (Retailer functional requirements)

**What.** Sinh R-RTL-010..190 từ 19 Retailer bullets.

**Where.** `docs/01-requirements/functional/retailer.md`

**How.**
- Front-matter D9 với 19 R-RTL-* IDs
- Bullet "Cập nhật Giấy phép Kinh doanh và thông tin trang trại" trong context Retailer là ambiguous (likely Retailer profile, not Farm) — annotate `[AMBIGUITY: 'farm info' likely retailer profile, not farm]` per R15.4
- Bullet "Nhận thông báo từ người vận chuyển" duplicated in Brief (xuất hiện 2 lần trong Retailer section) — preserve cả 2 R-* với AMBIGUITY annotation
- QR scan bullet → R-RTL với `related-br: [BR-TRC-010]`

**Acceptance.**
- [ ] 19 R-RTL-* với 7 fields
- [ ] 2 ambiguity annotations (business license/farm info; duplicated shipper notification)
- [ ] QR scan R-RTL có round-trip AC

**Depends-on.** S3.T1

**Resolves.** R3.1, R3.3, R3.5, R3.8, R15.4

**Touches design.** D1, D7

### S3.T5 — R-DRV-* (Driver functional requirements)

**What.** Sinh R-DRV-010..060 từ 6 Driver bullets.

**Where.** `docs/01-requirements/functional/driver.md`

**How.**
- Front-matter D9 với 6 R-DRV-* IDs
- Bullet "Quét mã QR để theo dõi thông tin sản phẩm khi hoàn tất đến trang trại" → R-DRV với round-trip AC

**Acceptance.**
- [ ] 6 R-DRV-* với 7 fields
- [ ] QR scan R-DRV có round-trip AC

**Depends-on.** S3.T1

**Resolves.** R3.1, R3.3, R3.8

**Touches design.** D1, D7

### S3.T6 — R-SHM-* (Shipping Manager functional requirements)

**What.** Sinh R-SHM-010..090 từ 9 Shipping Manager bullets.

**Where.** `docs/01-requirements/functional/shipping-manager.md`

**How.**
- Front-matter D9 với 9 R-SHM-* IDs
- Bullet "Tạo chuyến hàng cho mỗi đơn hàng thành công" → R-SHM với `related-stm: [STM-SHP-T01]` placeholder
- Bullet "Hủy chuyến hàng đã tạo" → R-SHM với `related-stm: [STM-SHP-T07]`
- Bullet "Quản lý phương tiện vận chuyển (CRUD)" → 1 R-SHM với 4 ACs (one per CRUD action)

**Acceptance.**
- [ ] 9 R-SHM-* với 7 fields
- [ ] CRUD bullets có ≥4 ACs

**Depends-on.** S3.T1

**Resolves.** R3.1, R3.3

**Touches design.** D1, D7

### S3.T7 — R-GST-* (Guest functional requirements)

**What.** Sinh R-GST-010..030 từ 3 Guest bullets.

**Where.** `docs/01-requirements/functional/guest.md`

**How.**
- Front-matter D9 với 3 R-GST-* IDs
- Bullet "search và filter" → R-GST với filter dimensions (origin, product type, certification, availability) liệt kê trong AC

**Acceptance.**
- [ ] 3 R-GST-* với 7 fields
- [ ] Filter dimensions liệt kê đầy đủ

**Depends-on.** S3.T1

**Resolves.** R3.1, R3.3

**Touches design.** D1, D7

### S3.T8 — Seed 5 NFR files với placeholders

**What.** Điền 5 NFR files với placeholders `[TBD: target value]` link GAP-003..006 + NFR-SEC link rbac-matrix.md.

**Where.** `docs/01-requirements/non-functional/{scalability,performance,reliability,security,blockchain}.md`

**How.**
- `scalability.md`: NFR-SCL-010 quote Brief AWS/GCP/Docker/Redis. Metrics: `[TBD: target user volume, peak RPS, autoscaling thresholds]` link GAP-003. Status: `planned`.
- `performance.md`: NFR-PRF-010 placeholder p95 API latency, p95 page load. Link GAP-004. Status: `planned`.
- `reliability.md`: NFR-REL-010 placeholder uptime, RPO, RTO. Link GAP-005. Status: `planned`.
- `security.md`: NFR-SEC-010 enforcing RBAC for 6 roles, link `06-security/rbac-matrix.md`. Status: `active` (rule rõ, không TBD).
- `blockchain.md`: NFR-BC-010 quote Brief VeChainThor concurrency. Metrics: `[TBD: TPS, confirmation latency p95, IoT batch size]` link GAP-006. Status: `planned`.

**Acceptance.**
- [ ] 5 files có ≥1 NFR-* mỗi file
- [ ] 4 files (scl/prf/rel/bc) có status `planned` + GAP linkage
- [ ] security.md link rbac-matrix.md
- [ ] No vague terms trong NFR active (R4.3)

**Depends-on.** S1.T9

**Resolves.** R4.1, R4.2, R4.3, R4.4, R4.5, R4.6, R4.7

**Touches design.** D9, D15

### S3.T9 — Brief-vs-code drift discovery

**What.** Chạy thủ công 4-step procedure D6, sinh `brief-code-drift-report.md`, append GAP-008..N.

**Where.** `docs/00-overview/brief-code-drift-report.md`, append rows vào `09-governance/gap-register.md`

**How.**
- Step 1: grep `@(Get|Post|Put|Patch|Delete)Mapping|@RequestMapping` trong `backend/src/main/java/com/bicap/modules/*/controller/`
- Step 1b: liệt kê routes trong `frontend/src/routes/` và pages trong `frontend/src/pages/`
- Step 1c: grep `@Scheduled` cho cron jobs
- Step 2: cross-reference mỗi path với Brief bullet
- Step 3: classify thành 3 groups
- Step 4: ghi vào file với 3 H2 sections + bảng `code-path | role-context | proposed-action`
- Mỗi entry → 1 GAP-* mới (range GAP-008..050)

**Acceptance.**
- [ ] File có 3 H2 sections (BRIEF-SILENT, CODE-MISSING, CONTRADICTION)
- [ ] Mỗi entry có proposed-action không rỗng
- [ ] gap-register.md được append với GAP-008..N
- [ ] 3 sections trống được ghi note "no entries found" thay vì bỏ trống

**Depends-on.** S3.T2..S3.T7

**Resolves.** R3.6, R12.10, R15.5

**Touches design.** D6, D15

---

## Stage 4 — Glue (Domain + RBAC)

**Goal.** Khoá domain definitions cross-referenced bởi R-*: state machines, RBAC matrix, business rules, ubiquitous language, entities, relationships.

**Unlocks.** Mọi `related-br`, `related-stm` reference trong R-* resolve được.

**Stage DoD.**
- [ ] 5 state machine files đầy đủ (canonical table + mermaid)
- [ ] `business-rules.md` chứa BR-* atomic per R5.5
- [ ] `rbac-matrix.md` không có cell rỗng; mọi conditional reference BR-* tồn tại
- [ ] `ubiquitous-language.md` resolve Season/Mùa vụ canonical
- [ ] `entities.md` + `relationships.md` đủ cross-module ER

### S4.T1 — STM-SHP shipment state machine

**What.** Điền `02-domain/state-machines/shipment.md` per D11 worked example.

**Where.** `docs/02-domain/state-machines/shipment.md`

**How.**
- Front-matter D9 STM-* schema: `entity: Shipment`, `valid-end-states: [DELIVERED, CONFIRMED, CANCELLED]`, `ids: [STM-SHP-T01..T07]`
- 4 H2 sections: `States`, `Transitions`, `Diagram`, `Valid End States`
- Transitions table: 7 rows STM-SHP-T01..T07 per D11 example
- Diagram: mermaid `stateDiagram-v2` per D11
- Cross-reference back: update `04-modules/shipment.md` Owns section với 7 STM IDs

**Acceptance.**
- [ ] 7 transitions với 7 columns
- [ ] T07 có multi-value `from-state`
- [ ] Mermaid diagram render được
- [ ] `04-modules/shipment.md` Owns updated

**Depends-on.** S3.T9

**Resolves.** R6.1, R6.2, R6.3, R6.4, R6.6

**Touches design.** D9, D11

### S4.T2 — STM-ORD order state machine

**What.** Điền `02-domain/state-machines/order.md` với states cho order lifecycle.

**Where.** `docs/02-domain/state-machines/order.md`

**How.**
- Front-matter STM schema, `entity: Order`, `valid-end-states: [DELIVERED, CANCELLED, REFUNDED]`
- States từ existing code (listing-order-contract.md): PENDING, DEPOSIT_PAID, ACCEPTED, REJECTED, IN_FULFILLMENT, DELIVERED, CANCELLED, REFUNDED
- Transitions T01..T08 covering: create → PENDING (retailer), deposit → DEPOSIT_PAID (retailer), accept/reject by farm, fulfill → IN_FULFILLMENT, ship complete → DELIVERED, cancel branch
- Mermaid diagram per D14

**Acceptance.**
- [ ] ≥7 transitions với 7 columns
- [ ] CANCELLED reachable từ multiple from-states
- [ ] `04-modules/order.md` Owns updated

**Depends-on.** S3.T9

**Resolves.** R6.1, R6.2, R6.3

**Touches design.** D11

### S4.T3 — STM-SEA season state machine

**What.** Điền `02-domain/state-machines/season.md`.

**Where.** `docs/02-domain/state-machines/season.md`

**How.**
- Front-matter, `entity: Season`, `valid-end-states: [EXPORTED, ARCHIVED]`
- States: DRAFT, COMMITTED (sau blockchain commit), ACTIVE, EXPORTED, ARCHIVED
- Transitions T01..T05: create → DRAFT, blockchain commit success → COMMITTED, start growing → ACTIVE, export → EXPORTED (gen QR), archive → ARCHIVED
- Failed blockchain → STM-SEA-T02-FAIL: stay in DRAFT, log GAP-* if pattern repeats
- Mermaid diagram

**Acceptance.**
- [ ] ≥5 transitions
- [ ] Blockchain failure case ghi nhận
- [ ] `04-modules/season.md` Owns updated

**Depends-on.** S3.T9

**Resolves.** R6.1, R6.2, R6.3

**Touches design.** D11

### S4.T4 — STM-FRMAPP farm approval state machine

**What.** Điền `02-domain/state-machines/farm-approval.md` (inferred từ Admin Brief "phê duyệt/từ chối farm").

**Where.** `docs/02-domain/state-machines/farm-approval.md`

**How.**
- Front-matter, `entity: FarmApplication`, `valid-end-states: [APPROVED, REJECTED, REVOKED]`
- States: PENDING, APPROVED, REJECTED, SUSPENDED, REINSTATED, REVOKED
- Transitions: register → PENDING (farm self), admin approve → APPROVED, admin reject → REJECTED, suspend → SUSPENDED (admin), reinstate → REINSTATED → APPROVED, revoke → REVOKED
- Mermaid diagram

**Acceptance.**
- [ ] ≥6 transitions
- [ ] All transitions triggered by admin (except register by farm)
- [ ] `04-modules/admin.md` Owns updated với STM-FRMAPP-T*

**Depends-on.** S3.T9

**Resolves.** R6.1, R6.2, R6.3

**Touches design.** D11

### S4.T5 — STM-SUB subscription state machine

**What.** Điền `02-domain/state-machines/subscription.md`.

**Where.** `docs/02-domain/state-machines/subscription.md`

**How.**
- Front-matter, `entity: FarmSubscription`, `valid-end-states: [EXPIRED, CANCELLED]`
- States: PENDING_PAYMENT, ACTIVE, EXPIRING_SOON, EXPIRED, CANCELLED, GRACE_PERIOD
- Transitions: purchase → PENDING_PAYMENT, payment confirmed → ACTIVE, near expiry → EXPIRING_SOON, expire → EXPIRED, manual cancel → CANCELLED, renew during grace → ACTIVE
- Mermaid

**Acceptance.**
- [ ] ≥6 transitions
- [ ] `04-modules/subscription.md` Owns updated

**Depends-on.** S3.T9

**Resolves.** R6.1, R6.2, R6.3

**Touches design.** D11

### S4.T6 — business-rules.md với BR-* atomic

**What.** Soạn `02-domain/business-rules.md` với BR-* nguyên tử per R5.5.

**Where.** `docs/02-domain/business-rules.md`

**How.**
- Front-matter D9 BR file schema
- Bảng / list BR-* với fields: id, domain, statement (vi), rationale, related-r, related-stm
- Domains tối thiểu: ORD, SHP, SEA, IOT, FRM, SUB, FRMAPP, RTL, AUT, TRC
- Seed BR cụ thể:
  - **BR-FRM-010**: User là owner của farm (referenced D3)
  - **BR-FRM-020**: Farm có active subscription (D3)
  - **BR-FRM-030**: Farm không bị admin tạm khóa (D3)
  - **BR-IOT-010**: Hệ thống ghi nhận sự kiện vượt ngưỡng → IoTAlert + notification per cadence iot.md (D4)
  - **BR-ORD-010**: Order chỉ được tạo bởi RETAILER với listing tồn tại
  - **BR-ORD-020**: Deposit phải >= deposit_minimum của listing
  - **BR-ORD-030**: Cancel order chỉ hợp lệ trong PENDING hoặc DEPOSIT_PAID
  - **BR-SHP-010..070**: 7 BR-* cho shipment transitions (referenced trong STM-SHP)
  - **BR-SEA-010**: Season create phải có farm owner reference + blockchain commit job
  - **BR-FRMAPP-010**: Approve farm chỉ bởi ADMIN
  - **BR-SUB-010**: Subscription expire không khóa data farm, chỉ khóa write actions
- Mọi statement không chứa AND join 2 thoughts (R5.5 split rule)

**Acceptance.**
- [ ] ≥20 BR-* atomic
- [ ] BR-FRM-010/020/030, BR-IOT-010, BR-SHP-010..070 tồn tại (referenced bởi D3, D4, D11)
- [ ] No statement chứa "AND" join

**Depends-on.** S4.T1, S4.T2, S4.T3, S4.T4, S4.T5

**Resolves.** R5.4, R5.5

**Touches design.** D3, D4, D11

### S4.T7 — ubiquitous-language.md

**What.** Khoá tên gọi domain canonical, resolve Season/Mùa vụ.

**Where.** `docs/02-domain/ubiquitous-language.md`

**How.**
- Front-matter D9, `language: bilingual`
- Bảng: `term | canonical-en | accepted-vi | rejected-synonyms | notes`
- Entries tối thiểu: Season (canonical: Season; vi: Mùa vụ; rejected: Cultivation Season, Crop Cycle), Batch, Listing, Order, Shipment, Farm, Retailer, Driver, Subscription, IoTAlert, Trace, Proof, Deposit
- Per R5.3: Season vs Mùa vụ vs Cultivation Season → 1 canonical + 2 rejected

**Acceptance.**
- [ ] ≥15 terms
- [ ] Season entry có canonical "Season" + reject "Cultivation Season"
- [ ] Mỗi term có rationale 1 dòng

**Depends-on.** S4.T6

**Resolves.** R5.2, R5.3

**Touches design.** D7

### S4.T8 — entities.md

**What.** Liệt kê entities với attributes/invariants/owning-module per R5.6.

**Where.** `docs/02-domain/entities.md`

**How.**
- Front-matter D9
- Mỗi entity 1 H2 section với 4 fields: name, attributes (list), invariants (list), owning-module (link to 04-modules/*)
- Tối thiểu 15 entities: User, Role, Farm, FarmApplication, FarmSubscription, ServicePackage, Batch, Season, Listing, Order, OrderDeposit, Contract, Shipment, Vehicle, Driver (entity), IoTAlert, BlockchainTransaction, Notification, Report

**Acceptance.**
- [ ] ≥15 entities với 4 fields mỗi
- [ ] Mọi `owning-module` link tới module file tồn tại

**Depends-on.** S2.T24

**Resolves.** R5.6

**Touches design.** D10

### S4.T9 — relationships.md

**What.** ER diagram + cross-module relationships.

**Where.** `docs/02-domain/relationships.md`

**How.**
- Front-matter D9
- H2 sections: `## Entity Relationship Diagram` (mermaid `classDiagram` per D14), `## Cross-Module Relationships` (bảng module-to-module dependencies)
- Cardinality notation: 1..1, 1..*, *..*

**Acceptance.**
- [ ] Mermaid classDiagram render được
- [ ] Bảng cross-module relationships có ≥10 rows

**Depends-on.** S4.T8

**Resolves.** R5.1

**Touches design.** D14

### S4.T10 — rbac-matrix.md

**What.** Soạn ma trận RBAC 6 roles × N resources per D3 grammar.

**Where.** `docs/06-security/rbac-matrix.md`

**How.**
- Front-matter D9
- Note đầu file: "Frontend enforces role-shape only; conditional cells enforced server-side. See design D5."
- Note: "AND-only grammar; OR/NOT requires row split or GAP-*"
- Bảng 7 columns: `resource | admin | farm_manager | retailer | shipping_manager | driver | guest`
- ≥30 resource rows phủ đủ:
  - **Farm.***: profile.read, profile.update, publish-listing.create, qr-export.generate, season.create, season.update, batch.create, iot.read
  - **Order.***: create, view-own, cancel, deposit, status-update, history
  - **Shipment.***: create, assign, status-update, cancel, view-own, view-all
  - **Season.***: create, update, export, blockchain-commit
  - **Subscription.***: purchase, view, cancel
  - **Listing.***: browse-public, create, update, delete
  - **Trace.***: public-lookup, qr-scan
  - **Content.***: read-public, create-admin
  - **User.***: self-update, admin-crud
  - **Admin.***: dashboard, governance, smart-contract-deploy (link GAP-001)
- Mỗi cell: `allow | deny | conditional:BR-*(&BR-*)*`
- Default deny cho cell không chắc
- Farm.publish-listing.create cell farm_manager = `conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030` (D3 worked example)

**Acceptance.**
- [ ] ≥30 resource rows
- [ ] Không có cell rỗng
- [ ] Farm.publish-listing.create row khớp D3 worked example
- [ ] Mọi `conditional:BR-*` reference BR-* tồn tại trong business-rules.md (S4.T6)

**Depends-on.** S4.T6

**Resolves.** R7.1, R7.2, R7.3, R7.4, R7.5, R7.6

**Touches design.** D3, D5

---

## Stage 5 — Contract & Decisions

**Goal.** Machine-readable API contract, ADRs, traceability matrix scaffold.

**Unlocks.** Frontend/integrator có hợp đồng + decision rationale; PR template `OpenAPI delta` field meaningful.

**Stage DoD.**
- [ ] `openapi.yaml` validate qua editor.swagger.io với 18 ops
- [ ] 6 ADR files (001..006) tồn tại với front-matter D9
- [ ] ADR-006 đạt status `accepted` (gate cho Stage 6 file moves)
- [ ] traceability-matrix.md có row per Brief bullet với R-*/module/API-* cells filled

### S5.T1 — Architecture docs

**What.** Điền 5 architecture files với mermaid diagrams + tech stack.

**Where.** `docs/03-architecture/{context,container,component,deployment,tech-stack}.md`

**How.**
- `context.md`: C4 level 1 mermaid flowchart per D14 worked example (4 personas, BICAP system, 3 external systems). Migrate mission section từ `docs/architecture/PROJECT_CONTEXT.md`.
- `container.md`: C4 level 2 mermaid với backend, frontend, mysql, redis, vechain, smtp containers. Migrate từ `docs/architecture/ARCHITECTURE.md`.
- `component.md`: C4 level 3 mermaid của backend modules. Migrate từ `docs/architecture/BACKEND_ARCHITECTURE.md`.
- `deployment.md`: Docker compose + K8s deployment description. Migrate từ `docs/architecture/PHASE8_PRODUCTION_HARDENING.md` + cross-reference `deploy/README.md`.
- `tech-stack.md`: pinned versions read từ `backend/pom.xml`, `frontend/package.json`, `blockchain/package.json`. Bảng `component | version | source-of-truth-file`.

**Acceptance.**
- [ ] 5 files tồn tại với front-matter D9
- [ ] context/container/component có mermaid render được
- [ ] tech-stack.md liệt kê ≥15 dependencies với pinned versions

**Depends-on.** S4.T10

**Resolves.** R10.1, R10.2, R10.3

**Touches design.** D14

### S5.T2 — Tạo 6 ADR files

**What.** Author ADR-001..006 với front-matter D9 ADR schema + 5 H2 sections per Reference Section B.

**Where.** `docs/03-architecture/adrs/ADR-001-modular-monolith.md`, `ADR-002-vechainthor-canonical-chain.md`, `ADR-003-jwt-stateless-auth.md`, `ADR-004-deposit-backed-order-flow.md`, `ADR-005-iot-ingest-authority.md`, `ADR-006-agents-md-anchor-strategy.md`

**How.**
- ADR-001 (status: accepted): justify modular monolith vs microservices, reference existing architecture
- ADR-002 (status: accepted): VeChainThor as canonical chain, Hardhat sandbox is internal only
- ADR-003 (status: accepted): JWT stateless auth, refresh token contract
- ADR-004 (status: proposed): deposit-backed order flow, deposit contract
- ADR-005 (status: proposed): IoT ingest authority, gateway key contract
- ADR-006 (status: proposed first): AGENTS.md anchor Strategy B per D8 (move + redirect stubs + atomic update)
- Mỗi ADR có Context (vi), Decision (vi), Consequences (positive/negative/follow-up), Alternatives Considered (≥2 alternatives)

**Acceptance.**
- [ ] 6 ADR files với front-matter ADR schema
- [ ] 5 H2 sections per ADR
- [ ] ADR-001/002/003 status accepted; ADR-004/005/006 status proposed

**Depends-on.** S5.T1

**Resolves.** R10.4, R10.5, R10.6

**Touches design.** D8, D9, Reference Section B

### S5.T3 — Promote ADR-006 → accepted; resolve GAP-002

**What.** Sửa ADR-006 status từ proposed → accepted, cập nhật GAP-002 status → resolved.

**Where.** `docs/03-architecture/adrs/ADR-006-agents-md-anchor-strategy.md`, `docs/09-governance/gap-register.md`

**How.**
- ADR-006: front-matter `status: accepted`, `date: <today>`
- gap-register.md row GAP-002: `status: resolved`, `target-date: <today>`, note "Resolved by ADR-006"
- Đây là gate cho Stage 6 file moves (per D8: ADR-006 phải accepted trước file moves)

**Acceptance.**
- [ ] ADR-006 status = accepted
- [ ] GAP-002 status = resolved

**Depends-on.** S5.T2

**Resolves.** R14.2, R12.4

**Touches design.** D8

### S5.T4 — openapi.yaml với 18 operations

**What.** Soạn `openapi.yaml` per D12 scope.

**Where.** `docs/05-api/openapi.yaml`

**How.**
- OpenAPI version 3.0.3
- info: `title: BICAP API`, `version: 0.1.0`, `description` bilingual
- servers: `https://{environment}.bicap.local/api/v1` với env enum
- securitySchemes: `bearerAuth` (JWT)
- tags: auth, order, shipment, admin, farm, retailer, shipping-manager, driver, public (English per D7)
- 18 operations với operationId + x-doc-id mapping per D12:
  - Auth (5): authLogin/Register/Refresh/Logout/Me → API-AUT-001..005
  - Order (4): orderCreate/UpdateStatus/Cancel/Deposit → API-ORD-001..004
  - Shipment (3): shipmentCreate/Assign/UpdateStatus → API-SHM-001..003
  - 6 placeholders: adminDashboardSummary (API-ADM-001), farmProfileRead (API-FRM-001), retailerListingsBrowse (API-RTL-001), shippingManagerDashboardSummary (API-SHM-010), driverAssignmentsList (API-DRV-010), guestListingsBrowse (API-GST-001)
- components.schemas: LoginRequest, LoginResponse, RegisterRequest, User, OrderCreateRequest, OrderResponse, OrderStatus (enum), ShipmentCreateRequest, ShipmentResponse, ShipmentStatus (enum), Error
- Error schema: `{ code: string, message: string, details: object|null, traceId: string }`

**Acceptance.**
- [ ] File parse được bởi YAML parser
- [ ] 18 operationIds present
- [ ] Mỗi operation có x-doc-id matching API-* ID
- [ ] Validate sạch trên editor.swagger.io

**Depends-on.** S5.T1

**Resolves.** R9.1, R9.2, R9.3, R9.6

**Touches design.** D12

### S5.T5 — 05-api/conventions.md

**What.** Định nghĩa API conventions inheritable bởi mọi endpoint.

**Where.** `docs/05-api/conventions.md`

**How.**
- Front-matter D9, language: en
- Sections: `## Path Versioning` (`/api/v1/*`), `## Error Envelope` (Error schema), `## Pagination` (cursor format), `## Idempotency` (`Idempotency-Key` header), `## Versioning` (`X-API-Version` header), `## JSON Casing` (camelCase), `## Date/Time` (ISO 8601 UTC)
- Reference back: `openapi.yaml` operations follow conventions ở đây

**Acceptance.**
- [ ] 7 H2 sections
- [ ] Error schema khớp với S5.T4 components.Error

**Depends-on.** S5.T4

**Resolves.** R9.1, R9.4

**Touches design.** D12

### S5.T6 — 05-api/authentication.md

**What.** JWT bearer scheme + refresh contract + public endpoints list.

**Where.** `docs/05-api/authentication.md`

**How.**
- Front-matter D9
- H2: `## Bearer Auth Scheme` (JWT format, claims), `## Token Lifecycle` (access 24h, refresh 7d), `## Public Endpoints` (login/register/refresh + public marketplace endpoints), `## Refresh Flow` (sequence diagram mermaid per D14)

**Acceptance.**
- [ ] 4 H2 sections
- [ ] Public endpoints list khớp với securitySchemes của openapi.yaml

**Depends-on.** S5.T4

**Resolves.** R9.6

**Touches design.** D14

### S5.T7 — traceability-matrix.md scaffold

**What.** Build matrix với row per Brief bullet, R-*/module/API-* cells filled, test-file `[TBD]`.

**Where.** `docs/01-requirements/traceability-matrix.md`

**How.**
- Front-matter D9
- Bảng 5 columns: `brief-bullet | R-* | module | API-* | test-file`
- 1 row per Brief bullet (đọc từ `_brief-source.md`)
- R-* cell filled từ R-files đã viết Stage 3
- module cell filled từ module owning the R-* (lookup từ 04-modules/*)
- API-* cell filled where mapping known (≤18 entries từ openapi.yaml)
- test-file cell `[TBD]` nếu chưa có test
- Note đầu file: "test-file column populated in follow-up spec"

**Acceptance.**
- [ ] 1 row per Brief bullet (66 rows từ 5+21+19+6+9+3+3)
- [ ] R-* column không có rỗng (R11.3 violation nếu rỗng)
- [ ] API-* column ≥18 filled từ openapi.yaml

**Depends-on.** S5.T4, S3.T2..S3.T7

**Resolves.** R11.1, R11.2, R11.5, R11.6

**Touches design.** D12

---

## Stage 6 — Enforcement

**Goal.** Wire AGENTS.md amendment + PR template + redirect stubs + stub scripts. Doc-code sync protocol active từ next PR onward.

**Unlocks.** Mọi PR sau stage này phải tham chiếu Doc IDs.

**Stage DoD.**
- [ ] 6 stub scripts dưới `scripts/docs/`
- [ ] 4 AGENTS.md anchor paths resolvable qua redirect stubs
- [ ] `.github/PULL_REQUEST_TEMPLATE.md` tồn tại với 5 fields
- [ ] AGENTS.md cập nhật atomic với file moves
- [ ] Mọi cross-reference internal pass `docs:check` (manual run)

### S6.T1 — 6 stub scripts cho quality gates

**What.** Tạo 6 stub script files per D13, mỗi cái in "not implemented yet, see design D13" và exit 0.

**Where.** `scripts/docs/docs-check.sh`, `scripts/docs/docs-check.ps1`, `scripts/docs/docs-lint.sh`, `scripts/docs/docs-lint.ps1`, `scripts/docs/docs-trace.sh`, `scripts/docs/docs-trace.ps1`

**How.**
- 3 lệnh × 2 platforms = 6 files
- Bash: shebang `#!/usr/bin/env bash`, echo message, exit 0
- PowerShell: `Write-Host` + `exit 0`
- File mode 0755 cho .sh

**Acceptance.**
- [ ] 6 files tồn tại
- [ ] Mỗi file run được và exit 0
- [ ] Stdout chứa "not implemented yet, see design D13"

**Depends-on.** S5.T7

**Resolves.** R12.8, R13.2

**Touches design.** D13

### S6.T2 — agents-md-amendment.md

**What.** Document exact diff sẽ apply vào AGENTS.md ở S6.T6.

**Where.** `docs/09-governance/agents-md-amendment.md`

**How.**
- Front-matter D9, language: bilingual
- H2 `## Anchor Path Updates`: bảng 4 anchors → new paths per D8
- H2 `## New Section: Doc-code Sync Protocol`: full text của section sẽ thêm vào AGENTS.md (R12.5/R12.6) — yêu cầu mọi PR reference ID + new behavior tạo ID mới cùng commit + conflict tạo GAP-*
- H2 `## Apply Procedure`: 3 bước atomic application

**Acceptance.**
- [ ] 3 H2 sections
- [ ] 4 anchor mappings rõ
- [ ] Doc-code sync section có ≥4 rules

**Depends-on.** S5.T3

**Resolves.** R12.1, R12.5, R12.6, R14.4

**Touches design.** D8

### S6.T3 — pull-request-template.md + .github/PULL_REQUEST_TEMPLATE.md

**What.** Tạo canonical PR template trong governance + mirror trong .github/.

**Where.** `docs/09-governance/pull-request-template.md`, `.github/PULL_REQUEST_TEMPLATE.md`

**How.**
- Canonical: front-matter D9, language: en
- 5 fields per R12.9: `### Doc IDs touched`, `### Gap entries`, `### OpenAPI delta`, `### Tests`, `### RBAC impact`
- Mỗi field: 2-3 dòng giải thích + checklist items
- `.github/PULL_REQUEST_TEMPLATE.md`: copy nội dung body từ canonical (không front-matter — GitHub đọc raw)
- Thêm note đầu file canonical: "This file is canonical. `.github/PULL_REQUEST_TEMPLATE.md` mirrors it."

**Acceptance.**
- [ ] Cả 2 files tồn tại
- [ ] 5 fields đầy đủ
- [ ] Body content khớp giữa 2 files

**Depends-on.** S6.T2

**Resolves.** R12.1, R12.9, R16.2

**Touches design.** D9

### S6.T4 — ci-check-spec.md

**What.** Document CI hard-enforcement contract cho follow-up spec.

**Where.** `docs/09-governance/ci-check-spec.md`

**How.**
- Front-matter D9
- H2: `## Purpose` (CI integration deferred), `## Hooks` (PR opened, push to main), `## Checks` (run docs:check, docs:lint, docs:trace, fail on exit 1), `## Follow-up Spec` (link `docs-quality-gates-impl`), `## Initial Soft Mode` (warning only at first, hard fail later)

**Acceptance.**
- [ ] 5 H2 sections
- [ ] References `docs-quality-gates-impl` follow-up

**Depends-on.** S6.T2

**Resolves.** R12.7, R13.4

**Touches design.** D13

### S6.T5 — Tạo 4 redirect stubs ở legacy paths

**What.** Tạo redirect stubs tại 4 AGENTS.md anchor legacy paths + 16 module legacy paths (mỗi old module file trong `docs/modules/` thành stub).

**Where.**
- `docs/architecture/PROJECT_CONTEXT.md` (overwrite)
- `docs/architecture/MODULES.md` (overwrite)
- `docs/business/BUSINESS_RULES.md` (overwrite)
- `docs/modules/admin.md`, `auth.md`, `farm.md`, `retailer.md`, `user-rbac.md`, `guest-marketplace.md`, `analytics-discovery.md`, `content-media.md`, `listing-order-contract.md`, `logistics-shipment-driver.md`, `product-batch.md`, `season-cultivation.md`, `subscription-payment.md`, `traceability-vechain-iot.md`, `security-observability.md`, `_TEMPLATE.md`, `README.md` (each becomes stub)

**How.**
- Mỗi stub: front-matter D9 redirect-stub schema (`status: superseded`, `superseded-by: <new-path>`)
- Body: 1 dòng markdown link `This document moved to [<new-path>](<relative-path>).`
- Mapping per D8:
  - `architecture/PROJECT_CONTEXT.md` → `../03-architecture/context.md`
  - `architecture/MODULES.md` → `../04-modules/README.md`
  - `business/BUSINESS_RULES.md` → `../02-domain/business-rules.md`
  - `modules/admin.md` → `../04-modules/admin.md`
  - `modules/analytics-discovery.md` → `../04-modules/analytics.md` (analytics half) + note "split: see also `../04-modules/discovery.md`"
  - Similarly cho 15 module files còn lại; multi-target stubs liệt kê cả 2 destinations
  - `modules/_TEMPLATE.md` → `../04-modules/_TEMPLATE.md`
  - `modules/README.md` → `../04-modules/README.md`

**Acceptance.**
- [ ] 19 stub files tồn tại (3 + 16 module legacy)
- [ ] Mỗi stub có front-matter `status: superseded` + `superseded-by`
- [ ] Body chỉ chứa link, không có nội dung khác
- [ ] Mọi target file resolve được

**Depends-on.** S6.T1, S5.T3

**Resolves.** R14.1, R14.3, R14.5

**Touches design.** D8, D9

### S6.T6 — FINAL: Apply AGENTS.md amendment atomic

**What.** Cập nhật `AGENTS.md` ở repo root: thay 4 anchor paths + thêm Doc-code Sync Protocol section. Atomic với S6.T5 stubs.

**Where.** `d:\Code\laptrinhjava\AGENTS.md`

**How.**
- Đọc `09-governance/agents-md-amendment.md` để biết exact diff
- Apply 4 anchor path replacements:
  - `docs/architecture/PROJECT_CONTEXT.md` → `docs/03-architecture/context.md`
  - `docs/architecture/MODULES.md` → `docs/04-modules/README.md`
  - `docs/business/BUSINESS_RULES.md` → `docs/02-domain/business-rules.md`
  - `docs/modules/` → `docs/04-modules/`
- Thêm new H2 section `## Doc-Code Sync Protocol`:
  - "Mọi PR phải tham chiếu ít nhất một ID (`R-*`, `BR-*`, `STM-*`, hoặc `API-*`) trong `docs/`."
  - "Code thực hiện hành vi chưa có ID ⇒ tạo ID mới ở `docs/01-requirements/` trong cùng commit."
  - "Mâu thuẫn giữa code và docs ⇒ docs đổi trước HOẶC tạo `GAP-*` entry trong `docs/09-governance/gap-register.md`."
  - "Reviewer chạy local: `docs:check`, `docs:lint`, `docs:trace` trước approve."
- Verify atomicity: S6.T5 stubs đã tồn tại trước khi commit S6.T6 (S6.T6 depends-on S6.T5)
- THIS IS THE LAST TASK. Bất kỳ task nào sau S6.T6 phải chuyển sang follow-up spec (`docs-openapi-completion`, `docs-quality-gates-impl`, `frontend-rbac-binding`).

**Acceptance.**
- [ ] AGENTS.md có 4 anchor paths mới
- [ ] AGENTS.md có new section "Doc-Code Sync Protocol" với ≥4 rules
- [ ] 4 anchor paths resolve via redirect stubs (S6.T5) hoặc trực tiếp (file đã được tạo Stage 1-5)
- [ ] Manual run `docs:check` (stub) exit 0
- [ ] Spec tasks complete; KHÔNG có task tiếp theo

**Depends-on.** S6.T5

**Resolves.** R12.5, R12.6, R14.1, R14.4, R16.2

**Touches design.** D8

---

## Coverage Verification

Bảng dưới chứng minh mọi requirement R1.1..R16.4 được cover bởi ≥1 task.

| Requirement | Tasks | Notes |
|---|---|---|
| R1.1 | S1.T1, S1.T2, S1.T8 | 11-folder structure scaffolded |
| R1.2 | S1.T1, S1.T2 | structure.md documents purposes |
| R1.3 | S1.T4 | doc-change-policy mentions ADR-on-new-folder |
| R1.4 | S1.T12 (manual), S6.T1 (docs:lint stub) | Loose-doc check |
| R1.5 | S6.T5 | _archive policy + redirect stubs reachable |
| R1.6 | S1.T1 | structure.md describes _archive |
| R2.1 | S1.T3 | id-naming.md 7 ID types |
| R2.2 | S1.T3, S1.T4 | regex + examples |
| R2.3..R2.7 | S1.T3..T8, S1.T12 | front-matter discipline + lint |
| R2.8 | S1.T4 | doc-change-policy ADR/deprecation rules |
| R2.9 | S6.T5 | redirect stubs keep deprecated reachable |
| R2.10 | S1.T3, S1.T4 | rename-forbidden rule |
| R3.1 | S1.T6, S3.T2..T7 | 6 R-* files filled |
| R3.2 | S3.T1 | _brief-source.md verbatim |
| R3.3 | S3.T2..T7 | 7 required fields per R-* |
| R3.4 | S3.T2..T7 | EARS pattern enforcement |
| R3.5 | S3.T4 | ambiguity markers in retailer.md |
| R3.6 | S3.T9 | drift report |
| R3.7 | S2.T2, S3.T2 | admin.md GAP-001 declared |
| R3.8 | S3.T3, S3.T4, S3.T5 | round-trip ACs for QR/blockchain |
| R4.1 | S1.T6, S3.T8 | 5 NFR files |
| R4.2..R4.4 | S3.T8 | TBD placeholders + status: planned |
| R4.5..R4.6 | S3.T8 | NFR-SCL/BC TBD link GAPs |
| R4.7 | S3.T8 | NFR-SEC links rbac-matrix |
| R4.8 | S3.T8, S1.T9 | TBD ↔ GAP-003..006 |
| R5.1 | S1.T7, S4.T9 | 02-domain/ files + relationships |
| R5.2..R5.3 | S4.T7 | ubiquitous-language Season resolution |
| R5.4..R5.5 | S4.T6 | BR-* atomic catalog |
| R5.6 | S4.T8 | entities.md schema |
| R6.1..R6.6 | S4.T1..T5 | 5 state machines + diagrams |
| R7.1..R7.6 | S4.T10 | RBAC matrix complete |
| R7.7 | S4.T10, S3.T2..T7 | R-* link related-br |
| R8.1..R8.5 | S2.T1..T24 | 22 module files migrated |
| R9.1..R9.6 | S5.T4..T6 | OpenAPI 18 ops + conventions + auth |
| R9.7 | S5.T7 | traceability-matrix API-* coverage |
| R10.1..R10.3 | S5.T1 | 5 architecture files |
| R10.4..R10.6 | S5.T2, S5.T3 | 6 ADRs + ADR-006 accepted |
| R10.7 | S1.T4 | doc-change-policy ADR immutability |
| R11.1..R11.6 | S5.T7 | traceability matrix scaffold |
| R12.1 | S6.T2, S6.T3, S6.T4 | governance docs |
| R12.2 | S1.T4 | doc-change-policy |
| R12.3..R12.4 | S1.T9 | gap-register seeded |
| R12.5..R12.6 | S6.T2, S6.T6 | AGENTS.md amendment |
| R12.7 | S6.T4 | ci-check-spec |
| R12.8 | S6.T1 | 6 stub scripts |
| R12.9 | S6.T3 | PR template 5 fields |
| R12.10 | S3.T9 | drift report classification |
| R13.1..R13.5 | S1.T5 | migration-scope.md |
| R14.1..R14.5 | S5.T3, S6.T5, S6.T6 | ADR-006 + stubs + atomic AGENTS.md |
| R15.1..R15.5 | S1.T4, S3.T1, S3.T4, S3.T9 | brief source fidelity rules |
| R16.1..R16.4 | S1.T5 | non-goals.md + scope rules |

Mỗi requirement có ≥1 task. Nếu thực thi tasks-phase phát hiện gap mới, mở GAP-* (range GAP-008..050) và append vào gap-register.md.

---

## End of Tasks

Spec `docs-as-blueprint` kết thúc tại S6.T6. Follow-up specs:
- `docs-openapi-completion` — full OpenAPI cho mọi endpoint
- `docs-quality-gates-impl` — implementation `docs:check`, `docs:lint`, `docs:trace`
- `frontend-rbac-binding` — frontend RBAC binding implementation per D5

Mọi task ngoài S1.T1..S6.T6 phải thuộc một follow-up spec, không thuộc spec này.
