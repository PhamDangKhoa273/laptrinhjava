---
title: Architecture — Deployment
ids: []
status: active
last-reviewed: 2026-05-16
language: en
---

# Architecture — Deployment

Deployment topology for local, staging, and production. Cross-references `deploy/`, `docker-compose.yml`, `docker-compose.prod.yml`, `deploy/k8s/`.

## Profiles

| Profile | Purpose | Compose file | Notes |
|---|---|---|---|
| `local` | Developer machine | `docker-compose.yml` | Includes VeChainThor solo node |
| `prebuilt` | CI / quick demo | `docker-compose.prebuilt.yml` | Uses pre-built images |
| `prod` | Live deployment | `docker-compose.prod.yml` + `deploy/k8s/` | Env-only secrets |

## Local Topology (docker-compose.yml)

5 containers wired with healthcheck-gated startup order:

1. `bicap-thor` (VeChainThor solo) — must reach `Healthy` first
2. `bicap-redis` — second
3. `bicap-mysql` — third
4. `bicap-backend` — depends on the 3 above
5. `bicap-frontend` — depends on backend

Ports:
- Frontend: `5173:80`
- Backend: `8080:8080`
- MySQL: `3307:3306`
- Redis: `6379:6379`
- VeChain: `8669:8669`

## Production Topology (deploy/k8s/)

Kubernetes manifests under `deploy/k8s/`:

- `backend-deployment.yaml` + `backend-hpa.yaml` (horizontal pod autoscaler)
- `backend-service.yaml`
- `backend-config.example.yaml` + `backend-secrets.example.yaml`
- `redis-deployment.yaml`

Backend is stateless → scales horizontally per `NFR-SCL-010` autoscaling thresholds (currently `[TBD]`, tracked in [`GAP-003`](../09-governance/gap-register.md)).

## Secrets Management

Per [`NFR-SEC-030`](../01-requirements/non-functional/security.md):

- Never hardcode in code or docs
- Load from environment variables in production
- Never log private signing keys
- Never return private keys in API responses or UI

Required env vars (see `.env.prod.example`):

```
APP_JWT_SECRET                 # 32+ chars
APP_SUBSCRIPTION_GATEWAY_SECRET
APP_ORDER_DEPOSIT_GATEWAY_SECRET
MYSQL_ROOT_PASSWORD
SPRING_DATASOURCE_PASSWORD
VECHAIN_THOR_DEV_PRIVATE_KEY   # production should use KMS-managed key
SPRING_MAIL_PASSWORD
APP_CORS_ALLOWED_ORIGINS
```

## Backup and Recovery

See [`../07-operations/runbook-backup.md`](../07-operations/runbook-backup.md). Targets pending [`GAP-005`](../09-governance/gap-register.md).

## Deployment Checklist

See [`../07-operations/runbook-deploy.md`](../07-operations/runbook-deploy.md) and `deploy/PRODUCTION_CHECKLIST.md`.

## Observability

Production exposes:

- `/actuator/health` (overall)
- `/actuator/health/readiness` and `/liveness` (probes)
- `/actuator/prometheus` (metrics scraping)

Grafana dashboard in `deploy/grafana-dashboard.json`.

See [`../07-operations/observability.md`](../07-operations/observability.md).
