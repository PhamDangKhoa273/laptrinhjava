---
title: Module — Index
ids: []
status: active
last-reviewed: 2026-05-16
language: bilingual
depends-on: []
---

# Module Index

Bản đồ 22 module backend của BICAP. Mỗi module có một file tài liệu duy nhất với template `_TEMPLATE.md`.

> Migrated from `docs/architecture/MODULES.md`. Legacy path becomes a redirect stub in tasks Stage 6 (S6.T5).

## Backend Modules

| Module | Package | Role workspaces | Doc |
|---|---|---|---|
| admin | `modules/admin` | Admin | [admin.md](admin.md) |
| analytics | `modules/analytics` | Admin | [analytics.md](analytics.md) |
| auth | `modules/auth` | All (login/register) | [auth.md](auth.md) |
| batch | `modules/batch` | Farm, Admin, Public trace | [batch.md](batch.md) |
| common | `modules/common` (cross-cutting) | All | [common.md](common.md) |
| content | `modules/content` | Admin, Guest | [content.md](content.md) |
| contract | `modules/contract` | Farm, Retailer, Admin | [contract.md](contract.md) |
| discovery | `modules/discovery` | Retailer, Guest, Public | [discovery.md](discovery.md) |
| farm | `modules/farm` | Farm | [farm.md](farm.md) |
| iot | `modules/iot` | Farm, Admin | [iot.md](iot.md) |
| listing | `modules/listing` | Farm, Retailer, Guest | [listing.md](listing.md) |
| logistics | `modules/logistics` | Shipping Manager, Driver | [logistics.md](logistics.md) |
| media | `modules/media` | All authenticated | [media.md](media.md) |
| order | `modules/order` | Retailer, Farm, Admin | [order.md](order.md) |
| product | `modules/product` | Admin, Farm, Public | [product.md](product.md) |
| retailer | `modules/retailer` | Retailer | [retailer.md](retailer.md) |
| season | `modules/season` | Farm | [season.md](season.md) |
| shipment | `modules/shipment` | Shipping Manager, Driver, Farm, Retailer | [shipment.md](shipment.md) |
| subscription | `modules/subscription` | Admin, Farm | [subscription.md](subscription.md) |
| traceability | `modules/traceability` | Public, All | [traceability.md](traceability.md) |
| user | `modules/user` | Admin (governance), All (self-profile) | [user.md](user.md) |
| vechain | `modules/vechain` | Cross-cutting (used by traceability, season, batch) | [vechain.md](vechain.md) |

## Frontend Role Workspaces

| Role | Route | Primary module doc |
|---|---|---|
| Admin | `/dashboard/admin/control-center` | [admin.md](admin.md) |
| Farm Manager | `/dashboard/farm` | [farm.md](farm.md) |
| Retailer | `/dashboard/retailer` | [retailer.md](retailer.md) |
| Shipping Manager | `/dashboard/shipping-manager` | [logistics.md](logistics.md) + [shipment.md](shipment.md) |
| Driver | `/dashboard/driver` | [logistics.md](logistics.md) + [shipment.md](shipment.md) |
| Guest | `/dashboard/guest` | [discovery.md](discovery.md) + [content.md](content.md) |

## Cross-Cutting Files

- [`../03-architecture/context.md`](../03-architecture/context.md) — system context
- [`../02-domain/business-rules.md`](../02-domain/business-rules.md) — atomic BR catalog
- [`../06-security/rbac-matrix.md`](../06-security/rbac-matrix.md) — authorization decisions
