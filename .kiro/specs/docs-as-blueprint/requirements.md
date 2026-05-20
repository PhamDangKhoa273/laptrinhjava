# Requirements Document

## Introduction

Spec này định nghĩa việc biến thư mục `docs/` của BICAP thành **bản thiết kế chính (blueprint)** — nguồn sự thật duy nhất (Single Source of Truth, SSOT) cho toàn bộ sản phẩm. Mọi thành viên (người và agent) chỉ căn cứ vào `docs/` để làm việc; mã nguồn được ràng buộc với tài liệu thông qua các định danh ổn định (stable IDs). Không ai được phép làm sai lệch hành vi sản phẩm so với tài liệu — nếu cần đổi hành vi, phải sửa tài liệu trước, sau đó mới sửa mã.

Spec này không trực tiếp viết lại toàn bộ tài liệu hay endpoint API; spec chỉ định nghĩa **cấu trúc, lược đồ định danh, mẫu tài liệu, ma trận RBAC, máy trạng thái, ma trận truy vết, quy ước OpenAPI, ADR khung, và quy trình quản trị tài liệu** — tức là khung xương của blueprint. Việc lấp đầy chi tiết cho từng endpoint, tự động hóa CI cứng, và viết script truy vết tự động được hoãn sang các spec kế tiếp (xem Requirement 13: Migration Scope and Reviewability).

Spec này cũng giải quyết một khoảng trống đã được người dùng nêu rõ: tài liệu hiện tại không phản ánh đầy đủ các yêu cầu chức năng theo từng vai trò trong project brief (Admin, Farm Manager, Retailer, Driver, Shipping Manager, Guest), cũng như ba nhóm yêu cầu phi chức năng (scalability, blockchain throughput, security/RBAC). Brief sẽ được nhập nguyên văn (verbatim) vào tài liệu nguồn và mỗi gạch đầu dòng trở thành một hoặc nhiều R-* có acceptance criteria EARS.

Ngôn ngữ: phần văn xuôi hướng người dùng dùng tiếng Việt; từ khóa EARS (`WHEN`, `IF`, `THEN`, `SHALL`, `WHERE`, `WHILE`), tên ID, tên tag, regex, thuật ngữ kỹ thuật, và section heading dùng tiếng Anh.

## Glossary

- **Blueprint_System**: Hệ thống tài liệu blueprint của BICAP — bao gồm cấu trúc thư mục `docs/`, lược đồ định danh, mẫu tài liệu, ma trận truy vết, quy trình quản trị, và các artefact metadata. Đây là chủ thể (subject) của hầu hết các SHALL trong spec này. Blueprint_System **không** phải runtime application; nó là hệ tài liệu + quy trình.
- **Brief**: Tài liệu yêu cầu gốc của dự án do người dùng cung cấp (bằng tiếng Việt), liệt kê năng lực theo từng vai trò và ba yêu cầu phi chức năng. Brief là nguồn nguyên thủy (primary source) cho mọi R-* chức năng.
- **Doc ID / Stable ID**: Định danh ổn định không bao giờ bị đổi hoặc xóa âm thầm; mỗi ID có dạng `<TYPE>-<SCOPE>-<NNN>` và được khai báo trong front-matter của tài liệu sở hữu.
- **R-\***: Functional requirement ID theo vai trò. Ví dụ `R-ADM-001`, `R-FRM-014`, `R-RTL-007`, `R-SHM-003`, `R-DRV-002`, `R-GST-001`.
- **NFR-\***: Non-functional requirement ID theo phạm trù. Ví dụ `NFR-SCL-001` (scalability), `NFR-PRF-001` (performance), `NFR-REL-001` (reliability), `NFR-SEC-001` (security/RBAC), `NFR-BC-001` (blockchain throughput/integrity).
- **BR-\***: Business rule ID theo miền nghiệp vụ. Ví dụ `BR-ORD-001` (order rules), `BR-SEA-001` (season rules), `BR-SHP-001` (shipment rules), `BR-IOT-001`, `BR-FRM-001`.
- **STM-\***: State machine transition ID. Ví dụ `STM-SHP-T01` là transition số 01 trong state machine của Shipment. Phạm vi gồm `STM-SHP`, `STM-ORD`, `STM-SEA`, `STM-FRMAPP` (farm approval), `STM-SUB` (subscription).
- **API-\***: Endpoint ID. Ví dụ `API-ORD-001` ánh xạ tới một `operationId` trong `openapi.yaml`.
- **ADR-\***: Architecture Decision Record ID. Ví dụ `ADR-001` cho quyết định modular monolith.
- **GAP-\***: Gap register entry ID — ghi nhận sai lệch giữa brief, tài liệu, và mã nguồn; có trạng thái `open|in-progress|resolved|wont-fix`.
- **EARS**: Easy Approach to Requirements Syntax — sáu mẫu câu yêu cầu (Ubiquitous, Event-driven, State-driven, Unwanted, Optional, Complex).
- **SSOT**: Single Source of Truth — nguyên tắc rằng `docs/` là nguồn duy nhất; mã nguồn phản ánh tài liệu, không ngược lại.
- **Front-matter**: Khối YAML đặt ở đầu mỗi file tài liệu, chứa `title`, `ids`, `status`, `last-reviewed`, `language`.
- **Traceability Matrix**: Bảng ánh xạ Brief-bullet → R-* → Module → API-* → Test file. Một dòng thiếu test reference đồng nghĩa với một blocking gap.
- **Deprecation Entry**: Bản ghi đánh dấu một ID không còn hiệu lực, vẫn truy cập được tối thiểu một release cycle, có lý do và ID kế thừa (nếu có).
- **AGENTS.md Anchors**: Bốn đường dẫn `docs/architecture/PROJECT_CONTEXT.md`, `docs/architecture/MODULES.md`, `docs/business/BUSINESS_RULES.md`, `docs/modules/` mà file `AGENTS.md` ở root đang trỏ tới.
- **Redirect Stub**: File tài liệu chỉ chứa front-matter `status: superseded` và một liên kết tới đường dẫn mới — dùng để giữ AGENTS.md Anchors còn resolvable sau khi nội dung di chuyển.
- **Migration Scope**: Tập các artefact phải tạo ra trong spec hiện tại, đối lập với phần hoãn sang spec kế tiếp.
- **Brief Source Fidelity**: Nguyên tắc rằng mỗi R-* chức năng phải ghi lại nguyên văn (`source quote`) gạch đầu dòng tương ứng từ Brief, và mọi sai lệch so với Brief phải được theo dõi qua một GAP-*.

## Requirements

### Requirement 1: Information Architecture as a Blueprint

**User Story:** Là một thành viên dự án (developer, agent, hoặc reviewer), tôi muốn `docs/` có một cấu trúc thư mục được đánh số rõ ràng đọc từ trên xuống dưới như một tài liệu thiết kế duy nhất, để tôi luôn biết tìm thông tin nào ở đâu mà không phải đoán.

#### Acceptance Criteria

1. THE Blueprint_System SHALL define a canonical 10-folder structure under `docs/` consisting of `00-overview/`, `01-requirements/`, `02-domain/`, `03-architecture/`, `04-modules/`, `05-api/`, `06-security/`, `07-operations/`, `08-testing/`, `09-governance/`, and an `_archive/` folder for superseded content.
2. THE Blueprint_System SHALL document the purpose, allowed content types, and ownership of each of the eleven folders in `docs/00-overview/structure.md`.
3. WHEN a new top-level document category is proposed, THE Blueprint_System SHALL require that category to map to exactly one of the eleven canonical folders or trigger an ADR to introduce a new folder.
4. IF a document is placed outside the eleven canonical folders, THEN THE Blueprint_System SHALL require the `docs:lint` quality gate defined in Requirement 12 to detect and flag the document as non-conformant.
5. THE Blueprint_System SHALL keep `_archive/` reachable for deprecated and superseded content for at least one release cycle before permanent removal.

### Requirement 2: Doc Identifier Scheme and Front-matter Discipline

**User Story:** Là một developer hoặc agent, tôi muốn mọi tuyên bố có thẩm quyền trong tài liệu đều có một ID ổn định và mọi file đều mang front-matter chuẩn, để tôi có thể tham chiếu chính xác từ commit message, PR, code annotation, và test mà không sợ bị "vỡ liên kết" khi tài liệu được sắp xếp lại.

#### Acceptance Criteria

1. THE Blueprint_System SHALL define an ID scheme covering exactly seven types: `R-<ROLE>-<NNN>`, `NFR-<CAT>-<NNN>`, `BR-<DOMAIN>-<NNN>`, `STM-<DOMAIN>-T<NN>`, `API-<MOD>-<NNN>`, `ADR-<NNN>`, and `GAP-<NNN>`.
2. THE Blueprint_System SHALL publish the formal regex for each ID type in `docs/09-governance/id-naming.md` together with at least two valid examples and two invalid examples per type.
3. THE Blueprint_System SHALL require every file under `docs/01-requirements/`, `docs/02-domain/`, `docs/04-modules/`, `docs/05-api/`, `docs/06-security/`, `docs/03-architecture/adrs/`, and `docs/09-governance/gap-register.md` to declare a YAML front-matter block with the keys `title`, `ids`, `status`, `last-reviewed`, and `language`.
4. THE Blueprint_System SHALL constrain `status` to one of `draft`, `active`, `deprecated`, `superseded`.
5. THE Blueprint_System SHALL constrain `language` to one of `vi`, `en`, `bilingual`.
6. THE Blueprint_System SHALL require `last-reviewed` to be an ISO-8601 calendar date in `YYYY-MM-DD` form.
7. IF an ID appears in more than one front-matter `ids:` list across `docs/`, THEN THE Blueprint_System SHALL treat the duplicate as a `docs:lint` failure.
8. WHEN an ID is no longer in use, THE Blueprint_System SHALL require a deprecation entry in `docs/09-governance/gap-register.md` or in the ADR superseding chain rather than silent deletion.
9. WHILE a document carries `status: deprecated` or `status: superseded`, THE Blueprint_System SHALL keep the document discoverable from the current structure for at least one release cycle.
10. THE Blueprint_System SHALL forbid renaming an existing ID; replacement SHALL be performed by issuing a new ID and a deprecation entry referencing the predecessor.

### Requirement 3: Functional Requirements Aligned to Brief

**User Story:** Là một product owner và developer, tôi muốn mỗi gạch đầu dòng trong Brief trở thành một hoặc nhiều R-* có acceptance criteria EARS, để tôi có thể kiểm chứng tài liệu phủ hết phạm vi sản phẩm theo từng vai trò.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place per-role functional requirement files under `docs/01-requirements/functional/` with one file per role: `admin.md`, `farm-manager.md`, `retailer.md`, `driver.md`, `shipping-manager.md`, `guest.md`.
2. THE Blueprint_System SHALL include in `docs/01-requirements/functional/_brief-source.md` the verbatim Vietnamese Brief as the primary source quoted by all R-* under `docs/01-requirements/functional/`.
3. THE Blueprint_System SHALL require every R-* under `docs/01-requirements/functional/` to declare these fields: `id`, `title`, `role`, `source quote` (verbatim Vietnamese excerpt from `_brief-source.md`), `acceptance criteria` (EARS-formatted list), `status` (`active`, `planned`, or `deprecated`), `related-br` (list of BR-*), `related-stm` (list of STM-*), `related-api` (list of API-*), `tests` (list of test references).
4. THE Blueprint_System SHALL render every acceptance criterion of every R-* using exactly one of the six EARS patterns.
5. WHERE a Brief bullet contains an internal ambiguity (for example the Retailer line that mentions "business license and farm info"), THE Blueprint_System SHALL preserve the verbatim Brief text and add an inline marker in the form `[AMBIGUITY: <description>]` directly under the affected R-*.
6. WHEN a Brief bullet has no corresponding R-* in `docs/01-requirements/functional/`, THE Blueprint_System SHALL treat the gap as a `docs:trace` failure.
7. THE Blueprint_System SHALL declare in the front-matter of `docs/01-requirements/functional/admin.md` the existing mismatch where the Brief states the Admin deploys smart contracts whereas current architecture documents describe Admin as validator-only, and SHALL link the corresponding `GAP-*` entry.
8. WHERE a functional requirement involves parsing or serializing structured data (for example QR payloads, IoT sensor payloads, or VeChain transaction envelopes), THE Blueprint_System SHALL include a round-trip acceptance criterion stating that decode-then-encode produces an equivalent value.

### Requirement 4: Non-Functional Requirements with Measurable Criteria

**User Story:** Là một kiến trúc sư và SRE, tôi muốn mọi yêu cầu phi chức năng có ngưỡng đo được hoặc một placeholder rõ ràng, để các quyết định kỹ thuật không dựa vào diễn giải mơ hồ như "nhanh" hay "đủ".

#### Acceptance Criteria

1. THE Blueprint_System SHALL place non-functional requirement files under `docs/01-requirements/non-functional/` with at minimum these files: `scalability.md`, `performance.md`, `reliability.md`, `security.md`, `blockchain.md`.
2. THE Blueprint_System SHALL require every NFR-* to declare a measurable criterion or, when a target is not yet agreed, a placeholder marked `[TBD: target value]` together with `status: planned`.
3. THE Blueprint_System SHALL forbid vague terms `quickly`, `properly`, `adequate`, `reasonable`, `user-friendly`, `where possible`, `if feasible`, and `as appropriate` inside any NFR-* acceptance criterion whose `status` is `active`.
4. WHERE an NFR-* carries `status: planned` and a `[TBD: target value]` placeholder, THE Blueprint_System SHALL permit qualitative descriptive terms in the surrounding rationale until the placeholder is resolved, at which point the criterion SHALL be re-evaluated under acceptance criterion 3.
5. THE Blueprint_System SHALL include in `docs/01-requirements/non-functional/scalability.md` an `NFR-SCL-*` entry quoting the Brief statement about AWS, GCP, Docker, and Redis, and SHALL state the metric category as `[TBD: target user volume, peak RPS, autoscaling thresholds]`.
6. THE Blueprint_System SHALL include in `docs/01-requirements/non-functional/blockchain.md` an `NFR-BC-*` entry quoting the Brief statement about VeChainThor concurrency and SHALL declare metric categories `transactions per second`, `confirmation latency p95`, and `IoT batch size` as `[TBD: target value]`.
7. THE Blueprint_System SHALL include in `docs/01-requirements/non-functional/security.md` an `NFR-SEC-*` entry stating that role-based access SHALL be enforced for `admin`, `retailer`, `shipping_manager`, `driver`, `farm_manager`, and `guest`, and SHALL link to `docs/06-security/rbac-matrix.md`.
8. WHEN a placeholder `[TBD: target value]` remains unresolved past one release cycle from the date of introduction, THE Blueprint_System SHALL surface the placeholder as an open `GAP-*` entry.

### Requirement 5: Domain Specification

**User Story:** Là một developer, tôi muốn ngôn ngữ chung của hệ thống được khóa lại trong tài liệu, để cùng một khái niệm không bị gọi bằng ba tên khác nhau ở backend, frontend, và doc.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place under `docs/02-domain/` exactly these files: `ubiquitous-language.md`, `entities.md`, `relationships.md`, `business-rules.md`, and a subfolder `state-machines/`.
2. THE Blueprint_System SHALL list in `ubiquitous-language.md` every domain term used in the codebase or Brief together with its canonical English form, accepted Vietnamese form, and rejected synonyms.
3. THE Blueprint_System SHALL resolve in `ubiquitous-language.md` the term variants `Season`, `Mùa vụ`, and `Cultivation Season` to a single canonical form and SHALL list the others as rejected synonyms.
4. THE Blueprint_System SHALL list in `business-rules.md` every BR-* as an atomic, single-thought rule with `id`, `domain`, `statement`, `rationale`, `related-r` (list of R-*), and `related-stm` (list of STM-*).
5. IF a BR-* statement contains the conjunction `AND` joining two independently testable assertions, THEN THE Blueprint_System SHALL split the BR-* into two distinct BR-* entries.
6. THE Blueprint_System SHALL place each entity definition in `entities.md` with fields `name`, `attributes`, `invariants`, and `owning-module`.

### Requirement 6: State Machines as Authoritative Tables

**User Story:** Là một developer, tôi muốn mỗi vòng đời (shipment, order, season, farm approval, subscription) được mô tả như một bảng chuyển trạng thái, để cài đặt phía code không thể tạo ra một transition chưa có trong tài liệu.

#### Acceptance Criteria

1. THE Blueprint_System SHALL create one file per stateful entity under `docs/02-domain/state-machines/` covering at minimum `shipment.md`, `order.md`, `season.md`, `farm-approval.md`, `subscription.md`.
2. THE Blueprint_System SHALL render each state machine as a transition table with the columns `transition-id`, `from-state`, `to-state`, `triggered-by-role`, `trigger-event-or-api`, `guards`, `related-br`.
3. THE Blueprint_System SHALL assign every transition row a `STM-<DOMAIN>-T<NN>` identifier unique within the spec.
4. WHEN a code path performs a state transition, THE Blueprint_System SHALL require the transition to match a `STM-*` row by `from-state`, `to-state`, and `triggered-by-role`.
5. IF a state transition exists in code but not in the corresponding `STM-*` table, THEN THE Blueprint_System SHALL require either the table to be amended in the same change set or a `GAP-*` entry to be created.
6. THE Blueprint_System SHALL list under each state machine file a `valid-end-states` set so that a transition leading outside the set is detected by `docs:lint`.

### Requirement 7: RBAC Matrix as Single Source for Authorization

**User Story:** Là một security reviewer, tôi muốn mọi quyết định "ai được làm gì" tập trung trong một ma trận duy nhất, để các annotation `@PreAuthorize` trên backend và route guard trên frontend đều tham chiếu cùng nguồn.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place the authorization matrix at `docs/06-security/rbac-matrix.md`.
2. THE Blueprint_System SHALL render `rbac-matrix.md` as a table whose rows are resources and whose columns are exactly the six roles `admin`, `farm_manager`, `retailer`, `shipping_manager`, `driver`, `guest`.
3. THE Blueprint_System SHALL fill every cell of the matrix with a value drawn from `allow`, `deny`, or `conditional:<BR-id>`.
4. WHEN a cell uses `conditional:<BR-id>`, THE Blueprint_System SHALL require the referenced BR-* to exist in `docs/02-domain/business-rules.md`.
5. IF a cell is left blank or contains a value outside `allow`, `deny`, `conditional:<BR-id>`, THEN THE Blueprint_System SHALL treat the row as a `docs:lint` failure.
6. THE Blueprint_System SHALL declare `deny` as the default value for any newly added resource row until the matrix is updated.
7. THE Blueprint_System SHALL link from each `R-*` whose acceptance criteria depend on authorization to the relevant cell of `rbac-matrix.md` via the `related-br` field.

### Requirement 8: Module Documentation Rewritten Against the Blueprint

**User Story:** Là một maintainer, tôi muốn mỗi module trong code có một file tài liệu duy nhất theo template mới, để tôi biết module sở hữu R-* nào, BR-* nào, STM-* nào, và phụ thuộc vào module nào khác.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place one document per module under `docs/04-modules/` matching the existing module list under `backend/src/main/java/com/bicap/modules/`.
2. THE Blueprint_System SHALL define a new module document template `docs/04-modules/_TEMPLATE.md` with these required sections: `Purpose`, `Owns` (lists of R-*, BR-*, STM-*), `Implements` (controllers, services, entities), `Depends-on` (other modules), `API surface` (links to API-*), `Tests` (links keyed by R-*), `Open gaps` (links to GAP-*).
3. THE Blueprint_System SHALL migrate every existing file under `docs/modules/` to the new template at the new location `docs/04-modules/`.
4. WHEN a module file under `docs/04-modules/` lists an `R-*`, `BR-*`, or `STM-*` in its `Owns` section, THE Blueprint_System SHALL treat that file as the single owner of the listed ID for `docs:lint` uniqueness purposes.
5. IF a module's `Implements` section references a Java class that does not exist under the corresponding `backend/src/main/java/com/bicap/modules/<module>/` package, THEN THE Blueprint_System SHALL treat the entry as a `GAP-*` candidate.

### Requirement 9: API Specification with OpenAPI as Canonical Contract

**User Story:** Là một frontend developer hoặc third-party integrator, tôi muốn hợp đồng API máy đọc được nằm trong repo và mọi thay đổi endpoint phải đi kèm thay đổi hợp đồng đó, để client không bao giờ "trễ pha" so với server.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place under `docs/05-api/` exactly these artefacts: `conventions.md`, `authentication.md`, `openapi.yaml`, and a subfolder `collections/`.
2. THE Blueprint_System SHALL declare `openapi.yaml` as the canonical machine-readable API contract.
3. THE Blueprint_System SHALL require every API-* defined in `docs/05-api/` to map to exactly one `operationId` in `openapi.yaml`.
4. WHEN an endpoint is added, removed, or has its request or response schema changed in code, THE Blueprint_System SHALL require `openapi.yaml` to be updated in the same pull request.
5. THE Blueprint_System SHALL keep Postman collections under `docs/05-api/collections/` and SHALL forbid Postman collections from contradicting `openapi.yaml`; conflicts SHALL be resolved in favor of `openapi.yaml`.
6. WHERE an endpoint requires authentication, THE Blueprint_System SHALL document the corresponding security scheme in `authentication.md` and reference it from the `operationId` in `openapi.yaml`.
7. IF an `API-*` ID is referenced from any `R-*` or module document but is missing from `openapi.yaml`, THEN THE Blueprint_System SHALL treat the missing operation as a `docs:trace` failure.

### Requirement 10: Architecture Documentation and ADRs

**User Story:** Là một kiến trúc sư mới gia nhập, tôi muốn lý do của các quyết định kỹ thuật quan trọng được ghi lại bất biến, để tôi không phải đi suy luận ngược từ code.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place under `docs/03-architecture/` at minimum `context.md` (C4 context diagram), `container.md` (C4 container diagram), `component.md` (C4 component diagram), `deployment.md`, `tech-stack.md`, and a subfolder `adrs/`.
2. THE Blueprint_System SHALL render diagrams in `context.md`, `container.md`, and `component.md` using mermaid syntax.
3. THE Blueprint_System SHALL list in `tech-stack.md` every runtime dependency together with an exact pinned version drawn from `backend/pom.xml`, `frontend/package.json`, and `blockchain/package.json`.
4. THE Blueprint_System SHALL seed `docs/03-architecture/adrs/` with five ADR scaffolds: `ADR-001 Modular Monolith`, `ADR-002 VeChainThor Canonical Chain`, `ADR-003 JWT Stateless Auth`, `ADR-004 Deposit-Backed Order Flow`, `ADR-005 IoT Ingest Authority`.
5. WHILE an ADR carries `status: accepted`, THE Blueprint_System SHALL forbid edits that change the decision; superseding decisions SHALL be expressed by issuing a new ADR with `status: accepted` referencing the predecessor as `supersedes: ADR-<NNN>`.
6. THE Blueprint_System SHALL require every ADR to declare these front-matter keys: `id`, `title`, `status`, `date`, `decision`, `context`, `consequences`, `supersedes` (optional), `superseded-by` (optional).
7. IF an ADR is found with `status: accepted` and an unrecorded substantive edit (any change outside typo, link, or formatting) is detected by `docs:lint`, THEN THE Blueprint_System SHALL treat the change as a violation.

### Requirement 11: Traceability Matrix from Brief to Tests

**User Story:** Là một QA lead, tôi muốn một bảng duy nhất ánh xạ từ gạch đầu dòng Brief tới R-*, module, API-*, và file test, để tôi có thể chứng minh phạm vi kiểm thử trên từng yêu cầu.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place the traceability matrix at `docs/01-requirements/traceability-matrix.md` with columns `brief-bullet`, `R-*`, `module`, `API-*`, `test-file`.
2. THE Blueprint_System SHALL include exactly one row per Brief bullet from `_brief-source.md`.
3. WHEN a row in the traceability matrix has an empty `R-*` cell, THE Blueprint_System SHALL treat the row as a blocking gap of severity `coverage`.
4. WHEN a row in the traceability matrix has a non-empty `R-*` cell but an empty `test-file` cell, THE Blueprint_System SHALL treat the row as a blocking gap of severity `verification`.
5. THE Blueprint_System SHALL design `traceability-matrix.md` so that a downstream script can parse it as a structured table; the script implementation itself is out of scope (see Requirement 13).
6. WHERE a Brief bullet maps to multiple R-*, THE Blueprint_System SHALL use one matrix row per `(brief-bullet, R-*)` pair so that test references remain unambiguous.

### Requirement 12: Doc-Code Sync Protocol and Quality Gates

**User Story:** Là một maintainer, tôi muốn một bộ quy tắc và cổng chất lượng cục bộ ngăn không cho code và tài liệu trôi xa nhau, để mỗi PR phải đi kèm thay đổi tài liệu hoặc một mục Gap rõ ràng.

#### Acceptance Criteria

1. THE Blueprint_System SHALL place under `docs/09-governance/` exactly these files: `doc-change-policy.md`, `id-naming.md`, `pr-checklist.md`, `gap-register.md`, `agents-md-amendment.md`, `pull-request-template.md`, `ci-check-spec.md`.
2. THE Blueprint_System SHALL define in `doc-change-policy.md` the rules for adding, deprecating, and superseding IDs.
3. THE Blueprint_System SHALL define in `gap-register.md` a table of `GAP-*` entries with columns `id`, `title`, `description`, `status` (`open`, `in-progress`, `resolved`, `wont-fix`), `owner`, `target-date`, `related-r`, `related-br`, `related-stm`.
4. THE Blueprint_System SHALL seed `gap-register.md` with at minimum one entry covering the smart-contract-deploy mismatch between the Admin Brief and the current `BLOCKCHAIN_ARCHITECTURE.md`.
5. THE Blueprint_System SHALL define in `agents-md-amendment.md` an amendment to `AGENTS.md` requiring every PR to reference at least one ID from `R-*`, `BR-*`, `STM-*`, or `API-*`.
6. WHEN a PR introduces new behavior in backend or frontend code, THE Blueprint_System SHALL require a corresponding new ID to exist in `docs/` within the same commit.
7. IF code under `backend/src/main/java/com/bicap/modules/` or `frontend/src/` is changed without a matching change under `docs/04-modules/<module>.md`, THEN THE Blueprint_System SHALL emit a non-blocking warning via the CI check defined in `ci-check-spec.md`.
8. THE Blueprint_System SHALL specify the contract of three local commands `docs:check`, `docs:trace`, and `docs:lint` covering at minimum link checking, front-matter presence, ID uniqueness, ID format compliance with `id-naming.md` regex, and traceability completeness; the implementation of these commands is out of scope (see Requirement 13).
9. THE Blueprint_System SHALL define in `pull-request-template.md` the PR description fields `Doc IDs touched`, `Gap entries`, `OpenAPI delta`, `Tests`, `RBAC impact`.
10. WHERE a code change conflicts with documented behavior, THE Blueprint_System SHALL require either a documentation change first or a `GAP-*` entry recording the deviation.

### Requirement 13: Migration Scope and Reviewability

**User Story:** Là một reviewer, tôi muốn biết chính xác cái gì sẽ được tạo trong spec này và cái gì sẽ hoãn sang spec sau, để tôi không kỳ vọng sai phạm vi.

#### Acceptance Criteria

1. THE Blueprint_System SHALL declare in `docs/00-overview/migration-scope.md` an in-scope list containing at minimum: the canonical 10-folder structure; the seven-type ID scheme; functional requirement files filled from the Brief for the six roles; non-functional placeholders for scalability, performance, reliability, security, and blockchain; the RBAC matrix scaffold for the six roles; state machines for the five lifecycles `shipment`, `order`, `season`, `farm-approval`, `subscription`; module documentation migrated to the new template; the traceability matrix scaffold; an OpenAPI scaffold; ADR scaffolds `ADR-001` through `ADR-005`; a gap register seeded with the smart-contract-deploy mismatch; the AGENTS.md amendment specification; the pull-request template specification; the docs-check script specification.
2. THE Blueprint_System SHALL declare in `docs/00-overview/migration-scope.md` an out-of-scope list containing at minimum: the full OpenAPI specification for every endpoint in the codebase; CI hard-enforcement of doc-code sync; the implementation of the automated traceability and lint scripts; any code change in `backend/` or `frontend/` other than the AGENTS.md amendment and the pull-request template.
3. WHEN an item appears on the in-scope list, THE Blueprint_System SHALL require it to have at least one corresponding task in `tasks.md` of the same spec.
4. WHEN an item appears on the out-of-scope list, THE Blueprint_System SHALL require it to be the subject of a follow-up spec referenced by name in `migration-scope.md`.
5. IF an artefact is created during this spec but does not match the in-scope list, THEN THE Blueprint_System SHALL require either an update to the in-scope list or removal of the artefact before merge.

### Requirement 14: Backward Compatibility for AGENTS.md Anchors

**User Story:** Là một agent đang đọc `AGENTS.md`, tôi muốn các đường dẫn tài liệu mà `AGENTS.md` đang neo vào tiếp tục resolvable sau khi cấu trúc tài liệu được cải tổ, để tôi không bị "vỡ ngữ cảnh" giữa chừng.

#### Acceptance Criteria

1. THE Blueprint_System SHALL ensure that the four AGENTS.md Anchors `docs/architecture/PROJECT_CONTEXT.md`, `docs/architecture/MODULES.md`, `docs/business/BUSINESS_RULES.md`, and `docs/modules/` remain resolvable after migration.
2. THE Blueprint_System SHALL choose between two strategies recorded in an ADR before any documentation file move: strategy A keeps canonical content at the legacy paths and mirrors or links from the new structure; strategy B moves canonical content to the new paths and leaves redirect stubs at the legacy paths plus an updated `AGENTS.md` in the same change set.
3. WHERE strategy B is chosen, THE Blueprint_System SHALL require each redirect stub to declare `status: superseded`, a `superseded-by` front-matter key pointing to the new path, and a body containing a single Markdown link to that path.
4. WHEN `AGENTS.md` is updated as part of strategy B, THE Blueprint_System SHALL update the four anchor paths atomically with the file moves in the same commit.
5. IF a documentation file move would leave one of the AGENTS.md Anchors unresolvable, THEN THE Blueprint_System SHALL block the file move entirely until either a redirect stub exists at the legacy path or `AGENTS.md` is updated within the same change set.

### Requirement 15: Brief Source Fidelity

**User Story:** Là một product owner, tôi muốn mỗi yêu cầu chức năng có thể truy ngược về nguyên văn dòng Brief đã sinh ra nó, để mọi sai lệch giữa sản phẩm và Brief đều được nhận diện chứ không bị che lấp.

#### Acceptance Criteria

1. THE Blueprint_System SHALL store the verbatim Vietnamese Brief in `docs/01-requirements/functional/_brief-source.md` and SHALL forbid edits to that file outside of an explicit Brief revision recorded as a new dated section.
2. THE Blueprint_System SHALL require every R-* under `docs/01-requirements/functional/` to declare a `source quote` field whose value is a verbatim excerpt from `_brief-source.md`.
3. WHEN an R-* deviates from its `source quote` (for example by adding a constraint, removing scope, or reinterpreting a noun), THE Blueprint_System SHALL require a `GAP-*` entry in `docs/09-governance/gap-register.md` linking the R-* to the deviation.
4. IF a Brief bullet contains a duplicated phrase or an internal contradiction (for example the duplicated "Receive notifications from shipper" line in the Retailer section, or the Retailer "update business license and farm info" wording), THEN THE Blueprint_System SHALL preserve the duplication or contradiction verbatim and SHALL annotate the affected R-* with an inline `[AMBIGUITY: <description>]` marker as defined in Requirement 3.
5. WHERE the Brief is silent on a behavior that the codebase already exhibits, THE Blueprint_System SHALL either add a new R-* with `status: planned` and a `source quote` of `[BRIEF-SILENT]`, or open a `GAP-*` entry, but SHALL NOT silently document the behavior as if it came from the Brief.

### Requirement 16: Non-Goals and Implementation Boundary

**User Story:** Là một developer đang đọc spec, tôi muốn biết rõ những gì spec này **không** làm, để tôi không vô tình mở rộng phạm vi và làm trễ migration.

#### Acceptance Criteria

1. THE Blueprint_System SHALL declare in `docs/00-overview/non-goals.md` that this spec does not modify any file under `backend/src/`, `frontend/src/`, `blockchain/contracts/`, `deploy/`, or `.github/workflows/` during the requirements and design phases.
2. THE Blueprint_System SHALL allow exactly two code-adjacent edits during the tasks phase: an amendment to the root `AGENTS.md` per Requirement 12, and the addition of `.github/PULL_REQUEST_TEMPLATE.md` based on `docs/09-governance/pull-request-template.md`.
3. THE Blueprint_System SHALL declare in `non-goals.md` that the implementation of `docs:check`, `docs:trace`, `docs:lint`, and any CI hard-enforcement is out of scope for this spec and is the subject of a named follow-up spec.
4. IF a task in `tasks.md` proposes a code change outside the two edits listed above, THEN THE Blueprint_System SHALL require the task to be moved to a follow-up spec.
