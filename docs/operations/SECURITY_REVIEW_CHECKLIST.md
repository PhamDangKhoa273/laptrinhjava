# Security Review Checklist (BICAP)

Last updated: 2026-04-26 — Phase 8–9 final evidence pass.

## Secrets

- [ ] Real `APP_JWT_SECRET` is set, >= 32 chars, unique per environment.
  - Evidence template: `.env.prod.example` includes placeholder only.
- [x] No real production secrets are intentionally committed in production templates.
- [ ] Blockchain private key is injected via secret manager or protected host env in production.
  - Status: template-only; real key handling remains deployment-owned.

## Auth / Session

- [x] Change password rejects bad current password and logs auth failure.
  - Evidence: `AuthServiceTests.changePassword_shouldRejectBadCurrentPasswordAndKeepSessionsActive`.
- [x] Change password hashes the new password and revokes active refresh sessions.
  - Evidence: `AuthServiceTests.changePassword_shouldHashNewPasswordAndRevokeActiveSessions`.
- [x] Password reset token expiry and consumed-token checks are enforced in `AuthService.resetPassword`.
- [x] Password reset request throttling is enforced by email + client IP.
- [x] Refresh tokens are server-side tracked and rotated on `/auth/refresh`.

## Authorization / IDOR

- [x] Shipment direct-object reads reject unrelated authenticated users even when IDs are guessed.
  - Evidence: `ShipmentServiceAuthorizationTests.getById_shouldRejectUnrelatedAuthenticatedUserEvenWhenShipmentIdIsKnown`.
- [x] Shipment eligible-order listing rejects non-shipping roles at the service boundary.
  - Evidence: `ShipmentServiceAuthorizationTests.getEligibleOrdersForShipment_shouldRejectNonShippingRoleAtServiceBoundary`.
- [x] Order direct-object reads reject unrelated retailer access.
  - Evidence: `OrderServiceTests.getOrderById_shouldRejectRetailerWithoutOwnership`.
- [x] Subscription payments enforce owner/admin access in service reads and creates.
  - Evidence: `SubscriptionPaymentService.getById`, `SubscriptionPaymentServiceAcceptanceTests.create_shouldRejectNonOwnerAndNonAdmin`.
- [ ] Continue expanding controller-level MockMvc IDOR coverage for every route in release CI.

## Payment replay / idempotency

- [x] Order deposit gateway callbacks are HMAC verified and duplicate callbacks are idempotent.
  - Evidence: `OrderServiceTests.verifyDepositGatewayCallback_shouldBeIdempotentForDuplicateCallback`.
- [x] Subscription gateway callbacks are HMAC verified.
  - Evidence: `SubscriptionPaymentServiceTests.verifyGatewayCallback_shouldActivateOnlyWithValidHmac`.
- [x] Subscription gateway callback replay with a reused gateway transaction ID but tampered payload is rejected.
  - Evidence: `SubscriptionPaymentServiceTests.verifyGatewayCallback_shouldRejectDuplicateGatewayIdWithTamperedPayload`.

## Transport

- [ ] TLS at ingress / load balancer / host reverse proxy.
  - Status: deployment-owned. Docker/nginx config is ready behind TLS termination but does not terminate HTTPS directly.
- [x] Secure cookies reviewed as N/A for current pure token-auth flow.

## CORS

- [x] `app.cors.allowed-origins` is configurable and required in production Compose.
  - Evidence: `.env.prod.example`, `docker-compose.prod.yml`, `SecurityConfig`.
- [x] No wildcard production origin is present in the production env template.

## Headers

- [x] Frontend/nginx sets baseline security headers.
  - Evidence: `frontend/nginx.conf` includes `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`.
- [ ] CSP/HSTS final policy remains ingress/reverse-proxy owned.
  - Recommended: add HSTS where TLS is terminated; add CSP after validating external asset needs.

## Data validation

- [x] Password DTO constraints enforce non-blank, minimum length, uppercase/lowercase/digit.
- [x] Payment callback amount/currency/subscription/transaction reference mismatch checks are enforced.
- [x] Shipment issue type enum allowlist is enforced.

## Logging / Observability

- [x] Auth success/failure audit logs are covered for password change.
- [x] Payment state changes write audit logs.
- [x] Actuator endpoints are configurable by env.
  - Evidence: `MANAGEMENT_ENDPOINTS_EXPOSE` and `MANAGEMENT_HEALTH_DETAILS` in production env/compose.
- [ ] Final live production log review remains deployment-owned.

## Dependency hygiene

- [x] Frontend dependency audit was run locally.
  - Evidence: `docs/FINAL_VERIFICATION_LOG.md`.
  - Result: no high/critical audit failure at `--audit-level=high`; 5 moderate vulnerabilities remain for a controlled dependency update pass.
- [ ] Add dependency vulnerability scan to release CI.

## Backups

- [x] MySQL backup strategy documented.
  - Evidence: `docs/backup-recovery-runbook.md`, `scripts/backup-db.ps1`, `deploy/backup-cron.example`.
- [x] Upload backup strategy documented.
  - Evidence: `docs/backup-recovery-runbook.md`, `scripts/backup-uploads.ps1`.
- [x] Redis persistence strategy documented.
  - Evidence: Redis AOF in Compose; runbook treats Redis as rebuildable cache/runtime state unless business semantics change.

## Phase verification commands

```powershell
npm run test
npm run build
.\mvnw.cmd -q "-Dtest=AuthServiceTests,ShipmentServiceAuthorizationTests,MediaControllerAuthorizationTests,DriverServiceTests,FarmServiceTests,OrderServiceTests" test
docker compose -f docker-compose.prod.yml --env-file .env.prod.example config
docker compose --env-file .env.local config
```

Status: **PASS** on 2026-04-26.
