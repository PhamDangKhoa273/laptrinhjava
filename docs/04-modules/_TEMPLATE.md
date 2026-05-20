---
title: Module — <Module Name>
ids: []
status: draft
last-reviewed: <YYYY-MM-DD>
language: bilingual
depends-on: []
---

# <Module Name>

## Purpose

<Vietnamese: business capability the module owns. 1-3 sentences.>

## Owns

- **R-\***: <list of R-IDs this module is the canonical owner of>
- **BR-\***: <list>
- **STM-\***: <list>

## Implements

- **Backend package**: `backend/src/main/java/com/bicap/modules/<module>/`
- **Controllers**: <FQN list>
- **Services**: <FQN list>
- **Entities**: <FQN list>
- **Repositories**: <FQN list>
- **Frontend pages**: `frontend/src/pages/<…>/`
- **Frontend services**: `frontend/src/services/<…>.js`

## Depends-on

- <other module names> (mỗi tên phải tồn tại trong `04-modules/`)

## API surface

- `API-<MOD>-<NNN>` → `operationId` trong [`../05-api/openapi.yaml`](../05-api/openapi.yaml)

## Tests

- `R-<ROLE>-<NNN>` → <relative test path>

## Open gaps

- `GAP-<NNN>` (link tới [`../09-governance/gap-register.md`](../09-governance/gap-register.md))
