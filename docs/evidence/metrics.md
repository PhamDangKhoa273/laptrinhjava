# Metrics

Last updated: 2026-04-26.

## Verified commands

| Area | Command | Result |
| --- | --- | --- |
| Frontend tests | `npm run test` | PASS |
| Frontend build | `npm run build` | PASS |
| Backend targeted tests | `.\mvnw.cmd -q "-Dtest=AuthServiceTests,ShipmentServiceAuthorizationTests,MediaControllerAuthorizationTests,DriverServiceTests,FarmServiceTests,OrderServiceTests" test` | PASS |
| Production Compose config | `docker compose -f docker-compose.prod.yml --env-file .env.prod.example config` | PASS |
| Local Compose config | `docker compose --env-file .env.local config` | PASS |

## Functional evidence

- API coverage includes lifecycle controls for users, farms, products, categories, packages, process steps, drivers, and vehicles.
- Public marketplace and trace routes are browser-smoke verified from Phase 6.
- Protected route unauthenticated redirects are browser-smoke verified from Phase 6.
- Role route isolation is documented in the role matrix artifact.

## Security evidence

- IDOR checks: shipment/order/subscription service boundaries.
- Payment replay/idempotency checks: order deposit and subscription callbacks.
- Password/reset/session checks: change password, reset token, refresh session behavior.
- Centralized CORS, rate limiting, and JWT secret fail-fast are implemented.

## Deployment evidence

- Production Compose includes MySQL, Redis, backend, and frontend healthchecks.
- Frontend nginx includes `/healthz` and baseline security headers.
- Backend is internal-only in production Compose.
- K8s manifests include probes and resource budgets.

## Caveats

- Forecasting/prediction: not proven.
- Non-functional proof: config-render and build/test proof are present; full production benchmark/cloud scaling evidence is not included.
- Full logged-in role E2E: blocked pending seeded local demo accounts.
