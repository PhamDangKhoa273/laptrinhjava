# ARCHITECTURE

## Canonical stack
- Backend: Spring Boot + Maven wrapper
- Frontend: React + Vite
- Database: MySQL + Flyway migrations
- Cache / ops: Redis + Actuator
- Canonical blockchain path: VeChainThor

## Boundaries
- `backend/` is the main product application.
- `frontend/` is the user-facing web app.
- `blockchain/` is sandbox/internal demo only, not the main submission path.
- Docs/UI must describe VeChainThor as canonical and avoid overclaiming Hardhat/EVM as primary.

## Key domains
- Auth, user, farm, retailer, driver, logistics, listing, order, shipment, season, batch, subscription, content, notification, analytics, IoT, blockchain governance.

## Data / traceability
- Source of truth is the backend DB, with migration history via Flyway.
- Public guest discovery is backend-backed.
- Shipment/order exceptions are represented in domain state, not just UI copy.

## Non-functional posture
- Role-based access is enforced in backend.
- Idempotency and versioning are used on sensitive write paths.
- Build/test success is not live runtime proof.

## Evidence rule
- Any claim in docs must be backed by one of:
  - API route
  - UI route/component
  - test
  - build output
  - screenshot/evidence pack
