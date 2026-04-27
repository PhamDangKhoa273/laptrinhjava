# BICAP Security Model

## Authentication

- BICAP uses stateless JWT authentication.
- Authenticated users are represented by `CustomUserPrincipal`.
- Protected APIs require a valid bearer token unless explicitly documented as public.

## Role-Based Access Control

Server-side RBAC is enforced with `@PreAuthorize` and service-level checks.

Core roles:

- `ADMIN`
- `FARM`
- `RETAILER`
- `SHIPPING_MANAGER`
- `DRIVER`
- Guest/public user

## Ownership Isolation

BICAP follows deny-by-default ownership rules:

- Farm users may access only their own farm, seasons, batches, IoT alerts, and farm-owned operations.
- Retailers may access only their own orders and delivery confirmations.
- Drivers may access only assigned shipments.
- Shipping Managers may manage logistics flows according to business scope.
- Admins may access governance/support functions.

## IoT Security

IoT ingest is protected by role and ownership:

- `FARM` can submit readings only for batch/season under their own farm.
- `ADMIN` can submit/support readings for governance and recovery use cases.
- Cross-farm ingest is rejected before `SensorReading` is saved.
- Optional gateway identity fields (`deviceCode`, `apiKey`, `gatewayTimestamp`) allow production IoT gateways to prove device origin.
- If a device key is supplied, it must match the expected farm/device key contract or ingest is rejected.

## Traceability Proof Boundary

Business services use `TraceabilityProofService` as the proof contract. The active implementation is `VeChainTraceabilityProofService`, which delegates low-level VeChainThor commit/track operations to `VeChainProofService`.

Benefits:

- Business code is not coupled directly to low-level blockchain clients.
- VeChainThor is clearly the official production proof implementation.
- Legacy/generic blockchain helpers can remain isolated behind the proof boundary.

## Public Endpoints

Public endpoints are intentionally limited to guest-safe information:

- marketplace/search/content
- public trace/QR views
- season export trace lookup

Public trace responses should not expose:

- phone/email/private owner data
- payment data
- internal admin notes
- private shipment reports
- private keys or raw secrets

## Blockchain Key Policy

- VeChainThor private keys must come from environment/secret configuration.
- Production must not use demo/dev private keys.
- Private keys must never be returned in API responses or logs.
- Admin governance may show transaction status, tx hash, retry state, and public proof metadata only.

## Upload and Media Policy

- Public trace media can be public only when intentionally attached to traceability evidence.
- Licenses, private proofs, and operational attachments should remain owner/admin scoped.
- File paths must not be constructed from untrusted raw input without normalization.

## Payment Callback Policy

- Payment callbacks should verify HMAC/signature.
- Callback handling should be idempotent.
- Replay and malformed signatures should be rejected.

## Verification Evidence

- Backend security/service tests pass.
- Frontend route/RBAC tests pass.
- IoT ownership tests were added to reject cross-farm ingest.
