# BICAP Module Map

This is the root index for BICAP's modular architecture.

## Architecture Type

BICAP uses a **Modular Monolith**:

- One deployable backend application.
- Clear bounded-context modules under `backend/src/main/java/com/bicap/modules`.
- Shared infrastructure under `backend/src/main/java/com/bicap/core`.
- Role-based frontend workspaces under `frontend/src/pages` and `frontend/src/routes`.

## Backend Modules

| Module | Package | Documentation |
|---|---|---|
| Auth | `modules/auth` | [auth.md](../modules/auth.md) |
| User/RBAC | `modules/user` | [user-rbac.md](../modules/user-rbac.md) |
| Admin | `modules/admin` | [admin.md](../modules/admin.md) |
| Farm | `modules/farm` | [farm.md](../modules/farm.md) |
| Retailer | `modules/retailer` | [retailer.md](../modules/retailer.md) |
| Product/Batch | `modules/product`, `modules/batch` | [product-batch.md](../modules/product-batch.md) |
| Season/Cultivation | `modules/season` | [season-cultivation.md](../modules/season-cultivation.md) |
| Listing/Order/Contract | `modules/listing`, `modules/order`, `modules/contract` | [listing-order-contract.md](../modules/listing-order-contract.md) |
| Logistics/Shipment/Driver | `modules/logistics`, `modules/shipment` | [logistics-shipment-driver.md](../modules/logistics-shipment-driver.md) |
| Subscription/Payment | `modules/subscription` | [subscription-payment.md](../modules/subscription-payment.md) |
| Content/Media | `modules/content`, `modules/media` | [content-media.md](../modules/content-media.md) |
| Analytics/Discovery | `modules/analytics`, `modules/discovery` | [analytics-discovery.md](../modules/analytics-discovery.md) |
| Traceability/VeChain/IoT | `modules/vechain`, `modules/iot` | [traceability-vechain-iot.md](../modules/traceability-vechain-iot.md) |
| Security/Observability | `core/security`, `core`, actuator config | [security-observability.md](../modules/security-observability.md) |

## Frontend Role Workspaces

| Role | Route | Primary page/doc |
|---|---|---|
| Admin | `/dashboard/admin/control-center` | [admin.md](../modules/admin.md) |
| Farm | `/dashboard/farm` | [farm.md](../modules/farm.md) |
| Retailer | `/dashboard/retailer` | [retailer.md](../modules/retailer.md) |
| Shipping Manager | `/dashboard/shipping-manager` | [logistics-shipment-driver.md](../modules/logistics-shipment-driver.md) |
| Driver | `/dashboard/driver` | [logistics-shipment-driver.md](../modules/logistics-shipment-driver.md) |
| Guest | `/dashboard/guest` | [guest-marketplace.md](../modules/guest-marketplace.md) |

## Cross-Cutting Files

- `docs/architecture/PROJECT_CONTEXT.md` explains overall purpose and stack.
- `docs/business/BUSINESS_RULES.md` lists global business rules.
- `AGENTS.md` tells future agents how to work in this repository.
- `docs/agents/CONTEXT.md` defines agent context.
- `docs/agents/SKILLS.md` defines local implementation skills.
