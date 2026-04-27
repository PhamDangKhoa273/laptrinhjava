# BICAP Project Context

## Mission

BICAP is a role-based agricultural supply-chain platform for managing farm production,
product traceability, marketplace listing, retailer ordering, shipment handoff, driver
proof, admin governance, and public/guest discovery.

## Architecture Decision

BICAP is implemented as a **Modular Monolith**.

This means the project deploys as a cohesive application, but internally separates domain
capabilities into modules with clear boundaries.

## Technical Stack

### Backend

- Java 21
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- Flyway migrations
- MySQL
- Actuator/Prometheus observability

### Frontend

- React
- Vite
- Vanilla CSS
- Role-based route protection
- Modular dashboard pages

### Integration

- VeChain trace/proof integration
- IoT event simulation/integration
- Media upload/content workflows

## Roles

| Role | Workspace | Primary responsibility |
|---|---|---|
| Admin | `/dashboard/admin/control-center` | Governance, users, operations, content, logistics, product oversight |
| Farm | `/dashboard/farm` | Farm profile, batches, seasons, QR export, marketplace publishing |
| Retailer | `/dashboard/retailer` | Discover listings, order, deposit, trace, report |
| Shipping Manager | `/dashboard/shipping-manager` | Shipment creation, assignment, tracking, driver/vehicle management |
| Driver | `/dashboard/driver` | Pickup, checkpoint, handover, proof, incident reports |
| Guest | `/dashboard/guest` | Marketplace browsing, public trace, announcements, education |

## Core Quality Bar

A change is not complete unless:

- RBAC behavior remains correct.
- Runtime does not crash on missing fallback data.
- Frontend tests/build pass for touched areas.
- Backend tests pass or targeted backend tests validate the module.
- Module docs stay synchronized with behavior.

## Documentation Map

- `docs/architecture/MODULES.md` is the module index.
- `docs/business/BUSINESS_RULES.md` is the cross-module rule catalog.
- `docs/modules/` contains one markdown spec per module.
- `docs/agents/` contains local agent context and working skills.
