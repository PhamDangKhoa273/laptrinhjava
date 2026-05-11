# Phase 8 - Production Hardening (BICAP)

Last updated: 2026-04-26 — reflects Phases 3, 6, and 7 verification.

## What is implemented

### Redis cache and shared runtime state

- `docker-compose.yml` and `docker-compose.prod.yml` include `redis:7.4-alpine`.
- Backend supports Redis cache through:
  - `spring-boot-starter-cache`
  - `spring-boot-starter-data-redis`
  - `@EnableCaching` in `com.bicap.core.config.CacheConfig`
- Production Compose uses Redis healthchecks.
- Redis remains the shared path for cache and rate-limit state.

### Observability

- Spring Boot Actuator is present.
- Configurable endpoints:
  - `/actuator/health`
  - `/actuator/health/readiness`
  - `/actuator/health/liveness`
  - `/actuator/info`
  - `/actuator/metrics`
  - `/actuator/prometheus`
- Docker Compose healthchecks use backend readiness.
- K8s backend probes use readiness/liveness endpoints.

### Rate limiting

- `RateLimitFilter` is enabled in `SecurityConfig`.
- Defaults are configurable:
  - `app.rate-limit.max-requests`
  - `app.rate-limit.window-seconds`
- Production template defaults to 60 requests / 60 seconds.

### CORS and security config hardening

- CORS is centralized in `SecurityConfig` using `app.cors.allowed-origins`.
- Production env template requires exact production origins.
- Frontend nginx adds security headers:
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`

### Secrets hardening

- `JwtTokenProvider` fails fast if `APP_JWT_SECRET` is missing or too short.
- `.env.prod.example` lists required secrets with placeholders only.
- K8s includes example Secret and ConfigMap templates with no real secret material.

### Docker / deployment hardening

- Production Compose includes healthchecks for MySQL, Redis, backend, and frontend.
- Backend is internal-only in production Compose via `expose: 8080`.
- Frontend/nginx is the public edge and proxies `/api/` to backend.
- Frontend nginx exposes `/healthz` for lightweight health checks.
- Backend Docker image includes container-aware JVM defaults.
- Frontend Docker build uses `npm ci --legacy-peer-deps` for lockfile reproducibility.

### Kubernetes readiness

- Backend Deployment includes readiness/liveness probes and CPU/memory budgets.
- Redis Deployment includes readiness/liveness probes and CPU/memory budgets.
- Backend HPA scales from 2 to 6 replicas.

## Verified commands

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.prod.example config
docker compose --env-file .env.local config
npm run test
npm run build
.\mvnw.cmd -q "-Dtest=AuthServiceTests,ShipmentServiceAuthorizationTests,MediaControllerAuthorizationTests,DriverServiceTests,FarmServiceTests,OrderServiceTests" test
```

Status: **PASS** on 2026-04-26.

## Still environment-owned

- TLS/HTTPS termination at ingress, load balancer, or host reverse proxy.
- Real secret injection from a secret manager.
- Managed MySQL/Redis or host volume backup automation.
- Centralized logs, traces, dashboards, and alert routing.
- Full cloud deployment proof and production traffic benchmark evidence.
