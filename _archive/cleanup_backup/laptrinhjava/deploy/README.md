# Deployment & scaling path

## Local
- `docker compose up --build`
- Uses MySQL, Redis, backend, frontend
- Redis is active for cache, rate-limit, and session-related server state

## Production target
- A single VM or container host running Docker Compose, or Kubernetes via the manifests in `deploy/k8s/`
- Environment variables are injected from a secrets manager or `.env.prod` on the host
- Redis is mandatory and shared by backend replicas

## Scaling path
- Scale backend horizontally: `docker compose up --scale backend=2` for local simulation, or increase replicas in K8s
- Put backend behind a load balancer / ingress
- Redis remains the shared state for rate limiting and cache
- Database remains externalized, not embedded in the app container

## Health endpoints
- `/actuator/health` for health
- `/actuator/health/readiness` for readiness
- `/actuator/health/liveness` for liveness

## Evidence to show reviewers
- Docker Compose local stack
- Redis service in the runtime path
- K8s manifest with probes and replica count
- Production compose file with env-only secrets
