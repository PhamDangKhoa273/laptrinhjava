---
title: ID Naming Conventions
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# ID Naming Conventions

Authoritative regex and allocation rules for the seven stable ID types used in BICAP docs. Every `ids:` value in a doc front-matter, every cross-reference (`related-r`, `related-br`, etc.), and every commit/PR mention must conform to the patterns below.

## Allocation Rules

Two allocation strategies, chosen per ID type:

- **stride-10** — IDs allocated as `010, 020, 030, ...`. Used for ID types that receive insertions over time (functional/non-functional requirements, business rules). Slots `011..019` are reserved for inserts between `010` and `020`. Once a slot is consumed it is never reused.
- **dense** — IDs allocated as `001, 002, 003, ...`. Used for append-only registers and chronological lists (state-machine transitions, API operations, ADRs, GAP entries).

**Insertion rule (both strategies):** allocate the next free number; never renumber. With stride-10, an insert between `R-FRM-010` and `R-FRM-020` consumes `R-FRM-011`, then `R-FRM-012`, etc. After 9 inserts in a slot, continue with the next stride number.

**Renaming forbidden.** An ID, once published, never changes. Replace by issuing a new ID + a deprecation entry in `gap-register.md`. See `doc-change-policy.md` for procedure.

## R-* — Functional Requirement (per role)

- **Pattern:** `^R-(ADM|FRM|RTL|DRV|SHM|GST)-\d{3}$`
- **Allocation:** stride-10
- **Owner file:** `docs/01-requirements/functional/<role>.md`

Valid examples: `R-ADM-010`, `R-FRM-220`. Invalid: `R-ADM-1` (3 digits required), `R-XYZ-010` (role not in enum).

## NFR-* — Non-Functional Requirement (per category)

- **Pattern:** `^NFR-(SCL|PRF|REL|SEC|BC)-\d{3}$`
- **Allocation:** stride-10
- **Owner file:** `docs/01-requirements/non-functional/<category>.md`

Categories: `SCL` (Scalability), `PRF` (Performance), `REL` (Reliability), `SEC` (Security), `BC` (Blockchain).

Valid: `NFR-SCL-010`, `NFR-BC-020`. Invalid: `NFR-XYZ-010`, `NFR-SCL-10` (3 digits).

## BR-* — Business Rule (per domain)

- **Pattern:** `^BR-[A-Z]+-\d{3}$`
- **Allocation:** stride-10
- **Owner file:** `docs/02-domain/business-rules.md` (single canonical file)

Common domains: `ORD` (Order), `SHP` (Shipment), `SEA` (Season), `IOT`, `FRM` (Farm), `SUB` (Subscription), `FRMAPP` (Farm Approval), `RTL` (Retailer), `AUT` (Auth), `TRC` (Trace), `ADM` (Admin).

Valid: `BR-FRM-010`, `BR-IOT-020`. Invalid: `BR-frm-010` (uppercase required), `BR--010` (domain required).

**Atomicity rule:** each BR-* statement contains exactly one testable assertion. A statement joining two assertions with `AND` must be split into two BR-* entries.

## STM-* — State Machine Transition

- **Pattern:** `^STM-[A-Z]+-T\d{2}$`
- **Allocation:** dense
- **Owner file:** `docs/02-domain/state-machines/<entity>.md` (one file per entity)

Common domains: `SHP`, `ORD`, `SEA`, `FRMAPP`, `SUB`.

Valid: `STM-SHP-T01`, `STM-ORD-T07`. Invalid: `STM-SHP-1` (T prefix required), `STM-SHP-T100` (2 digits).

## API-* — Endpoint Identifier

- **Pattern:** `^API-[A-Z]+-\d{3}$`
- **Allocation:** dense
- **Owner file:** `docs/05-api/openapi.yaml` (operations, with `x-doc-id` extension)

Modules: `AUT`, `ORD`, `SHM`, `ADM`, `FRM`, `RTL`, `DRV`, `GST` (matches role/module short codes).

Valid: `API-AUT-001`, `API-ORD-004`. Invalid: `API-auth-001` (uppercase).

Each `API-*` must correspond to exactly one OpenAPI `operationId`. The OpenAPI extension `x-doc-id: API-<MOD>-<NNN>` is mandatory on the operation.

## ADR-* — Architecture Decision Record

- **Pattern:** `^ADR-\d{3}$`
- **Allocation:** dense
- **Owner file:** `docs/03-architecture/adrs/ADR-<NNN>-<slug>.md`

Valid: `ADR-001`, `ADR-006`. Invalid: `ADR-1` (3 digits), `ADR-001-modular-monolith` (file slug, not the ID).

ADR status lifecycle: `proposed → accepted | rejected`; `accepted → superseded` (only via a new ADR with `supersedes:` reference).

## GAP-* — Gap Register Entry

- **Pattern:** `^GAP-\d{3}$`
- **Allocation:** dense
- **Owner file:** `docs/09-governance/gap-register.md` (rows in a single table)

Range reservation:
- `GAP-001..050` — reserved for blueprint-creation and immediate follow-up specs
- `GAP-051+` — runtime-discovered gaps

Valid: `GAP-001`, `GAP-042`. Invalid: `GAP-1`, `GAP-A01`.

## RBAC Cell Grammar

Used inside `docs/06-security/rbac-matrix.md`:

```
cell-value := "allow" | "deny" | conditional
conditional := "conditional:" br-id ( "&" br-id )*
br-id := "BR-" domain "-" digit{3}
```

- **Pattern:** `^(allow|deny|conditional:BR-[A-Z]+-\d{3}(&BR-[A-Z]+-\d{3})*)$`
- AND-only semantics. OR/NOT requires either splitting the resource into multiple rows or opening a `GAP-*`.

Valid: `allow`, `deny`, `conditional:BR-FRM-010`, `conditional:BR-FRM-010&BR-FRM-020&BR-FRM-030`. Invalid: `conditional:BR-FRM-010,BR-FRM-020` (comma not allowed), `conditional:BR-FRM-010|BR-FRM-020` (OR not allowed).

## File Naming

- **Pattern:** `^[a-z0-9][a-z0-9-]*\.md$`
- kebab-case only. No spaces, no underscores (except templates like `_TEMPLATE.md`, `_brief-source.md` which are exempt).

Valid: `farm-manager.md`, `rbac-matrix.md`, `_TEMPLATE.md`. Invalid: `FarmManager.md`, `farm_manager.md`.

## Cross-Reference Format

When a doc references another ID, use the bare ID:

- ✅ `Owns: [R-FRM-010, R-FRM-020]`
- ✅ `related-br: BR-FRM-010, BR-FRM-020`
- ❌ `Owns: [R-FRM-010 (Farm Manager Login)]` — title in cross-reference is forbidden

## Worked Insertion Examples

- `R-FRM-010..R-FRM-220` populated. New Brief bullet inserted between bullets 3 and 4 → next free slot is `R-FRM-031`. Do not renumber `R-FRM-040..220`.
- `BR-ORD-010..030` populated. New rule splitting `BR-ORD-020` per atomicity rule → existing `BR-ORD-020` is deprecated via gap-register entry, two new `BR-ORD-040, BR-ORD-050` allocated.
- `ADR-001..005` populated. New decision needed → `ADR-006` (timeline order, not topic order).

## Validation

`docs:lint` (stub-then-implement, see design D13) validates these rules. Until full implementation lands, the doc-change-policy enforces them via PR review.
