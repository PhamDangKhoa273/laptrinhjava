---
title: Entity Relationships
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# Entity Relationships

Cross-entity relationships and module dependencies. Entity definitions in [`entities.md`](entities.md). Mermaid diagrams use plain `classDiagram` per design D14.

## Entity Relationship Diagram

```mermaid
classDiagram
    User "1" -- "*" UserRole
    Role "1" -- "*" UserRole
    User "1" -- "*" Farm : owns
    User "1" -- "*" Order : places (retailer)

    Farm "1" -- "1" FarmApplication
    Farm "1" -- "*" Season
    Farm "1" -- "*" Batch
    Farm "1" -- "*" Listing
    Farm "1" -- "*" FarmSubscription
    Farm "1" -- "*" SensorReading
    Farm "1" -- "*" IoTAlert

    Season "1" -- "*" CultivationProcess
    Season "1" -- "*" Batch
    Batch "1" -- "*" Listing
    Listing "1" -- "*" Order

    Order "1" -- "*" OrderDeposit
    Order "1" -- "1" Shipment
    Order "1" -- "*" Contract

    Shipment "1" -- "*" ShipmentCheckpoint
    Shipment "1" -- "1" Driver : assigned
    Shipment "1" -- "1" Vehicle : assigned

    FarmSubscription "1" -- "*" SubscriptionPayment
    ServicePackage "1" -- "*" FarmSubscription

    SensorReading "1" -- "0..1" IoTAlert

    BlockchainTransaction -- Season : refers
    BlockchainTransaction -- CultivationProcess : refers
    BlockchainTransaction -- Batch : refers

    Notification -- User : delivered to
    Report -- User : submitted by
    Media -- Shipment : proof attachment
    Media -- Listing : product photo
    AuditLog -- User : actor
```

## Module Dependencies

Direction: arrow source `depends-on` arrow target. Cross-cutting `common` module is the bottom layer. Each module's `depends-on` field in [`../04-modules/`](../04-modules/) MUST match this diagram.

```mermaid
flowchart TB
    common[common<br/>cross-cutting]:::base

    auth[auth] --> common
    user[user] --> auth
    user --> common

    farm[farm] --> common
    farm --> batch[batch]
    farm --> season[season]
    farm --> listing[listing]
    farm --> contract[contract]
    farm --> shipment[shipment]
    farm --> iot[iot]
    farm --> vechain[vechain]
    farm --> subscription[subscription]

    retailer[retailer] --> common
    retailer --> listing
    retailer --> order[order]
    retailer --> contract
    retailer --> shipment
    retailer --> product[product]
    retailer --> vechain

    season --> farm
    season --> batch
    season --> vechain
    season --> iot

    batch --> product
    batch --> season
    batch --> vechain

    listing --> product
    listing --> farm
    listing --> batch

    order --> listing
    order --> retailer
    order --> farm
    order --> shipment
    order --> contract

    shipment --> order
    shipment --> logistics[logistics]
    shipment --> farm
    shipment --> retailer
    shipment --> media[media]

    logistics --> shipment

    iot --> farm
    iot --> batch
    iot --> season

    vechain --> common

    traceability[traceability] --> vechain
    traceability --> iot
    traceability --> batch
    traceability --> season
    traceability --> listing
    traceability --> shipment

    discovery[discovery] --> listing
    discovery --> product
    discovery --> content[content]

    content --> media

    media --> common

    contract --> farm
    contract --> retailer
    contract --> order

    product --> common

    subscription --> farm

    analytics[analytics] --> common

    admin[admin] --> user
    admin --> farm
    admin --> retailer
    admin --> logistics
    admin --> product
    admin --> content
    admin --> analytics
    admin --> vechain
    admin --> subscription

    classDef base fill:#e5e7eb,stroke:#374151
```

## Cross-Module Relationships Summary

| From module | To module | Nature |
|---|---|---|
| farm | season | one-to-many; farm owns seasons |
| farm | batch | one-to-many; farm owns batches |
| farm | listing | one-to-many; farm publishes listings |
| farm | iot | one-to-many; sensor readings per farm |
| season | batch | one-to-many; season produces batches |
| season | vechain | proof commit on season events |
| batch | product | many-to-one; batch references catalog product |
| listing | order | one-to-many; listings receive orders |
| order | shipment | one-to-one; each order one shipment |
| shipment | logistics | many-to-one; shipping manager owns logistics |
| shipment | media | one-to-many; proof images per shipment |
| iot | farm | many-to-one; readings tied to farm |
| traceability | vechain, iot, batch, season, listing, shipment | facade; aggregates trace data |
| admin | every module | governance writes |
| common | (none) | provides notification, audit, observability primitives |

## Cardinality Notation

- `1` — exactly one
- `*` — zero or more
- `1..*` — one or more
- `0..1` — zero or one (optional)

## Lifecycle Coupling

State machines are not tightly coupled across entities, but several transitions trigger events listened by other modules:

- `STM-SHP-T06` (Shipment CONFIRMED) → fires `STM-ORD-T06` (Order DELIVERED)
- `STM-ORD-T04` (Order REJECTED) → fires deposit refund job → eventually `STM-ORD-T08` (REFUNDED)
- `STM-SEA-T02` (Season COMMITTED) → updates `season.blockchainTxHash`; consumed by traceability/listing modules
- `STM-FRMAPP-T04` (Farm SUSPENDED) → enforces `BR-FRM-030` for all farm-write actions
