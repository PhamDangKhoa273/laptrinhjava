# Deployment & scaling path

BICAP can run as a Docker Compose stack for single-host deployments or as Kubernetes workloads for managed environments.

## Local stack

```powershell
docker compose --env-file .env.local up --build
```

Local services:

- MySQL
- Redis
- VeChainThor solo node
- Spring Boot backend
- Nginx-served frontend

Redis is active for cache, rate limiting, and server-side shared state.

## Production target

Recommended production topology:

- Frontend/nginx is the public HTTP edge.
- Backend is internal-only and reached through `/api/` proxy or a dedicated API gateway.
- MySQL is backed by a persistent volume or managed database.
- Redis is mandatory for shared cache/rate-limit state.
- TLS is terminated by a load balancer, ingress, or host reverse proxy.
- Environment variables are injected from a secrets manager or `.env.prod` on the host.

## Required files

- `.env.prod` copied from `.env.prod.example` with real values.
- `docker-compose.prod.yml` for single-host deployments.
- `deploy/PRODUCTION_CHECKLIST.md` for release readiness.
- `deploy/k8s/backend-config.example.yaml` and `deploy/k8s/backend-secrets.example.yaml` for Kubernetes adaptation.

## Compose deployment flow

Render and validate config before starting services:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.prod config
```

Start production stack:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Inspect health:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

## Health endpoints

- Frontend: `/healthz`
- Backend readiness: `/actuator/health/readiness`
- Backend liveness: `/actuator/health/liveness`
- Backend aggregate health: `/actuator/health`

If backend is proxied through frontend nginx, API health may be checked at `/api/actuator/health/readiness` depending on proxy policy.

## Kubernetes path

The `deploy/k8s/` folder contains baseline manifests for:

- Backend Deployment with probes and resource budgets
- Backend Service
- Backend HorizontalPodAutoscaler
- Redis Deployment with probes and resource budgets
- Example backend ConfigMap and Secret templates

Before applying to a real cluster:

1. Replace image tags with immutable registry tags.
2. Create real secrets using your secret manager.
3. Add a MySQL managed service or StatefulSet according to environment policy.
4. Add ingress/TLS configuration.
5. Tune CPU/memory requests for observed traffic.

## Scaling path

- Compose: keep one backend by default; scale only behind a load balancer or gateway.
- Kubernetes: increase Deployment replicas or let HPA scale from 2 to 6 replicas.
- Redis remains shared state for cache and rate limiting.
- Database remains externalized; do not embed production data inside app containers.

## Backup and restore

- Schedule MySQL backups with host cron, cloud backup, or managed DB snapshots.
- Back up uploaded media if using local `backend_uploads` volume.
- See `backup-cron.example` for host schedule shape.
- Periodically test restore to a non-production environment.

## Rollback guidance

- Tag backend and frontend images with immutable versions.
- Keep the last known-good image tag documented before rollout.
- For Compose, update image tags and run:

```powershell
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

- For Kubernetes, use `kubectl rollout undo deployment/bicap-backend` or redeploy the previous image tag.

## Evidence to show reviewers

- Production compose file renders cleanly.
- Frontend and backend builds pass.
- Healthchecks are configured for MySQL, Redis, backend, and frontend.
- K8s manifests include probes, resource budgets, and HPA.
- `PRODUCTION_CHECKLIST.md` is reviewed before release.
